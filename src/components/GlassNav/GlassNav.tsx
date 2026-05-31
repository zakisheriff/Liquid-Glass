import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useGlassFilterMounted } from '../../filters/LiquidGlassFilter';
import './GlassNav.css';

export interface GlassNavItem {
  label: string;
  icon?: React.ReactNode;
}

export interface GlassNavProps {
  /** Navigation items to render. */
  items: GlassNavItem[];
  /** Zero‑based index of the active item. Default 0. */
  activeIndex?: number;
  /** Called when the user clicks a nav item. */
  onChange?: (index: number) => void;
  /** Blur intensity from 1 (subtle) to 10 (heavy). Default 5. */
  intensity?: number;
}

/**
 * A pill‑shaped glassmorphic navigation bar.
 *
 * A translucent active‑indicator slides between items via a spring‑like
 * cubic‑bezier transition. Each item has subtle hover and press effects.
 */
export const GlassNav: React.FC<GlassNavProps> = ({
  items,
  activeIndex = 0,
  onChange,
  intensity = 5,
}) => {
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isFilterMounted = useGlassFilterMounted();
  const clampedIntensity = Math.max(1, Math.min(10, Math.round(intensity)));

  /* ------------------------------------------------------------------ */
  /*  Sliding indicator position                                         */
  /* ------------------------------------------------------------------ */
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  const updateIndicator = useCallback(() => {
    const el = itemRefs.current[activeIndex];
    const parent = navRef.current;
    if (!el || !parent) return;
    const parentRect = parent.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setIndicatorStyle({
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transform: `translateX(${rect.left - parentRect.left}px)`,
    });
  }, [activeIndex]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator, items.length]);

  const glassStyle = useMemo<React.CSSProperties>(() => {
    const filterId = `liquid-glass-refract-${clampedIntensity}`;
    return {
      '--glass-blur': `${clampedIntensity * 2.4}px`,
      '--glass-border-width': '1px',
      '--glass-refraction-filter': `url(#${filterId})`,
    } as React.CSSProperties;
  }, [clampedIntensity]);

  const freq1 = 0.012 + clampedIntensity * 0.001;
  const freq2 = 0.01 + clampedIntensity * 0.0008;
  const scale = clampedIntensity * 2;

  return (
    <div className="lg-root lg-nav" data-liquid-glass style={glassStyle}>
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
      <div className="lg-surface lg-nav__surface">
        {/* Sliding active indicator */}
        <div className="lg-nav__indicator" style={indicatorStyle} aria-hidden="true" />

        <nav ref={navRef} className="lg-content lg-nav__content" role="tablist">
          {items.map((item, i) => (
            <button
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              role="tab"
              aria-selected={i === activeIndex}
              className={`lg-nav__item${i === activeIndex ? ' lg-nav__item--active' : ''}`}
              onClick={() => onChange?.(i)}
              type="button"
            >
              {item.icon && <span className="lg-nav__icon">{item.icon}</span>}
              <span className="lg-nav__label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="lg-backdrop-surface lg-nav__backdrop-surface" aria-hidden="true" />
      <div className="lg-shadow" aria-hidden="true" />
    </div>
  );
};

GlassNav.displayName = 'GlassNav';
