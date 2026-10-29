'use client';

import { useEffect, useRef } from 'react';
import { GlassButton, useRefraction } from '@zakisheriff/liquid-glass';
import { SUPPORT_URL } from '@/lib/site';
import { useTheme } from './theme';
import { GitHub, Moon, Sun } from './icons';

const LINKS = [
  { href: '#components', label: 'Components' },
  { href: '#refraction', label: 'Playground' },
];

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Scroll-linked morph: the hero title shrinks and flies into the nav while
 * the nav pill grows a slot for it; at the end the nav label takes over.
 *
 * Where scroll-driven animations exist (Safari 26, Chrome) the browser runs
 * it in lockstep with scrolling, so it never lags or shakes. JS only measures
 * the start and end geometry. Elsewhere a rAF fallback drives the same values.
 */
function useTitleMorph(bar: React.RefObject<HTMLDivElement | null>, brand: React.RefObject<HTMLSpanElement | null>) {
  useEffect(() => {
    const nav = bar.current;
    const label = brand.current;
    const title = document.getElementById('hero-title');
    if (!nav || !label || !title) return;
    const root = document.documentElement;
    const native = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()');
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let distance = 1;
    let fx = 0;
    let fy = 0;
    let k = 1;

    const measure = () => {
      // Read both ends with the animation parked.
      root.dataset.morph = 'measure';
      nav.style.setProperty('--p', '1');
      title.style.transform = 'none';
      const scrollY = window.scrollY;
      const t = title.getBoundingClientRect();
      const target = label.getBoundingClientRect();
      const top = t.top + scrollY;
      k = (parseFloat(getComputedStyle(label).fontSize) || 15) / (parseFloat(getComputedStyle(title).fontSize) || 1);
      distance = Math.max(260, top + 60);
      fx = target.left - t.left;
      fy = target.top + target.height / 2 - (top - distance) - (t.height * k) / 2;
      nav.style.setProperty('--brand-w', `${label.scrollWidth}px`);
      root.style.setProperty('--fly-distance', `${distance}px`);
      root.style.setProperty('--fly-x', `${fx}px`);
      root.style.setProperty('--fly-y', `${fy}px`);
      root.style.setProperty('--fly-k', String(k));
      nav.style.removeProperty('--p');
      title.style.transform = '';
      root.dataset.morph = native && !still ? 'native' : 'script';
    };

    let frame = 0;
    const paint = () => {
      frame = 0;
      const e = still ? 1 : smooth(Math.min(1, Math.max(0, window.scrollY / distance)));
      const done = e >= 0.995;
      // Safari can defer its scroll timeline after an anchor/scrollIntoView
      // jump. Synchronize the handoff even when the compositor owns motion.
      nav.dataset.brand = done ? 'shown' : '';
      title.toggleAttribute('data-docked', done);
      if (root.dataset.morph !== 'script') return;
      const s = 1 - (1 - k) * e;
      nav.style.setProperty('--p', String(e));
      title.style.transform = `translate(${fx * e}px, ${fy * e}px) scale(${s})`;
      title.style.opacity = done ? '0' : '';
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const resize = () => {
      measure();
      paint();
    };

    measure();
    paint();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('scrollend', schedule);
    window.addEventListener('hashchange', schedule);
    window.addEventListener('resize', resize);
    document.fonts?.ready.then(resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('scrollend', schedule);
      window.removeEventListener('hashchange', schedule);
      window.removeEventListener('resize', resize);
      delete root.dataset.morph;
      title.style.transform = '';
      title.style.opacity = '';
      title.removeAttribute('data-docked');
      delete nav.dataset.brand;
    };
  }, [bar, brand]);
}

type Rgb = [number, number, number];

const swatches = new Map<string, Rgb | null>();

/** Average colour of an image or video frame, from a 6x6 downsample. */
function swatch(media: HTMLImageElement | HTMLVideoElement): Rgb | null {
  const key = media instanceof HTMLVideoElement ? '' : media.currentSrc || media.src;
  if (key && swatches.has(key)) return swatches.get(key)!;
  let rgb: Rgb | null = null;
  try {
    const ready = media instanceof HTMLVideoElement ? media.readyState >= 2 : media.complete && media.naturalWidth > 0;
    if (ready) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 6;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(media, 0, 0, 6, 6);
      const data = ctx.getImageData(0, 0, 6, 6).data;
      const sum: Rgb = [0, 0, 0];
      for (let i = 0; i < data.length; i += 4) for (let c = 0; c < 3; c++) sum[c] += data[i + c];
      rgb = sum.map((v) => v / 36) as Rgb;
    }
  } catch {
    /* cross-origin media can't be read */
  }
  if (key && rgb) swatches.set(key, rgb);
  return rgb;
}

