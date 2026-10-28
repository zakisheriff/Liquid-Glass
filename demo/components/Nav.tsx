'use client';

import { useRef } from 'react';
import { GlassButton, GlassSegmented, useRefraction } from '@zakisheriff/liquid-glass';
import { useTheme } from './theme';
import { GitHub, Moon, Sun } from './icons';

const LINKS = [
  { href: '#components', label: 'Components' },
  { href: '#refraction', label: 'Refraction' },
  { href: '#install', label: 'Install' },
];

export function Nav() {
  const bar = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  useRefraction(bar, { kind: 'surface', bezel: 10, thickness: 14 });

  return (
    <header className="nav-wrap">
      <div ref={bar} className="lg-glass nav">
        <a className="nav__brand" href="#top" aria-label="Liquid Glass home">
          <img src="/LG-Logo.png" alt="" width={22} height={22} />
          <span>Liquid Glass</span>
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
          <GlassSegmented
            size="sm"
            aria-label="Appearance"
            value={theme === 'dark' ? 1 : 0}
            onChange={(i) => setTheme(i === 1 ? 'dark' : 'light')}
            options={[
              { label: 'Light', icon: <Sun size={14} /> },
              { label: 'Dark', icon: <Moon size={14} /> },
            ]}
            className="nav__theme"
          />
          <GlassButton
            size="sm"
            variant="filled"
            onClick={() => document.getElementById('install')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get
          </GlassButton>
        </div>
      </div>
    </header>
  );
}
