import { useMemo } from 'react';

export interface UseGlassEffectOptions {
  intensity?: number;
  tint?: string;
  shimmer?: boolean;
  thickness?: number;
  blur?: number;
}

interface GlassEffectResult {
  style: React.CSSProperties;
  filterId: string;
}

function parseTintColor(tint: string): { h: number; s: number; l: number; a: number } {
  // Default values
  const defaults = { h: 0, s: 0, l: 100, a: 0.1 };

  if (!tint) return defaults;

  // Handle rgba
  const rgbaMatch = tint.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]) / 255;
    const g = parseInt(rgbaMatch[2]) / 255;
    const b = parseInt(rgbaMatch[3]) / 255;
    const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) return { h: 0, s: 0, l: l * 100, a };

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;

    return { h: h * 360, s: s * 100, l: l * 100, a };
  }

  // Handle hex
  const hexMatch = tint.match(/^#([\da-f]{3,8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) return { h: 0, s: 0, l: l * 100, a };

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;

    return { h: h * 360, s: s * 100, l: l * 100, a };
  }

  return defaults;
}

export function useGlassEffect(options: UseGlassEffectOptions = {}): GlassEffectResult {
  const {
    intensity = 5,
    tint,
    shimmer = true,
    thickness,
    blur,
  } = options;

  return useMemo(() => {
    const clampedIntensity = Math.max(1, Math.min(10, Math.round(intensity)));
    const filterId = `liquid-glass-refract-${clampedIntensity}`;

    const style: React.CSSProperties = {
      '--glass-intensity': clampedIntensity,
      '--glass-shimmer': shimmer ? 1 : 0,
    } as React.CSSProperties;

    if (tint) {
      const parsed = parseTintColor(tint);
      (style as Record<string, unknown>)['--glass-tint-h'] = parsed.h;
      (style as Record<string, unknown>)['--glass-tint-s'] = `${parsed.s}%`;
      (style as Record<string, unknown>)['--glass-tint-l'] = `${parsed.l}%`;
      (style as Record<string, unknown>)['--glass-tint-a'] = parsed.a;
    }

    if (thickness !== undefined) {
      (style as Record<string, unknown>)['--glass-border-width'] = `${thickness}px`;
    }

    if (blur !== undefined) {
      (style as Record<string, unknown>)['--glass-blur'] = `${blur}px`;
    }

    return { style, filterId };
  }, [intensity, tint, shimmer, thickness, blur]);
}
