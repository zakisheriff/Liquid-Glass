/**
 * Lenses for engines that can't filter the live backdrop (Safari, Firefox).
 *
 * We keep a live copy of what sits beneath the glass inside the glass itself,
 * aligned pixel-for-pixel, magnify it around the lens centre with a plain CSS
 * transform, and feather it out across the bevel with a CSS mask. No SVG
 * filters: real Safari's GPU path renders displacement filters black. Inline
 * styles are re-synced each frame so animated content stays in step.
 */

const SELF = 'data-lg-mirror-self';

interface Pair {
  original: HTMLElement;
  copy: HTMLElement;
  css: string;
  cls: string;
}

function clone(source: HTMLElement): { root: HTMLElement; pairs: Pair[] } {
  const root = source.cloneNode(true) as HTMLElement;
  const originals = [source, ...Array.from(source.querySelectorAll<HTMLElement>('*'))];
  const copies = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
  const pairs: Pair[] = [];
  originals.forEach((original, i) => {
    const copy = copies[i];
    if (!copy) return;
    copy.removeAttribute('id');
    copy.removeAttribute('tabindex');
    if (copy instanceof HTMLImageElement) copy.loading = 'eager';
    pairs.push({ original, copy, css: original.style.cssText, cls: original.className.toString() });
  });
  root.querySelectorAll(`[${SELF}], .lg-mirror, [data-lg-mirror-skip], input, textarea, select`).forEach((n) => n.remove());
  // The source may cut a hole for the lens (data-mirror); the copy must not.
  root.removeAttribute('data-mirror');
  // Lets styles tell the copy apart from the real control.
  root.setAttribute('data-lg-copy', '');
  root.setAttribute('inert', '');
  root.setAttribute('aria-hidden', 'true');
  return { root, pairs };
}

const alpha = (color: string) => {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return color === 'transparent' ? 0 : 1;
  const parts = m[1].split(/[\s,/]+/).filter(Boolean);
  return parts.length > 3 ? parseFloat(parts[3]) : 1;
};

/**
 * The painted layers behind the glass that the source copy doesn't cover:
 * every ancestor with a background, outermost first, down from the first
 * opaque one. Their backgrounds are replayed under the copy so the lens shows
 * one complete image instead of the copy floating over the real page.
 */
function backdropChain(glass: HTMLElement, source: HTMLElement): HTMLElement[] {
  const chain: HTMLElement[] = [];
  // Bare lenses (e.g. a slider thumb over its rail) show only the copied
  // source; the real frosted backdrop shows through around it.
  if (glass.hasAttribute('data-lg-mirror-bare')) return chain;
  for (let node = glass.parentElement; node; node = node.parentElement) {
    if (node === source || source.contains(node)) continue;
    const cs = getComputedStyle(node);
    const image = cs.backgroundImage !== 'none';
    const a = alpha(cs.backgroundColor);
    if (image || a > 0) chain.unshift(node);
    // Stop at a gradient/image or solid colour (it hides everything further
    // back), or at the glass surface the lens rests on: past that, the real
    // backdrop is frosted anyway and an opaque replay would read as a blob.
    if (image || a >= 1 || node.classList.contains('lg-glass')) break;
  }
  return chain;
}

/** The source's own `data-*` state flags, as a sorted, space-separated list. */
const stateOf = (el: HTMLElement) =>
  Array.from(el.attributes)
    .map((a) => a.name)
    .filter((name) => name.startsWith('data-') && name !== 'data-mirror' && !name.startsWith('data-lg-mirror'))
    .sort()
    .join(' ');

const BACKGROUND = ['background-color', 'background-image', 'background-size', 'background-position', 'background-repeat', 'border-radius'];

