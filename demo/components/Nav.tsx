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
      // The nav's slot always follows script: Safari leaves a scroll-timeline
      // custom property stale after a quick scroll back up, holding the slot
      // open with the nav's contents unpainted.
      nav.style.setProperty('--p', String(e));
      if (root.dataset.morph !== 'script') return;
      const s = 1 - (1 - k) * e;
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

export function Nav() {
  const bar = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const brand = useRef<HTMLSpanElement>(null);
  useRefraction(bar, { kind: 'surface', bezel: 14, thickness: 22, strength: 1.3 });
  useTitleMorph(bar, brand);

  return (
    <header className="nav-wrap">
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
    </header>
  );
}
