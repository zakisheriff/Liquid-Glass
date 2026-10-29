'use client';

import { GlassButton } from '@zakisheriff/liquid-glass';
import { Moon, Sun } from './icons';
import { useTheme } from './theme';

/** The site theme button from the home nav, for the docs page. */
export function DocsThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <GlassButton
      size="sm"
      className="nav__theme docs__theme"
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
  );
}
