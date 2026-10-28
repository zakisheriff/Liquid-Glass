import React, { useImperativeHandle, useRef } from 'react';
import { useRefraction } from '../../engine/refraction';
import './GlassCard.css';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Refraction strength from 1 (subtle) to 10 (heavy). Default 5. */
  intensity?: number;
  /** CSS colour washed over the glass. */
  tint?: string;
  /** Kept for API compatibility. */
  shimmer?: boolean;
  /** Rim bevel scale (1–4). Default 1. */
  thickness?: number;
  /** Inner padding. Default '24px'. */
  padding?: string;
  /** Corner radius. Default '28px'. */
  radius?: string;
  /** `regular` frosted panel (default) or `clear` see-through glass. */
  variant?: 'regular' | 'clear';
  children?: React.ReactNode;
}

/** A refracting glass panel for grouping content. */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    { intensity = 5, tint, shimmer: _shimmer, thickness = 1, padding = '24px', radius = '28px', variant = 'regular', className, style, children, ...rest },
    forwardedRef,
  ) => {
    const ref = useRef<HTMLDivElement>(null);
    useImperativeHandle(forwardedRef, () => ref.current!);
    useRefraction(ref, {
      kind: 'surface',
      strength: Math.max(1, Math.min(10, intensity)) / 5,
      bezel: 16 * Math.max(0.5, thickness),
      thickness: 22 * Math.max(0.5, thickness),
    });

    return (
      <div
        ref={ref}
        className={['lg-glass', 'lg-card', `lg-card--${variant}`, className].filter(Boolean).join(' ')}
        data-liquid-glass=""
        style={{ padding, borderRadius: radius, ...(tint ? { '--lg-card-tint': tint } : {}), ...style } as React.CSSProperties}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

GlassCard.displayName = 'GlassCard';
