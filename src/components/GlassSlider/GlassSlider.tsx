import React, { useMemo } from 'react';
import { useGlassFilterMounted } from '../../filters/LiquidGlassFilter';
import './GlassSlider.css';

export interface GlassSliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Blur intensity from 1 (subtle) to 10 (heavy). Default 5. */
  intensity?: number;
  /** CSS colour value used to tint the glass surface. */
  tint?: string;
  /** Enable the animated shine overlay. Default true. */
  shimmer?: boolean;
  /** Bevel border thickness in pixels. Default 1. */
  thickness?: number;
  /** Display the sliding circular thumb knob. Default true. */
  showThumb?: boolean;
  /** Icon element to display inside the left of the track. */
  icon?: React.ReactNode;
  /** Text label displayed inside the track. */
  label?: string;
  /** Custom callback for slider value changes. */
  onChange?: (value: number) => void;
}

/**
 * A highly interactive custom slider component replicating the iOS 26 liquid glass aesthetic.
 *
 * Can render in two modes:
 *  1. Control block mode (showThumb={false}): Filled like a volume/brightness slider.
 *  2. Classic track mode (showThumb={true}): Sleek track with a glowing liquid glass bead thumb.
 */
export const GlassSlider = React.forwardRef<HTMLInputElement, GlassSliderProps>(
  (
    {
      intensity = 5,
      tint,
      shimmer = true,
      thickness = 1,
      showThumb = true,
      icon,
      label,
      value = 0,
      min = 0,
      max = 100,
      onChange,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const isFilterMounted = useGlassFilterMounted();
    const clampedIntensity = Math.max(1, Math.min(10, Math.round(intensity)));

    const numValue = Number(value);
    const numMin = Number(min);
    const numMax = Number(max);
    const percentage = numMax > numMin ? ((numValue - numMin) / (numMax - numMin)) * 100 : 0;
    const ratio = numMax > numMin ? (numValue - numMin) / (numMax - numMin) : 0;

    const glassStyle = useMemo<React.CSSProperties>(() => {
      const filterId = `liquid-glass-refract-${clampedIntensity}`;
      const vars: Record<string, string | number> = {
        '--glass-blur': `${clampedIntensity * 2.4}px`,
        '--glass-border-width': `${thickness}px`,
        '--glass-refraction-filter': `url(#${filterId})`,
        '--slider-percentage': `${percentage}%`,
        '--slider-ratio': ratio,
      };

      if (tint) {
        vars['--glass-tint'] = tint;
      }

      return vars as React.CSSProperties;
    }, [clampedIntensity, tint, thickness, percentage, ratio]);

    const rootClasses = [
      'lg-root',
      'lg-slider',
      shimmer ? 'lg-slider--shimmer' : '',
      showThumb ? 'lg-slider--with-thumb' : 'lg-slider--no-thumb',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(Number(e.target.value));
      }
    };

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

        <div className="lg-slider-track">
          {/* Sibling Backdrop Surface representing the glass track */}
          <div className="lg-backdrop-surface" aria-hidden="true" />

          {/* Sibling Active Fill Overlay wrapped in an overflow-hidden container */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit', zIndex: 2, pointerEvents: 'none' }}>
            <div className="lg-slider-fill" aria-hidden="true" />
          </div>

          {/* Sibling Shadow */}
          <div className="lg-shadow" aria-hidden="true" />

          {/* Inner Content (Icon, Label, Value Text) */}
          <div className="lg-slider-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {icon && <span className="lg-slider-icon">{icon}</span>}
              {label && <span className="lg-slider-label">{label}</span>}
            </div>
            <span className="lg-slider-value-text">{numValue}</span>
          </div>

          {/* Sliding Liquid Glass Thumb knob */}
          {showThumb && <div className="lg-slider-thumb" aria-hidden="true" />}

          {/* Native range input overlay for accessibility and standard event handling */}
          <input
            type="range"
            ref={ref}
            min={min}
            max={max}
            value={value}
            onChange={handleChange}
            className="lg-slider-input"
            {...rest}
          />
        </div>
      </div>
    );
  },
);

GlassSlider.displayName = 'GlassSlider';