/** What colour sits under a point, ignoring the nav itself. */
function colourAt(x: number, y: number, skip: Element): Rgb | null {
  for (const el of document.elementsFromPoint(x, y)) {
    if (skip.contains(el)) continue;
    if (el instanceof HTMLImageElement || el instanceof HTMLVideoElement) {
      const rgb = swatch(el);
      if (rgb) return rgb;
      continue;
    }
    const match = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if (match && (match[3] === undefined || Number(match[3]) > 0.5)) return [Number(match[0]), Number(match[1]), Number(match[2])];
  }
  return null;
}

/**
 * iOS bars read what scrolls beneath them: the glass lightens over bright
 * content and deepens over dark, and the labels flip to stay legible, easing
 * across as the page moves. Samples a row of points under the bar on scroll.
 */
function useAdaptiveTone(bar: React.RefObject<HTMLDivElement | null>, wrap: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const nav = bar.current;
    const header = wrap.current;
    if (!nav || !header) return;
    let frame = 0;
    let idle = 0;
    let last = 0;
    const sample = () => {
      frame = 0;
      last = performance.now();
      const r = nav.getBoundingClientRect();
      const sum: Rgb = [0, 0, 0];
      let n = 0;
      for (let i = 0; i < 5; i++) {
        const x = r.left + 10 + ((r.width - 20) * i) / 4;
        for (const y of [r.top + 6, r.bottom - 6]) {
          const rgb = colourAt(x, y, header);
          if (!rgb) continue;
          for (let c = 0; c < 3; c++) sum[c] += rgb[c];
          n++;
        }
      }
      if (!n) return;
      const [red, green, blue] = sum.map((v) => v / n);
      const luma = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
      // A little hysteresis so the bar doesn't flicker over mid-grey content.
      const current = nav.dataset.tone;
      const tone = luma > (current === 'light' ? 0.42 : 0.58) ? 'light' : 'dark';
      nav.dataset.tone = tone;
      nav.style.setProperty('--nav-under', `rgb(${red | 0} ${green | 0} ${blue | 0})`);
    };
    // About ten reads a second while scrolling: the tone eases over 420ms,
    // so sampling every frame would only cost battery on long scrolls.
    const schedule = () => {
      if (!frame && performance.now() - last > 100) frame = requestAnimationFrame(sample);
      // Catches the final position, and media that settles after scrolling.
      clearTimeout(idle);
      idle = window.setTimeout(sample, 140);
    };
    sample();
    const theme = new MutationObserver(schedule);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(idle);
      theme.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('load', schedule);
      delete nav.dataset.tone;
    };
  }, [bar, wrap]);
}

export function Nav() {
  const wrap = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const brand = useRef<HTMLSpanElement>(null);
  useRefraction(bar, { kind: 'surface', bezel: 14, thickness: 22, strength: 1.3 });
  useTitleMorph(bar, brand);
  useAdaptiveTone(bar, wrap);

  return (
    <header ref={wrap} className="nav-wrap">
      <div className="nav-shell">
        {/* Colour from beneath pools in the rim, blurred and saturated, the
            way light gathers in the curved edge of real glass. */}
        <span className="nav__bleed" aria-hidden="true" />
        <div ref={bar} className="lg-glass lg-glass--host nav">
          <a className="nav__brand" href="#top" aria-label="Liquid Glass home">
            <span ref={brand}>Liquid Glass</span>
          </a>
          <nav className="nav__links" aria-label="Sections">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
            <a href="https://github.com/zakisheriff/Liquid-Glass" target="_blank" rel="noreferrer" aria-label="GitHub">
              <GitHub size={16} />
            </a>
          </nav>
          <div className="nav__actions">
            <GlassButton
              size="sm"
              className="nav__theme"
              data-mode={theme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              icon={
                <span className="nav__theme-icons">
                  <Sun size={18} />
                  <Moon size={17} />
                </span>
              }
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
            <GlassButton
              size="sm"
              variant="filled"
              onClick={() => document.getElementById('install')?.scrollIntoView()}
            >
              Install
            </GlassButton>
            <GlassButton
              size="sm"
              variant="filled"
              tint="#ff375f"
              className="nav__donate"
              aria-label="Support on Buy Me a Coffee"
              onClick={() => window.open(SUPPORT_URL, '_blank', 'noopener,noreferrer')}
            >
              Support
            </GlassButton>
          </div>
        </div>
      </div>
    </header>
  );
}
