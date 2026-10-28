'use client';

import { useRef } from 'react';
import { GlassButton, useRefraction } from '@zakisheriff/liquid-glass';
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
  useRefraction(bar, { kind: 'surface', bezel: 14, thickness: 22, strength: 1.3 });

  return (
    <header className="nav-wrap">
      <div ref={bar} className="lg-glass nav">
        <a className="nav__brand" href="#top" aria-label="Liquid Glass home">
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
