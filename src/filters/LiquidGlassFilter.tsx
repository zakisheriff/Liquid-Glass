import React, { createContext, useContext } from 'react';

const GlassFilterContext = createContext(false);

export function useGlassFilterMounted(): boolean {
  return useContext(GlassFilterContext);
}

export interface LiquidGlassFilterProps {
  children?: React.ReactNode;
}

/**
 * Renders shared SVG filter definitions used by all liquid glass components.
 * Wrap your app (or the section using glass components) with this provider.
 * If not used, glass components will auto-inject a local filter.
 */
export function LiquidGlassFilter({ children }: LiquidGlassFilterProps) {
  return (
    <GlassFilterContext.Provider value={true}>
      <GlassFilterSVG />
      {children}
    </GlassFilterContext.Provider>
  );
}

function GlassFilterSVG() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        {/* Light refraction filter with increasing intensity */}
        {Array.from({ length: 10 }, (_, i) => {
          const level = i + 1;
          const scale = level * 2;
          const freq1 = 0.012 + level * 0.001;
          const freq2 = 0.01 + level * 0.0008;
          return (
            <filter
              key={level}
              id={`liquid-glass-refract-${level}`}
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
          );
        })}
      </defs>
    </svg>
  );
}
