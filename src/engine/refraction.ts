/**
 * The refraction engine.
 *
 * For every glass shape we ray-trace a displacement field through a convex
 * squircle bevel using Snell's law, bake it to an image, and hand it to an SVG
 * `feDisplacementMap`. Chromium can run that filter on the live backdrop
 * (`backdrop-filter: url(#…)`), which bends whatever sits behind the glass.
 * Elsewhere (Safari, Firefox) lenses refract a live copy of what's beneath
 * with the same field, as a normal filter in box units. Every engine also
 * gets a baked specular rim.
 */
import { useEffect } from 'react';
// Components reach the material through this module, so the tokens always load
// even when a bundler skips the barrel's side effects.
import '../styles/base.css';
import { clamp } from './spring';
import { mirrorBackdrop } from './mirror';

export type GlassKind = 'surface' | 'lens';

export interface GlassShape {
  /** `surface` bends the backdrop inward at the rim (bars, buttons, cards).
   *  `lens` is a thick droplet: magnifies, bends outward and splits colour. */
  kind?: GlassKind;
  /** Width of the curved rim in px. */
  bezel?: number;
  /** Optical depth of the glass in px; deeper bends more. */
  thickness?: number;
  /** Index of refraction. Glass ≈ 1.5. */
  ior?: number;
  /** Interior magnification (lens only). 1 = none, below 1 minifies. */
  zoom?: number;
  /** Horizontal magnification of a copied lens, when it differs from `zoom`
   *  (e.g. a switch knob thins the track without shortening it). */
  zoomX?: number;
  /** Chromatic split strength, 0–1. */
  dispersion?: number;
  /** Overall displacement multiplier. */
  strength?: number;
  /**
   * Rim stretch, 0–1 (lens only). Instead of pulling in light from past the
   * edge, the rim samples inward ever more steeply, so whatever sits under it
   * smears out to the edge in streaks: the thick-droplet look of iOS tab bars.
   */
  stretch?: number;
  /**
   * Margin (px) along the top and bottom of a lens that stays clear and
   * unbent, e.g. where a tab-bar lens rises past its bar: only the part over
   * the bar refracts, so the bar's edge isn't pulled into a second outline.
   */
  inset?: number;
  /**
   * Draw the lens from a live copy of `mirror` in every browser, not only
   * where backdrop refraction is missing. Needed for a minifying lens: a
   * backdrop filter can't see past the element's own edge. `'refract'` also
   * bends the copy at the rim where SVG filters run on elements (Chromium),
   * so content the rim draws in is styled like the rest of the copy.
   */
  copy?: boolean | 'refract';
}

interface Baked {
  filter: string;
  rim: string;
  /** Exact shape alpha (CSS mask for non-filter lenses): a crisp rim, like real glass. */
  inner: string;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const cache = new Map<string, Baked>();
let defs: SVGDefsElement | null = null;
let counter = 0;

function el<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number>) {
  const node = document.createElementNS(SVG_NS, name);
  for (const key in attrs) node.setAttribute(key, String(attrs[key]));
  return node;
}

function container(): SVGDefsElement {
  if (defs?.isConnected) return defs;
  const root = el('svg', { width: 0, height: 0, 'aria-hidden': 'true', 'data-liquid-glass-defs': '' });
  root.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  defs = el('defs', {});
  root.append(defs);
  document.body.append(root);
  return defs;
}

/** Only Chromium runs SVG filters inside `backdrop-filter`. */
export function canRefractBackdrop(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Chrom(e|ium)\/|Edg\//.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

/** Lateral shift (px) for light leaving the bevel, sampled across its width. */
function bevelProfile(bezel: number, thickness: number, ior: number) {
  const N = 256;
  const out = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = Math.max(0.002, i / (N - 1));
    const q = 1 - t;
    // Convex squircle: h(t) = (1 - (1 - t)^4)^(1/4)
    const base = 1 - q ** 4;
    const height = base ** 0.25;
    const slope = q ** 3 / Math.max(1e-4, base ** 0.75);
    const incident = Math.atan(slope);
    const refracted = Math.asin(Math.sin(incident) / ior);
    out[i] = Math.tan(incident - refracted) * thickness * (0.35 + 0.65 * height);
  }
  return (distance: number) => {
    if (distance < 0 || distance >= bezel) return 0;
    const f = (distance / bezel) * (N - 1);
    const i = Math.floor(f);
    const a = out[i];
    const b = out[Math.min(i + 1, N - 1)];
    return a + (b - a) * (f - i);
  };
}

