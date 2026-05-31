import React, { useMemo } from 'react';
import { useGlassFilterMounted } from '../../filters/LiquidGlassFilter';
import './GlassCard.css';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Blur intensity from 1 (subtle) to 10 (heavy). Default 5. */
  intensity?: number;
  /** CSS colour value used to tint the glass surface. */
  tint?: string;
  /** Enable the animated border shimmer. Default true. */
  shimmer?: boolean;
  /** Bevel border thickness in pixels. Default 1. */
  thickness?: number;
  /** CSS padding value for inner content. Default '24px'. */
  padding?: string;
  /** CSS border-radius value. Default '20px'. */
  radius?: string;
  children?: React.ReactNode;
}

/**
 * A glassmorphic card / container component.
 *
 * Uses the same 3‑layer wabi.ai glass architecture as GlassButton but with
 * customisable border‑radius for rectangular containers and a generous
 * content area.
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      intensity = 5,
      tint,
      shimmer = true,
      thickness = 1,
      padding = '24px',
      radius = '20px',
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const isFilterMounted = useGlassFilterMounted();
    const clampedIntensity = Math.max(1, Math.min(10, Math.round(intensity)));

    const glassStyle = useMemo<React.CSSProperties>(() => {
      const filterId = `liquid-glass-refract-${clampedIntensity}`;
      const vars: Record<string, string | number> = {
        '--glass-blur': `${clampedIntensity * 2.4}px`,
        '--glass-border-width': `${thickness}px`,
        '--glass-radius': radius,
        '--glass-padding': padding,
        '--glass-refraction-filter': `url(#${filterId})`,
      };

      if (tint) {
        vars['--glass-tint'] = tint;
      }

      return vars as React.CSSProperties;
    }, [clampedIntensity, tint, thickness, radius, padding]);

    const rootClasses = [
      'lg-root',
      'lg-card',
      shimmer ? 'lg-card--shimmer' : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const freq1 = 0.012 + clampedIntensity * 0.001;
    const freq2 = 0.01 + clampedIntensity * 0.0008;
    const scale = clampedIntensity * 2;

    return (
      <div
        ref={ref}
        className={rootClasses}
        data-liquid-glass
        style={{ ...glassStyle, ...style }}
        {...rest}
      >
        {!isFilterMounted && (
          <svg
            width="0"
            height="0"
            style={{ position: 'absolute', pointerEvents: 'none' }}
            aria-hidden="true"
          >
            <defs>
              <filter
                id={`liquid-glass-refract-${clampedIntensity}`}
                x="-10%"
                y="-10%"
                width="120%"
                height="120%"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency={`${freq1} ${freq2}`}
                  numOctaves={3}
                  seed={42}
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale={scale}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
          </svg>
        )}
        <div className="lg-surface lg-card__surface">
          <div className="lg-content lg-card__content">{children}</div>
        </div>
        <div className="lg-backdrop-surface lg-card__backdrop-surface" aria-hidden="true" />
        <div className="lg-shadow" aria-hidden="true" />
      </div>
    );
  },
);

GlassCard.displayName = 'GlassCard';
