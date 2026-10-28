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

export function mirrorBackdrop(glass: HTMLElement, source: HTMLElement, filter: () => string) {
  const layer = document.createElement('div');
  layer.className = 'lg-mirror';
  layer.setAttribute('aria-hidden', 'true');
  glass.setAttribute(SELF, '');
  glass.prepend(layer);

  let copy = clone(source);
  layer.append(copy.root);
  let stopped = false;
  let frame = 0;
  let visible = true;
  let placed = '';

  const align = () => {
    const sw = source.offsetWidth;
    const sh = source.offsetHeight;
    const gw = glass.offsetWidth;
    const gh = glass.offsetHeight;
    if (!sw || !sh || !gw || !gh) return;
    const g = glass.getBoundingClientRect();
    const s = source.getBoundingClientRect();
    const sgx = g.width / gw;
    const sgy = g.height / gh;
    const kx = s.width / sw / sgx;
    const ky = s.height / sh / sgy;
    const px = (s.left - g.left) / sgx;
    const py = (s.top - g.top) / sgy;
    const next = `${sw}|${sh}|${px.toFixed(2)}|${py.toFixed(2)}|${kx.toFixed(4)}|${ky.toFixed(4)}`;
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
    root.style.transform = `translate(${px}px, ${py}px) scale(${kx}, ${ky})`;
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
    layer.replaceChildren(next.root);
    copy = next;
    placed = '';
    align();
  };
  const mutations = new MutationObserver((records) => {
    // Our own copies live inside the glass, which may sit inside the source.
    if (records.every((r) => layer.contains(r.target) || r.target === layer)) return;
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
