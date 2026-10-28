'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: 'light',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, set] = useState<Theme>('light');

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (current === 'dark' || current === 'light') set(current);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    set(next);
    const root = document.documentElement;
    root.dataset.theme = next;
    root.style.colorScheme = next;
    document.getElementById('theme-color')?.setAttribute('content', next === 'dark' ? '#000000' : '#f5f5f7');
    try {
      localStorage.setItem('lg-theme', next);
    } catch {
      /* private mode */
    }
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
