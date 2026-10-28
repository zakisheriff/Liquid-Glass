/**
 * The refraction engine.
 *
 * For every glass shape we ray-trace a displacement field through a convex
 * squircle bevel using Snell's law, bake it to an image, and hand it to an SVG
 * `feDisplacementMap`. Chromium can run that filter on the live backdrop
 * (`backdrop-filter: url(#…)`), which bends whatever sits behind the glass.
 * Every engine also gets a baked specular rim, so Safari and Firefox still
 * read as glass with blur + rim.
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
  /** Interior magnification (lens only). 1 = none. */
  zoom?: number;
  /** Chromatic split strength, 0–1. */
  dispersion?: number;
  /** Overall displacement multiplier. */
  strength?: number;
}

interface Baked {
  filter: string;
  rim: string;
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

function bake(width: number, height: number, radius: number, shape: Required<GlassShape>, pad = 0): Baked {
  // `pad` widens the baked canvas around the shape: mirrored backdrops need
  // room for light the rim bends in from beyond the glass's own edge.
  const W = width + pad * 2;
  const H = height + pad * 2;
  // Keep the bake under ~400k samples; the field is smooth so this is lossless enough.
  let density = Math.min(typeof devicePixelRatio === 'number' ? devicePixelRatio : 1, 2);
  while (W * H * density * density > 400_000 && density > 0.35) density *= 0.75;
  const cw = Math.max(1, Math.ceil(W * density));
  const ch = Math.max(1, Math.ceil(H * density));

  const lens = shape.kind === 'lens';
  const shift = bevelProfile(shape.bezel, shape.thickness, shape.ior);
  const magnify = lens ? 1 - 1 / Math.max(1, shape.zoom) : 0;
  const direction = lens ? 1 : -1;

  const dx = new Float32Array(cw * ch);
  const dy = new Float32Array(cw * ch);
  const rimA = new Float32Array(cw * ch);
  const rimHue = new Float32Array(cw * ch);
  const inside = new Float32Array(cw * ch);
  let max = 0.0001;

  const hw = width / 2;
  const hh = height / 2;
  const px1 = 1 / density;

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
      const s = shift(d) * shape.strength * direction;
      // Edge bend only; magnification runs as its own pass so colour
      // splits only where the glass actually curves.
      const vx = nx * s;
      const vy = ny * s;
      dx[i] = vx;
      dy[i] = vy;
      const m = Math.max(Math.abs(vx), Math.abs(vy));
      if (m > max) max = m;

      inside[i] = clamp(d / px1 + 0.5, 0, 1);

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

  const field = ctx.createImageData(cw, ch);
  for (let i = 0; i < cw * ch; i++) {
    const o = i * 4;
    field.data[o] = Math.round(127.5 + (dx[i] / max) * 127.5);
    field.data[o + 1] = Math.round(127.5 + (dy[i] / max) * 127.5);
    field.data[o + 2] = 128;
    field.data[o + 3] = 255;
  }
  ctx.putImageData(field, 0, 0);
  const map = canvas.toDataURL();

  const reach = Math.max(W, H) / 2;
  let zoomMap = '';
  if (magnify) {
    const ramp = ctx.createImageData(cw, ch);
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const o = (y * cw + x) * 4;
        const px = ((x + 0.5) * W) / cw - W / 2;
        const py = ((y + 0.5) * H) / ch - H / 2;
        ramp.data[o] = Math.round(127.5 - (px / reach) * 127.5);
        ramp.data[o + 1] = Math.round(127.5 - (py / reach) * 127.5);
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

  const id = `lg-refract-${++counter}`;
  // Region in the element's own box (objectBoundingBox): WebKit only renders
  // feImage maps this way; Chromium accepts it for backdrop filters too.
  // Primitive units stay in px so displacement scales are real pixels.
  // Maps get explicit px sizes: WebKit otherwise draws them at their native
  // (devicePixelRatio-scaled) size instead of stretching them over the box.
  const box = { x: 0, y: 0, width: W, height: H };
  const filter = el('filter', {
    id,
    // Generous region: the rim samples content from beyond the glass edge.
    x: -0.5,
    y: -0.5,
    width: 2,
    height: 2,
    'color-interpolation-filters': 'sRGB',
  });
  filter.append(el('feImage', { href: map, ...box, preserveAspectRatio: 'none', result: 'field' }));
  let source = 'SourceGraphic';
  if (zoomMap) {
    filter.append(
      el('feImage', { href: zoomMap, ...box, preserveAspectRatio: 'none', result: 'zoom' }),
      el('feDisplacementMap', {
        in: 'SourceGraphic',
        in2: 'zoom',
        scale: 2 * reach * magnify,
        xChannelSelector: 'R',
        yChannelSelector: 'G',
        result: 'magnified',
      }),
    );
    source = 'magnified';
  }

  const scale = max * 2;
  if (shape.dispersion > 0) {
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
  filter.append(
    el('feImage', { href: mask, ...box, preserveAspectRatio: 'none', result: 'shape' }),
    el('feComposite', { in: 'bent', in2: 'shape', operator: 'in' }),
  );

  container().append(filter);
  return { filter: `url(#${id})`, rim: `url("${rim}")` };
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
    dispersion: shape.dispersion ?? (lens ? 1 : 0),
    strength: shape.strength ?? 1,
  };
}

export function glassFor(width: number, height: number, radius: number, shape: GlassShape = {}, pad = 0): Baked {
  const w = Math.round(width);
  const h = Math.round(height);
  const r = Math.min(w / 2, h / 2, Math.max(0, radius));
  const full = resolve(shape, w, h);
  const key = [w, h, Math.round(r * 2) / 2, full.kind, full.bezel.toFixed(1), full.thickness.toFixed(1), full.ior, full.zoom, full.dispersion, full.strength, pad].join('|');
  let baked = cache.get(key);
  if (!baked) {
    baked = bake(w, h, r, full, pad);
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
    const live = canRefractBackdrop();
    let cancel: (() => void) | undefined;
    let filter = '';
    let pad = 0;

    const fit = () => {
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      if (!width || !height) return;
      const radius = cornerRadius(element, width, height);
      const baked = glassFor(width, height, radius, shape);
      filter = baked.filter;
      if (!live && mirror?.current) pad = Math.ceil(Math.min(width, height) * 0.45 + 6);
      if (live) element.style.setProperty('--lg-filter', baked.filter);
      element.style.setProperty('--lg-rim', baked.rim);
    };

    const observer = new ResizeObserver(() => {
      cancel?.();
      cancel = idle(fit);
    });
    observer.observe(element);
    fit();

    const source = mirror?.current;
    const unmirror = !live && source ? mirrorBackdrop(element, source, () => filter, () => pad, mirrorActive) : undefined;

    return () => {
      cancel?.();
      unmirror?.();
      observer.disconnect();
      element.style.removeProperty('--lg-filter');
      element.style.removeProperty('--lg-rim');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, signature, enabled, mirror]);
}
