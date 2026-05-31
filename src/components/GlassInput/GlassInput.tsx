import React, { useMemo, useId, useState, useCallback } from 'react';
import { useGlassFilterMounted } from '../../filters/LiquidGlassFilter';
import './GlassInput.css';

export interface GlassInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Blur intensity from 1 (subtle) to 10 (heavy). Default 5. */
  intensity?: number;
  /** CSS colour value used to tint the glass surface. */
  tint?: string;
  /** Placeholder text for the input. */
  placeholder?: string;
  /** Controlled value. */
  value?: string;
  /** Change handler. */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Floating label text displayed above the input. */
  label?: string;
}

/**
 * A glassmorphic text input with floating label and edge‑diffraction focus glow.
 *
 * Uses the same 3‑layer wabi.ai structure as other Liquid Glass components.
 * On focus the conic‑gradient border animates and a pulsing box‑shadow with
 * hue‑rotate creates a prismatic edge‑diffraction effect.
 */
export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  (
    {
      intensity = 5,
      tint,
      placeholder,
      value,
      onChange,
      label,
      className,
      style,
      id: externalId,
      ...rest
    },
    ref,
  ) => {
    const autoId = useId();
    const inputId = externalId ?? autoId;

    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(() => Boolean(value));

    const isFilterMounted = useGlassFilterMounted();
    const clampedIntensity = Math.max(1, Math.min(10, Math.round(intensity)));

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        rest.onFocus?.(e);
      },
      [rest.onFocus],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        rest.onBlur?.(e);
      },
      [rest.onBlur],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasValue(e.target.value.length > 0);
        onChange?.(e);
      },
      [onChange],
    );

    const glassStyle = useMemo<React.CSSProperties>(() => {
      const filterId = `liquid-glass-refract-${clampedIntensity}`;
      const vars: Record<string, string | number> = {
        '--glass-blur': `${clampedIntensity * 2.4}px`,
        '--glass-border-width': '1px',
        '--glass-refraction-filter': `url(#${filterId})`,
      };

      if (tint) {
        vars['--glass-tint'] = tint;
      }

      return vars as React.CSSProperties;
    }, [clampedIntensity, tint]);

    const rootClasses = [
      'lg-root',
      'lg-input',
      focused ? 'lg-input--focused' : '',
      hasValue || value ? 'lg-input--has-value' : '',
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
        <div className="lg-surface lg-input__surface">
          <div className="lg-content lg-input__content">
            {label && (
              <label className="lg-input__label" htmlFor={inputId}>
                {label}
              </label>
            )}
            <input
              ref={ref}
              id={inputId}
              className="lg-input__field"
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...rest}
            />
          </div>
        </div>
        <div className="lg-backdrop-surface lg-input__backdrop-surface" aria-hidden="true" />
        <div className="lg-shadow" aria-hidden="true" />
      </div>
    );
  },
);

GlassInput.displayName = 'GlassInput';
