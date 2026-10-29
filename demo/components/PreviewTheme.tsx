'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { GlassSwitch } from '@zakisheriff/liquid-glass';
import { useTheme } from './theme';
import { Moon, Sun } from './icons';

export type PreviewMode = 'light' | 'dark';
export const PreviewThemeContext = createContext<PreviewMode | null>(null);
export const PreviewThemeControlsContext = createContext<{ mode: PreviewMode; onChange: (mode: PreviewMode) => void } | null>(null);

export function PhonePreviewThemeToggle() {
  const controls = useContext(PreviewThemeControlsContext);
  return controls ? <PreviewThemeToggle label="Phone mockup" {...controls} /> : null;
}

export function usePreviewMode() {
  const { theme } = useTheme();
  const [override, setOverride] = useState<PreviewMode | null>(null);
  return [override ?? theme, setOverride] as const;
}

export function usePreviewTheme() {
  const inherited = useContext(PreviewThemeContext);
  const { theme } = useTheme();
  return inherited ?? theme;
}

export function PreviewThemeToggle({ label, mode, onChange, defer = false }: {
  label: string;
  mode: PreviewMode;
  onChange: (mode: PreviewMode) => void;
  /** Re-theme once the knob has slid instead of as it goes: for scenes heavy
   *  enough that repainting their glass would stall the knob. */
  defer?: boolean;
}) {
  const [dark, setDark] = useState(mode === 'dark');
  const timer = useRef(0);
  useEffect(() => setDark(mode === 'dark'), [mode]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <div className="preview-theme-toggle">
      <Sun size={15} />
      <GlassSwitch
        checked={dark}
        onChange={(next) => {
          setDark(next);
          window.clearTimeout(timer.current);
          if (!defer) return onChange(next ? 'dark' : 'light');
          timer.current = window.setTimeout(() => onChange(next ? 'dark' : 'light'), 240);
        }}
        aria-label={`${label} dark mode`}
      />
      <Moon size={15} />
    </div>
  );
}