function bake(width: number, height: number, radius: number, shape: Required<GlassShape>, pad = 0, simple = false, fringe = false, box = false): Baked {
  // `simple`: one displacement pass (edge bend + magnification baked into a
  // single map), no colour split. Safari's GPU filter path renders chained
  // displacement + arithmetic composites black, so its mirrors use this.
  // `pad` widens the baked canvas around the shape: mirrored backdrops need
  // room for light the rim bends in from beyond the glass's own edge.
  // `box`: every filter unit is a fraction of the filtered element's box.
  // WebKit only draws feImage maps and displacement scales right that way;
  // in px units it misplaces the map and renders a colour split as nothing.
  const W = width + pad * 2;
  const H = height + pad * 2;
  // Keep the bake under ~400k samples; the field is smooth so this is lossless enough.
  let density = Math.min(typeof devicePixelRatio === 'number' ? devicePixelRatio : 1, 2);
  while (W * H * density * density > 400_000 && density > 0.35) density *= 0.75;
  const cw = Math.max(1, Math.ceil(W * density));
  const ch = Math.max(1, Math.ceil(H * density));

  const lens = shape.kind === 'lens';
  const shift = bevelProfile(shape.bezel, shape.thickness, shape.ior);
  // Below 1 the lens minifies (iOS switch knobs show the track slightly smaller).
  const magnify = lens ? 1 - 1 / Math.max(0.5, shape.zoom) : 0;
  const direction = lens ? 1 : -1;

  const dx = new Float32Array(cw * ch);
  const dy = new Float32Array(cw * ch);
  const rimA = new Float32Array(cw * ch);
  const rimHue = new Float32Array(cw * ch);
  const inside = new Float32Array(cw * ch);
  // Where the rim compresses the backdrop hardest. feDisplacementMap samples
  // without filtering, so there the bent image steps and aliases; it gets a
  // touch of smoothing while the centre stays sharp.
  const zone = new Float32Array(cw * ch);
  let max = 0.0001;
  let maxX = 0.0001;
  let maxY = 0.0001;

  const hw = width / 2;
  const hh = height / 2;
  const px1 = 1 / density;
  // How much of the bend applies at a given height: all of it inside the band,
  // fading to none across ~3px into the clear top/bottom margins.
  const edge = hh - shape.inset;
  const band = (py: number) => {
    if (!shape.inset) return 1;
    const t = clamp((Math.abs(py) - (edge - 2)) / 3, 0, 1);
    return 1 - t * t * (3 - 2 * t);
  };

  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const px = ((x + 0.5) * W) / cw - W / 2;
      const py = ((y + 0.5) * H) / ch - H / 2;

      // Signed distance to a rounded rect (positive inside, from the edge).
      const qx = Math.abs(px) - (hw - radius);
      const qy = Math.abs(py) - (hh - radius);
      const ox = Math.max(qx, 0);
      const oy = Math.max(qy, 0);
      const len = Math.hypot(ox, oy);
      const d = radius - (len + Math.min(Math.max(qx, qy), 0));

      let nx: number;
      let ny: number;
      if (len > 0) {
        nx = (ox / len) * Math.sign(px);
        ny = (oy / len) * Math.sign(py);
      } else if (qx > qy) {
        nx = Math.sign(px);
        ny = 0;
      } else {
        nx = 0;
        ny = Math.sign(py);
      }

      const i = y * cw + x;
      // Stretch: the sample point moves inward by bezel·k·(1-u)², so at the
      // edge it barely moves while the rim sweeps across it (k = 0.5 holds
      // the image still at the very edge; more would fold it back).
      const u = d / shape.bezel;
      const s = (lens && shape.stretch > 0
        ? d >= 0 && u < 1
          ? -shape.bezel * shape.stretch * 0.5 * (1 - u) ** 2
          : 0
        : shift(d) * direction) * shape.strength * band(py);
      // Edge bend only; magnification runs as its own pass so colour
      // splits only where the glass actually curves.
      let vx = nx * s;
      let vy = ny * s;
      if (simple && magnify) {
        vx -= px * magnify * band(py);
        vy -= py * magnify * band(py);
      }
      dx[i] = vx;
      dy[i] = vy;
      const m = Math.max(Math.abs(vx), Math.abs(vy));
      if (m > max) max = m;
      if (Math.abs(vx) > maxX) maxX = Math.abs(vx);
      if (Math.abs(vy) > maxY) maxY = Math.abs(vy);

      inside[i] = clamp(d / px1 + 0.5, 0, 1);
      zone[i] = (d <= 0 ? 1 : clamp(1 - d / Math.max(1, shape.bezel), 0, 1) ** 1.3) * band(py);

      if (d >= -px1) {
        // Light falls from the upper left; Liquid Glass catches it on both
        // diagonal corners (direct + internally reflected).
        const facing = -(nx + ny) * Math.SQRT1_2;
        const light = 0.22 + 0.78 * Math.abs(facing) ** 2.2 * (facing > 0 ? 1 : 0.62);
        const line = Math.exp(-(((d - 0.55) / 0.55) ** 2));
        const inner = Math.exp(-((d / (shape.bezel * 0.55)) ** 2)) * 0.14;
        const edgeAA = clamp(d / px1 + 1, 0, 1);
        rimA[i] = clamp((line * (lens ? 0.95 : 0.7) + inner) * light * edgeAA, 0, 1);
        rimHue[i] = Math.atan2(ny, nx);
      }
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d')!;

  // In box units a displacement scale s moves x by s·W and y by s·H, so each
  // axis is encoded against its own side; in px both share one scale.
  const scale = box ? 2 * Math.max(maxX / W, maxY / H) : max * 2;
  const spanX = box ? (scale * W) / 2 : max;
  const spanY = box ? (scale * H) / 2 : max;
  const field = ctx.createImageData(cw, ch);
  for (let i = 0; i < cw * ch; i++) {
    const o = i * 4;
    field.data[o] = Math.round(127.5 + (dx[i] / spanX) * 127.5);
    field.data[o + 1] = Math.round(127.5 + (dy[i] / spanY) * 127.5);
    field.data[o + 2] = 128;
    field.data[o + 3] = 255;
  }
  ctx.putImageData(field, 0, 0);
  const map = canvas.toDataURL();

  const reach = Math.max(W, H) / 2;
  let zoomMap = '';
  if (magnify && !simple) {
    const ramp = ctx.createImageData(cw, ch);
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const o = (y * cw + x) * 4;
        const px = ((x + 0.5) * W) / cw - W / 2;
        const py = ((y + 0.5) * H) / ch - H / 2;
        const k = band(py);
        ramp.data[o] = Math.round(127.5 - (px / (box ? W / 2 : reach)) * 127.5 * k);
        ramp.data[o + 1] = Math.round(127.5 - (py / (box ? H / 2 : reach)) * 127.5 * k);
        ramp.data[o + 2] = 128;
        ramp.data[o + 3] = 255;
      }
    }
    ctx.putImageData(ramp, 0, 0);
    zoomMap = canvas.toDataURL();
  }

  const shine = ctx.createImageData(cw, ch);
  for (let i = 0; i < cw * ch; i++) {
    const o = i * 4;
    let r = 255;
    let g = 255;
    let b = 255;
    if (lens && shape.dispersion > 0) {
      // Iridescent rim on lenses: hue drifts around the edge.
      const h = rimHue[i];
      const k = 0.14 * shape.dispersion;
      r = 255 * (1 - k + k * (0.5 + 0.5 * Math.cos(h)));
      g = 255 * (1 - k + k * (0.5 + 0.5 * Math.cos(h - 2.1)));
      b = 255 * (1 - k + k * (0.5 + 0.5 * Math.cos(h + 2.1)));
    }
    shine.data[o] = r;
    shine.data[o + 1] = g;
    shine.data[o + 2] = b;
    shine.data[o + 3] = Math.round(rimA[i] * 255);
  }
  ctx.putImageData(shine, 0, 0);
  const rim = canvas.toDataURL();

  // Exact rounded-rect alpha: the filter's output is a rectangle, and bent
  // light sampled past the rim must not leak into the corners.
  const shapeMask = ctx.createImageData(cw, ch);
  for (let i = 0; i < cw * ch; i++) {
    const o = i * 4;
    shapeMask.data[o] = shapeMask.data[o + 1] = shapeMask.data[o + 2] = 255;
    shapeMask.data[o + 3] = Math.round(inside[i] * 255);
  }
  ctx.putImageData(shapeMask, 0, 0);
  const mask = canvas.toDataURL();

  let smooth = '';
  if (lens && !simple) {
    const soft = ctx.createImageData(cw, ch);
    for (let i = 0; i < cw * ch; i++) {
      const o = i * 4;
      soft.data[o] = soft.data[o + 1] = soft.data[o + 2] = 255;
      soft.data[o + 3] = Math.round(zone[i] * 255);
    }
    ctx.putImageData(soft, 0, 0);
    smooth = canvas.toDataURL();
  }

  const id = `lg-refract-${++counter}`;
  // Chromium (backdrop filters): primitive units in px, so displacement
  // scales are real pixels and maps get explicit px sizes.
  // Everywhere else (`box`): the filter and every primitive in the element's
  // own box, the only form WebKit and Gecko draw correctly.
  const area = box ? { x: 0, y: 0, width: 1, height: 1 } : { x: 0, y: 0, width: W, height: H };
  const filter = el(
    'filter',
    box
      ? { id, filterUnits: 'objectBoundingBox', primitiveUnits: 'objectBoundingBox', x: 0, y: 0, width: 1, height: 1, 'color-interpolation-filters': 'sRGB' }
      : {
          id,
          // Generous region: the rim samples content from beyond the glass edge.
          x: -0.25,
          y: -0.25,
          width: 1.5,
          height: 1.5,
          'color-interpolation-filters': 'sRGB',
        },
  );
  filter.append(el('feImage', { href: map, ...area, preserveAspectRatio: 'none', result: 'field' }));
  let source = 'SourceGraphic';
  if (zoomMap) {
    filter.append(
      el('feImage', { href: zoomMap, ...area, preserveAspectRatio: 'none', result: 'zoom' }),
      el('feDisplacementMap', {
        in: 'SourceGraphic',
        in2: 'zoom',
        scale: box ? magnify : 2 * reach * magnify,
        xChannelSelector: 'R',
        yChannelSelector: 'G',
        result: 'magnified',
      }),
    );
    source = 'magnified';
  }

  if (shape.dispersion > 0 && !simple && fringe) {
    // A transparent copy (glyphs, a track) can't be split by summing three
    // single-channel images: where their alphas overlap the sum saturates and
    // the glyph edges go grey. Instead the green ray is the image, and only
    // light the red and blue rays carry past it shows, as a thin warm and cool
    // fringe on either side of each edge (purple outside, green inside, as
    // on iOS): the rainbow a water drop throws.
    const spread = (shape.stretch > 0 ? 0.12 : 0.3) * shape.dispersion;
    for (const [name, factor] of [['r', 1 + spread], ['g', 1], ['b', 1 - spread]] as const) {
      filter.append(
        el('feDisplacementMap', {
          in: source,
          in2: 'field',
          scale: scale * factor,
          xChannelSelector: 'R',
          yChannelSelector: 'G',
          result: `${name}-ray`,
        }),
      );
    }
    filter.append(
      el('feComposite', { in: 'r-ray', in2: 'g-ray', operator: 'out', result: 'r-edge' }),
      el('feColorMatrix', { in: 'r-edge', type: 'matrix', values: '0.2 0 0 0 0.62  0 0.2 0 0 0.16  0 0 0.2 0 0.8  0 0 0 1 0', result: 'warm' }),
      el('feComposite', { in: 'b-ray', in2: 'g-ray', operator: 'out', result: 'b-edge' }),
      el('feColorMatrix', { in: 'b-edge', type: 'matrix', values: '0.2 0 0 0 0.1  0 0.2 0 0 0.78  0 0 0.2 0 0.62  0 0 0 1 0', result: 'cool' }),
      el('feMerge', {}),
    );
    const merge = filter.lastElementChild!;
    for (const name of ['warm', 'cool', 'g-ray']) merge.append(el('feMergeNode', { in: name }));
    merge.setAttribute('result', 'bent');
  } else if (shape.dispersion > 0 && !simple) {
    const spread = 0.16 * shape.dispersion;
    const channels: Array<[string, number, string]> = [
      ['r', 1 + spread, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'],
      ['g', 1, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0'],
      ['b', 1 - spread, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0'],
    ];
    for (const [name, factor, matrix] of channels) {
      filter.append(
        el('feDisplacementMap', {
          in: source,
          in2: 'field',
          scale: scale * factor,
          xChannelSelector: 'R',
          yChannelSelector: 'G',
          result: `${name}-ray`,
        }),
        el('feColorMatrix', { in: `${name}-ray`, type: 'matrix', values: matrix, result: name }),
      );
    }
    filter.append(
      el('feComposite', { in: 'r', in2: 'g', operator: 'arithmetic', k2: 1, k3: 1, result: 'rg' }),
      el('feComposite', { in: 'rg', in2: 'b', operator: 'arithmetic', k2: 1, k3: 1, result: 'bent' }),
    );
  } else {
    filter.append(
      el('feDisplacementMap', {
        in: source,
        in2: 'field',
        scale,
        xChannelSelector: 'R',
        yChannelSelector: 'G',
        result: 'bent',
      }),
    );
  }
  let out = 'bent';
  if (smooth) {
    // Blend a slightly softened copy in across the rim only.
    filter.append(
      el('feGaussianBlur', { in: 'bent', stdDeviation: box ? `${0.65 / W} ${0.65 / H}` : 0.65, result: 'bent-soft' }),
      el('feImage', { href: smooth, ...area, preserveAspectRatio: 'none', result: 'rim-zone' }),
      el('feComposite', { in: 'bent-soft', in2: 'rim-zone', operator: 'in', result: 'rim-soft' }),
      el('feComposite', { in: 'bent', in2: 'rim-zone', operator: 'out', result: 'core' }),
      el('feComposite', { in: 'rim-soft', in2: 'core', operator: 'arithmetic', k2: 1, k3: 1, result: 'smoothed' }),
    );
    out = 'smoothed';
  }
  filter.append(
    el('feImage', { href: mask, ...area, preserveAspectRatio: 'none', result: 'shape' }),
    el('feComposite', { in: out, in2: 'shape', operator: 'in' }),
  );

  container().append(filter);
  return { filter: `url(#${id})`, rim: `url("${rim}")`, inner: `url("${mask}")` };
}

function resolve(shape: GlassShape, width: number, height: number): Required<GlassShape> {
  const kind = shape.kind ?? 'surface';
  const short = Math.min(width, height);
  const lens = kind === 'lens';
  return {
    kind,
    bezel: shape.bezel ?? (lens ? short * 0.32 : clamp(short * 0.2, 5, 16)),
    thickness: shape.thickness ?? (lens ? short * 0.55 : clamp(short * 0.32, 8, 26)),
    ior: shape.ior ?? 1.5,
    zoom: shape.zoom ?? (lens ? 1.16 : 1),
    zoomX: shape.zoomX ?? shape.zoom ?? (lens ? 1.16 : 1),
    dispersion: shape.dispersion ?? (lens ? 1 : 0),
    strength: shape.strength ?? 1,
    inset: shape.inset ?? 0,
    stretch: shape.stretch ?? 0,
    copy: shape.copy ?? false,
  };
}

export function glassFor(width: number, height: number, radius: number, shape: GlassShape = {}, pad = 0, simple = false, fringe = false, box = false): Baked {
  const w = Math.round(width);
  const h = Math.round(height);
  const r = Math.min(w / 2, h / 2, Math.max(0, radius));
  const full = resolve(shape, w, h);
  const key = [w, h, Math.round(r * 2) / 2, full.kind, full.bezel.toFixed(1), full.thickness.toFixed(1), full.ior, full.zoom, full.dispersion, full.strength, full.inset, full.stretch, pad, simple, fringe, box].join('|');
  let baked = cache.get(key);
  if (!baked) {
    baked = bake(w, h, r, full, pad, simple, fringe, box);
    cache.set(key, baked);
  }
  return baked;
}

function idle(callback: () => void): () => void {
  if (typeof requestIdleCallback === 'function') {
    const handle = requestIdleCallback(callback, { timeout: 120 });
    return () => cancelIdleCallback(handle);
  }
  const handle = setTimeout(callback, 16);
  return () => clearTimeout(handle);
}

function cornerRadius(element: HTMLElement, width: number, height: number): number {
  const value = getComputedStyle(element).borderTopLeftRadius;
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  return value.endsWith('%') ? (Math.min(width, height) * n) / 100 : n;
}

/**
 * Bakes refraction for `ref`'s current box (untransformed) and keeps it fresh
 * on resize. Writes `--lg-filter` (Chromium) and `--lg-rim` on the element.
 *
 * `mirror` names the content that sits beneath the glass. Where the browser
 * can't refract the live backdrop (Safari, Firefox), a live copy of it is
 * refracted inside the glass instead, so lenses still bend light everywhere.
 */
export function useRefraction(
  ref: React.RefObject<HTMLElement | null>,
  shape: GlassShape = {},
  enabled = true,
  mirror?: React.RefObject<HTMLElement | null>,
  /** While false the mirror sleeps (Safari/Firefox only). */
  mirrorActive?: () => boolean,
) {
  const signature = JSON.stringify(shape);
  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;
    const live = canRefractBackdrop() && !(shape.copy && mirror);
    let cancel: (() => void) | undefined;
    let filter = '';
    let pad = 0;
    let zoom = 1;
    let zoomX = 1;
    // The rim bend runs on the copy itself, as a normal filter. Chromium only
    // does this when asked (it can bend the live backdrop instead); every
    // other engine bends a mirrored lens's copy, in box units.
    const chromium = canRefractBackdrop();
    const bendCopy = !!mirror && (shape.copy === 'refract' || !chromium);
    let copyFilter = '';
    const applyCopyFilter = () => {
      const viewport = element.querySelector<HTMLElement>(':scope > .lg-mirror > .lg-mirror__viewport');
      if (viewport && copyFilter) viewport.style.filter = copyFilter;
    };

    const fit = () => {
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      if (!width || !height) return;
      const radius = cornerRadius(element, width, height);
      const baked = glassFor(width, height, radius, shape);
      filter = baked.filter;
      if (!live && mirror?.current) {
        // The lens is a magnified copy of what's beneath, bent at its rim.
        pad = Math.ceil(Math.min(width, height) * 0.45 + 6);
        ({ zoom, zoomX } = resolve(shape, width, height));
        element.style.setProperty('--lg-inner-mask', baked.inner);
        if (bendCopy) {
          // The copy is magnified by CSS; the filter only bends the rim and
          // fringes what it bends with colour.
          copyFilter = glassFor(width, height, radius, { ...shape, zoom: 1, zoomX: 1 }, pad, false, true, !chromium).filter;
          applyCopyFilter();
        }
      }
      // A bent copy also refracts the real backdrop: the bar's glass, its edge
      // and the page bend and split into colour at the rim, so the lens
      // merges with what's beneath instead of sitting on it.
      if (live || (bendCopy && chromium)) {
        // Behind a bent copy the backdrop only carries the bar's glass and
        // edges: the copy already magnifies the content, so the backdrop isn't
        // zoomed (that pushed the bar's edge into a ring inside the lens) and
        // its rim bends gently, curling the bar's edge into thin arcs.
        const backdrop = live ? baked.filter : glassFor(width, height, radius, { ...shape, zoom: 1, zoomX: 1, strength: (shape.strength ?? 1) * 0.45 }).filter;
        element.style.setProperty('--lg-filter', backdrop);
        // Lets CSS keep its softening/saturation for real refraction only.
        element.setAttribute('data-lg-refract', '');
      }
      element.style.setProperty('--lg-rim', baked.rim);
    };

    // Refit once resizing settles: a bake is a full canvas pass, and a
    // surface that animates its size (a nav growing a slot) would otherwise
    // rebake nearly every frame on Safari, which has no idle callback. The
    // rim stretches to the box meanwhile.
    const observer = new ResizeObserver(() => {
      cancel?.();
      const timer = setTimeout(() => {
        cancel = idle(fit);
      }, 140);
      cancel = () => clearTimeout(timer);
    });
    observer.observe(element);
    fit();

    const source = mirror?.current;
    const unmirror = !live && source ? mirrorBackdrop(element, source, () => pad, () => [zoomX, zoom], mirrorActive) : undefined;
    applyCopyFilter();

    return () => {
      cancel?.();
      unmirror?.();
      observer.disconnect();
      element.style.removeProperty('--lg-filter');
      element.style.removeProperty('--lg-rim');
      element.removeAttribute('data-lg-refract');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, signature, enabled, mirror]);
}
