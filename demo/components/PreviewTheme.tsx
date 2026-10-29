'use client';

import { createContext, useContext, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
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

/**
 * Switch a preview's theme as one crossfade: the old look is snapshotted and
 * fades out over the new one, so glass surfaces that re-render one by one
 * never show a half-switched preview.
 */
function crossfade(scope: HTMLElement | null | undefined, update: () => void) {
  if (!scope || !document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update();
    return;
  }
  scope.style.setProperty('view-transition-name', 'preview-theme');
  const transition = document.startViewTransition(() => flushSync(update));
  void transition.ready.catch(() => {});
  void transition.finished.catch(() => {}).finally(() => scope.style.removeProperty('view-transition-name'));
}

export function PreviewThemeToggle({ label, mode, onChange }: {
  label: string;
  mode: PreviewMode;
  onChange: (mode: PreviewMode) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="preview-theme-toggle">
      <Sun size={15} />
      <GlassSwitch
        checked={mode === 'dark'}
        onChange={(dark) => crossfade(ref.current?.closest<HTMLElement>('.preview-scope'), () => onChange(dark ? 'dark' : 'light'))}
        aria-label={`${label} dark mode`}
      />
      <Moon size={15} />
    </div>
  );
}