// align() owns the clone root's placement. Animation variables and colours
// still follow the source without clearing and rebuilding that placement.
const PLACEMENT = new Set(['position', 'left', 'top', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height', 'scale', 'translate', 'transform-origin', 'transform']);

function syncStyle(original: HTMLElement, copy: HTMLElement, root: boolean) {
  for (const name of Array.from(copy.style)) {
    if (root && PLACEMENT.has(name)) continue;
    if (!original.style.getPropertyValue(name)) copy.style.removeProperty(name);
  }
  for (const name of Array.from(original.style)) {
    if (root && PLACEMENT.has(name)) continue;
    const value = original.style.getPropertyValue(name);
    const priority = original.style.getPropertyPriority(name);
    if (copy.style.getPropertyValue(name) !== value || copy.style.getPropertyPriority(name) !== priority) {
      copy.style.setProperty(name, value, priority);
    }
  }
}

export function mirrorBackdrop(
  glass: HTMLElement,
  source: HTMLElement,
  padding: () => number,
  /** Interior magnification of the lens. */
  zoom: () => number | [number, number],
  /** Work only while this is true (e.g. a lens is lifted); idle otherwise. */
  active: () => boolean = () => true,
) {
  const layer = document.createElement('div');
  layer.className = 'lg-mirror';
  layer.setAttribute('aria-hidden', 'true');
  glass.setAttribute(SELF, '');
  glass.prepend(layer);
  // `layer` is glass-sized and carries the feathered mask; the copy lives in
  // a clipped viewport that overhangs it so magnification has edge content.
  const viewport = document.createElement('div');
  viewport.className = 'lg-mirror__viewport';
  layer.append(viewport);
  const zoomer = document.createElement('div');
  zoomer.className = 'lg-mirror__zoom';
  viewport.append(zoomer);

  let copy = clone(source);
  let under: Array<{ original: HTMLElement; copy: HTMLElement; placed: string }> = [];
  const buildUnder = () => {
    under.forEach((u) => u.copy.remove());
    under = backdropChain(glass, source).map((original) => {
      const div = document.createElement('div');
      const cs = getComputedStyle(original);
      for (const name of BACKGROUND) div.style.setProperty(name, cs.getPropertyValue(name));
      div.style.position = 'absolute';
      div.style.left = '0px';
      div.style.top = '0px';
      div.style.transformOrigin = '0 0';
      return { original, copy: div, placed: '' };
    });
    zoomer.prepend(...under.map((u) => u.copy));
  };
  zoomer.append(copy.root);
  buildUnder();
  let stopped = false;
  let frame = 0;
  let visible = true;
  let placed = '';
  let shown = true;

  /** Maps `from`'s rendered box into glass-local coordinates. */
  let pad = 0;
  const place = (from: HTMLElement, g: DOMRect, sgx: number, sgy: number) => {
    const sw = from.offsetWidth;
    const sh = from.offsetHeight;
    if (!sw || !sh) return null;
    const s = from.getBoundingClientRect();
    const kx = s.width / sw / sgx;
    const ky = s.height / sh / sgy;
    const px = (s.left - g.left) / sgx + pad;
    const py = (s.top - g.top) / sgy + pad;
    return { sw, sh, key: `${sw}|${sh}|${px.toFixed(2)}|${py.toFixed(2)}|${kx.toFixed(4)}|${ky.toFixed(4)}`, transform: `translate(${px}px, ${py}px) scale(${kx}, ${ky})` };
  };

  const align = () => {
    const nextPad = padding();
    if (nextPad !== pad) {
      pad = nextPad;
      viewport.style.inset = `${-pad}px`;
      under.forEach((u) => (u.placed = ''));
      placed = '';
    }
    const gw = glass.offsetWidth;
    const gh = glass.offsetHeight;
    if (!gw || !gh) return;
    const g = glass.getBoundingClientRect();
    const sgx = g.width / gw;
    const sgy = g.height / gh;
    for (const u of under) {
      const at = place(u.original, g, sgx, sgy);
      if (!at || at.key === u.placed) continue;
      u.placed = at.key;
      u.copy.style.width = `${at.sw}px`;
      u.copy.style.height = `${at.sh}px`;
      u.copy.style.transform = at.transform;
    }
    const at = place(source, g, sgx, sgy);
    if (!at) return;
    const { sw, sh } = at;
    const next = at.key;
    if (next === placed) return;
    placed = next;
    const root = copy.root;
    root.style.position = 'absolute';
    root.style.left = '0px';
    root.style.top = '0px';
    root.style.margin = '0px';
    root.style.width = `${sw}px`;
    root.style.height = `${sh}px`;
    // The copy sits in a small viewport; size limits like max-width: 100%
    // would squeeze it there instead of matching the original.
    root.style.maxWidth = 'none';
    root.style.maxHeight = 'none';
    root.style.minWidth = '0px';
    root.style.minHeight = '0px';
    root.style.scale = 'none';
    root.style.translate = 'none';
    root.style.transformOrigin = '0 0';
    root.style.transform = at.transform;
  };

  const sync = () => {
    for (const pair of copy.pairs) {
      const css = pair.original.style.cssText;
      const cls = pair.original.className.toString();
      if (css !== pair.css) {
        pair.css = css;
        // Reassigning cssText also resets unchanged mask images. Safari can
        // drop their cached pixels during a drag, especially after reload.
        syncStyle(pair.original, pair.copy, pair.copy === copy.root);
      }
      if (cls !== pair.cls) {
        pair.cls = cls;
        pair.copy.className = cls;
      }
    }
    // State flags on the source (data-lifted, data-previewing, …) drive how
    // its content is painted, so the copy follows them too.
    const flags = stateOf(source);
    if (flags !== copyFlags) {
      const now = new Set(flags.split(' '));
      for (const name of copyFlags.split(' ')) if (name && !now.has(name)) copy.root.removeAttribute(name);
      for (const name of flags.split(' ')) if (name) copy.root.setAttribute(name, source.getAttribute(name) ?? '');
      copyFlags = flags;
    }
  };

  let copyFlags = '';
  let zoomed = '';
  const applyZoom = () => {
    const z = zoom();
    const value = Array.isArray(z) ? `scale(${z[0]}, ${z[1]})` : `scale(${z})`;
    if (value !== zoomed) zoomer.style.transform = zoomed = value;
  };

  const tick = () => {
    frame = 0;
    if (stopped) return;
    const on = visible && !document.hidden && active();
    if (on !== shown) {
      shown = on;
      layer.style.visibility = on ? '' : 'hidden';
    }
    if (!on) return;
    applyZoom();
    sync();
    align();
    frame = requestAnimationFrame(tick);
  };
  // While its lens rests the copy sleeps: no frames at all, so a page full of
  // controls lets the CPU idle. Lifting writes the source's style, which the
  // observer below sees, and that wakes it again.
  const wake = () => {
    if (!frame && !stopped) frame = requestAnimationFrame(tick);
  };
  wake();

  let pending = 0;
  const recopy = () => {
    pending = 0;
    if (stopped) return;
    const next = clone(source);
    copy.root.replaceWith(next.root);
    copy = next;
    copyFlags = '';
    placed = '';
    buildUnder();
    align();
  };
  const mutations = new MutationObserver((records) => {
    // Our own copies live inside the glass, which may sit inside the source.
    if (records.every((r) => layer.contains(r.target) || r.target === layer || r.target === glass)) return;
    wake();
    const structural = records.some((r) => r.type !== 'attributes' && !layer.contains(r.target));
    if (structural && !pending) pending = requestAnimationFrame(recopy);
    else if (!structural && !stopped && visible && !document.hidden && active()) {
      // Spring callbacks can run after our rAF tick. Follow their final
      // styles before this frame is painted so the copy and hide mask agree.
      applyZoom();
      sync();
      align();
    }
  });
  mutations.observe(source, { childList: true, characterData: true, attributes: true, attributeFilter: ['style', 'class'], subtree: true });

  const io =
    typeof IntersectionObserver === 'function'
      ? new IntersectionObserver((entries) => {
          visible = entries.some((e) => e.isIntersecting);
          wake();
        })
      : null;
  io?.observe(glass);
  document.addEventListener('visibilitychange', wake);

  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
    cancelAnimationFrame(pending);
    mutations.disconnect();
    io?.disconnect();
    document.removeEventListener('visibilitychange', wake);
    layer.remove();
    glass.removeAttribute(SELF);
  };
}
