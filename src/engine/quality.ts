/**
 * Keeps refraction affordable.
 *
 * A refracting surface re-runs its SVG displacement over the live backdrop on
 * every frame the backdrop moves. Fast GPUs shrug that off; mid-range phones
 * drop frames as soon as a page holds a few dozen of them. So:
 *
 * - while the page scrolls, `html[data-lg-scrolling]` turns refraction off
 *   (blur and the baked rim stay, which reads the same in motion);
 * - glass well outside the viewport gets `data-lg-offscreen` and skips it;
 * - on weak devices (`html[data-lg-quality='low']`) resting surfaces keep blur
 *   and rim only; lenses still bend while they're held.
 *
 * The quality starts from device hints and drops to low if the first seconds
 * of scrolling miss frames. `setGlassQuality` pins it either way.
 */

export type GlassQuality = 'auto' | 'high' | 'low';

let started = false;
let pinned: GlassQuality = 'auto';
let probing = false;
let offscreen: IntersectionObserver | null = null;

const root = () => document.documentElement;

function apply(level: 'high' | 'low') {
  if (root().getAttribute('data-lg-quality') !== level) root().setAttribute('data-lg-quality', level);
}

/** Device hints: few cores or little memory (Chromium reports both). */
function guess(): 'high' | 'low' {
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) return 'low';
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) return 'low';
  return 'high';
}

/**
 * Times frames while the page scrolls with refraction paused and resumed.
 * If too many miss the frame budget the device can't carry it: go low.
 */
function probe() {
  if (probing || pinned !== 'auto' || root().getAttribute('data-lg-quality') === 'low') return;
  probing = true;
  const gaps: number[] = [];
  let last = 0;
  let frame = 0;
  const end = performance.now() + 2000;
  const step = (now: number) => {
    if (last) gaps.push(now - last);
    last = now;
    if (now < end && gaps.length < 120) {
      frame = requestAnimationFrame(step);
      return;
    }
    probing = false;
    if (gaps.length < 20 || pinned !== 'auto') return;
    const slow = gaps.filter((gap) => gap > 26).length / gaps.length;
    if (slow > 0.2) apply('low');
  };
  frame = requestAnimationFrame(step);
  void frame;
}

function watchScroll() {
  let timer = 0;
  let probes = 0;
  const settle = () => {
    timer = 0;
    root().removeAttribute('data-lg-scrolling');
  };
  const onScroll = () => {
    if (!timer) {
      root().setAttribute('data-lg-scrolling', '');
      // Sample the first couple of scrolls after load: that's when a page
      // full of glass is most expensive.
      if (probes < 2) {
        probes++;
        probe();
      }
    } else {
      clearTimeout(timer);
    }
    timer = window.setTimeout(settle, 140);
  };
  // Capture: nested scrollers (sheets, panels) count too.
  document.addEventListener('scroll', onScroll, { capture: true, passive: true });
}

function start() {
  if (started || typeof window === 'undefined') return;
  started = true;
  apply(pinned === 'auto' ? guess() : pinned);
  watchScroll();
  if (typeof IntersectionObserver === 'function') {
    offscreen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) el.removeAttribute('data-lg-offscreen');
          else el.setAttribute('data-lg-offscreen', '');
        }
      },
      // Turn back on a little before it scrolls into view.
      { rootMargin: '25% 0px' },
    );
  }
}

/** Starts the governor and tracks `element`'s visibility. Returns a cleanup. */
export function governRefraction(element: HTMLElement): () => void {
  start();
  offscreen?.observe(element);
  return () => {
    offscreen?.unobserve(element);
    element.removeAttribute('data-lg-offscreen');
  };
}

/**
 * Pins the refraction quality. `'auto'` (default) picks from device hints and
 * drops to `'low'` if scrolling misses frames; `'high'` always refracts
 * resting surfaces; `'low'` refracts lenses only while they're held.
 */
export function setGlassQuality(quality: GlassQuality) {
  pinned = quality;
  if (typeof window === 'undefined') return;
  if (!started) start();
  apply(quality === 'auto' ? guess() : quality);
}
