/**
 * Refraction for engines that can't filter the live backdrop (Safari, Firefox).
 *
 * We keep a live copy of the content that sits beneath the glass inside the
 * glass itself, aligned pixel-for-pixel, and run the same SVG displacement
 * filter over that copy with an ordinary CSS `filter`, which every engine
 * supports. Inline styles are re-synced each frame so animated content (a
 * sliding tint row, a fading track) stays in step.
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
  for (let node = glass.parentElement; node; node = node.parentElement) {
    if (node === source || source.contains(node)) continue;
    const cs = getComputedStyle(node);
    const image = cs.backgroundImage !== 'none';
    const a = alpha(cs.backgroundColor);
    if (image || a > 0) chain.unshift(node);
    // A gradient/image or a solid colour hides everything further back.
    if (image || a >= 1) break;
  }
  return chain;
}

const BACKGROUND = ['background-color', 'background-image', 'background-size', 'background-position', 'background-repeat', 'border-radius'];

export function mirrorBackdrop(glass: HTMLElement, source: HTMLElement, filter: () => string, padding: () => number) {
  const layer = document.createElement('div');
  layer.className = 'lg-mirror';
  layer.setAttribute('aria-hidden', 'true');
  glass.setAttribute(SELF, '');
  glass.prepend(layer);
  // The filter runs on `layer`; everything it draws lives in a clipped
  // viewport of exactly the glass's size. WebKit sizes objectBoundingBox
  // filters from visual overflow, so nothing may spill past this box.
  const viewport = document.createElement('div');
  viewport.className = 'lg-mirror__viewport';
  layer.append(viewport);

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
    viewport.prepend(...under.map((u) => u.copy));
  };
  viewport.append(copy.root);
  buildUnder();
  let stopped = false;
  let frame = 0;
  let visible = true;
  let placed = '';

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
      // Only the drawn content overhangs; the filtered layer stays glass-sized
      // because WebKit measures filter space from the element's own box.
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
        if (pair.copy !== copy.root) pair.copy.style.cssText = css;
        else {
          // Keep the root's own colours/vars but not its motion; align() owns placement.
          pair.copy.style.cssText = css;
          placed = '';
        }
      }
      if (cls !== pair.cls) {
        pair.cls = cls;
        pair.copy.className = cls;
      }
    }
  };

  const applyFilter = () => {
    const value = filter();
    if (layer.style.filter !== value) layer.style.filter = value;
  };

  const tick = () => {
    frame = 0;
    if (stopped) return;
    if (visible && !document.hidden) {
      applyFilter();
      sync();
      align();
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  let pending = 0;
  const recopy = () => {
    pending = 0;
    if (stopped) return;
    const next = clone(source);
    copy.root.replaceWith(next.root);
    copy = next;
    placed = '';
    buildUnder();
    align();
  };
  const mutations = new MutationObserver((records) => {
    // Our own copies live inside the glass, which may sit inside the source.
    if (records.every((r) => layer.contains(r.target) || r.target === layer || r.target === glass)) return;
    const structural = records.some((r) => r.type !== 'attributes' && !layer.contains(r.target));
    if (structural && !pending) pending = requestAnimationFrame(recopy);
  });
  mutations.observe(source, { childList: true, characterData: true, subtree: true });

  const io =
    typeof IntersectionObserver === 'function'
      ? new IntersectionObserver((entries) => {
          visible = entries.some((e) => e.isIntersecting);
        })
      : null;
  io?.observe(glass);

  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
    cancelAnimationFrame(pending);
    mutations.disconnect();
    io?.disconnect();
    layer.remove();
    glass.removeAttribute(SELF);
  };
}
