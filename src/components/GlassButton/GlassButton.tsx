import React, { useMemo } from 'react';
import { useGlassFilterMounted } from '../../filters/LiquidGlassFilter';
import './GlassButton.css';

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Blur intensity from 1 (subtle) to 10 (heavy). Default 5. */
  intensity?: number;
  /** CSS colour value used to tint the glass surface. */
  tint?: string;
  /** Enable the animated shine overlay. Default true. */
  shimmer?: boolean;
  /** Bevel border thickness in pixels. Default 1. */
  thickness?: number;
  /** Predefined size preset. Default 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Visual style variant. Default 'default'. */
  variant?: 'default' | 'ghost' | 'destructive';
  children?: React.ReactNode;
}

/**
 * A glassmorphic button component inspired by the wabi.ai approach.
 *
 * Renders a 3‑layer structure:
 *  1. `.lg-root`    — outer wrapper for layout and stacking context
 *  2. `.lg-surface` — interactive `<button>` with backdrop‑filter, box‑shadow,
 *                     and a `::after` conic‑gradient border ring
 *  3. `.lg-shadow`  — decorative blurred gradient sitting behind the surface
 */
export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      intensity = 5,
      tint,
      shimmer = true,
      thickness = 1,
      size = 'md',
      variant = 'default',
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
        '--glass-refraction-filter': `url(#${filterId})`,
      };

      if (tint) {
        vars['--glass-tint'] = tint;
      }

      return vars as React.CSSProperties;
    }, [clampedIntensity, tint, thickness]);

    const rootClasses = [
      'lg-root',
      'lg-button',
      `lg-button--${size}`,
      `lg-button--${variant}`,
      shimmer ? 'lg-button--shimmer' : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const freq1 = 0.012 + clampedIntensity * 0.001;
    const freq2 = 0.01 + clampedIntensity * 0.0008;
    const scale = clampedIntensity * 2;

    return (
      <div className={rootClasses} data-liquid-glass style={{ ...glassStyle, ...style }}>
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
        <button
          ref={ref}
          className="lg-surface"
          {...rest}
        >
          <span className="lg-content">{children}</span>
        </button>
        <div className="lg-backdrop-surface" aria-hidden="true" />
        <div className="lg-shadow" aria-hidden="true" />
      </div>
    );
  },
);

GlassButton.displayName = 'GlassButton';

