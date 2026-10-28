'use client';

import { useEffect, useRef } from 'react';
import { GlassButton, useRefraction } from '@zakisheriff/liquid-glass';
import { useTheme } from './theme';
import { GitHub, Moon, Sun } from './icons';

const LINKS = [
  { href: '#components', label: 'Components' },
  { href: '#refraction', label: 'Refraction' },
  { href: '#install', label: 'Install' },
];

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Scroll-linked morph: the hero title shrinks and flies into the nav as the
 * page scrolls, while the nav pill grows a slot for it. At the end the real
 * nav label takes over and the hero title hides.
 */
function useTitleMorph(bar: React.RefObject<HTMLDivElement | null>, brand: React.RefObject<HTMLSpanElement | null>) {
  useEffect(() => {
    const nav = bar.current;
    const label = brand.current;
    const title = document.getElementById('hero-title');
    if (!nav || !label || !title) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let natural = { left: 0, top: 0, height: 0, size: 1 };
    let labelWidth = 0;
    let distance = 1;
    let frame = 0;

    const measure = () => {
      title.style.transform = 'none';
      const r = title.getBoundingClientRect();
      natural = {
        left: r.left,
        top: r.top + window.scrollY,
        height: r.height,
        size: parseFloat(getComputedStyle(title).fontSize) || 1,
      };
      labelWidth = label.scrollWidth;
      nav.style.setProperty('--brand-w', `${labelWidth}px`);
      distance = Math.max(140, natural.top - 30);
    };

    const paint = () => {
      frame = 0;
      const y = window.scrollY;
      const e = still ? 1 : smooth(Math.min(1, Math.max(0, y / distance)));
      nav.style.setProperty('--p', String(e));
      const done = e >= 0.995;
      title.style.visibility = done ? 'hidden' : '';
      nav.dataset.brand = done ? 'shown' : '';
      if (done || e === 0) {
        title.style.transform = e === 0 ? 'none' : title.style.transform;
        if (e === 0) return;
      }
      const target = label.getBoundingClientRect();
      const k = (parseFloat(getComputedStyle(label).fontSize) || 15) / natural.size;
      const k1 = 1 - (1 - k) * e;
      const top = natural.top - y;
      const dx = target.left - natural.left;
      const dy = target.top + target.height / 2 - (top + (natural.height * k) / 2);
      title.style.transform = `translate(${dx * e}px, ${dy * e}px) scale(${k1})`;
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
    window.addEventListener('resize', resize);
    document.fonts?.ready.then(resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', resize);
      title.style.transform = '';
      title.style.visibility = '';
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
            Get
          </GlassButton>
        </div>
      </div>
    </header>
  );
}
