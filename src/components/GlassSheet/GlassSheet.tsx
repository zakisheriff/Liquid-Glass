import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useGlassFilterMounted } from '../../filters/LiquidGlassFilter';
import './GlassSheet.css';

export interface GlassSheetProps {
  /** Whether the sheet is open. */
  open: boolean;
  /** Callback when the user requests to close the sheet. */
  onClose?: () => void;
  /** Blur intensity from 1 (subtle) to 10 (heavy). Default 5. */
  intensity?: number;
  /** CSS colour value used to tint the glass surface. */
  tint?: string;
  children?: React.ReactNode;
}

/**
 * A glassmorphic bottom‑sheet modal.
 *
 * When `open` is `true` a scrim fades in and the glass sheet slides up from the
 * bottom of the viewport. Clicking the scrim or pressing Escape calls `onClose`.
 * A drag handle is rendered at the top of the sheet.
 *
 * Mount/unmount is handled via CSS transitions — the component stays in the DOM
 * while its exit animation plays, then unmounts.
 */
export const GlassSheet: React.FC<GlassSheetProps> = ({
  open,
  onClose,
  intensity = 5,
  tint,
  children,
}) => {
  /* ------------------------------------------------------------------ */
  /*  Mounted / visible state machine for enter/exit CSS transitions    */
  /* ------------------------------------------------------------------ */
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const isFilterMounted = useGlassFilterMounted();
  const clampedIntensity = Math.max(1, Math.min(10, Math.round(intensity)));

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Force a reflow so the initial styles are applied before the
      // transition‑triggering class is added.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
    }
  }, [open]);

  /** When the exit transition ends, unmount. */
  const handleTransitionEnd = useCallback(() => {
    if (!open) setMounted(false);
  }, [open]);

  /** Close on Escape. */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  /** Lock body scroll while the sheet is mounted. */
  useEffect(() => {
    if (mounted) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mounted]);

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

  const freq1 = 0.012 + clampedIntensity * 0.001;
  const freq2 = 0.01 + clampedIntensity * 0.0008;
  const scale = clampedIntensity * 2;

  if (!mounted) return null;

  return (
    <div
      className={`lg-sheet-overlay${visible ? ' lg-sheet-overlay--visible' : ''}`}
      onTransitionEnd={handleTransitionEnd}
      role="dialog"
      aria-modal="true"
    >
      {/* Scrim / backdrop */}
      <div className="lg-sheet-backdrop" onClick={onClose} aria-hidden="true" />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`lg-root lg-sheet${visible ? ' lg-sheet--visible' : ''}`}
        data-liquid-glass
        style={glassStyle}
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
        <div className="lg-surface lg-sheet__surface">
          {/* Drag handle */}
          <div className="lg-sheet__handle" aria-hidden="true">
            <span className="lg-sheet__handle-bar" />
          </div>

          <div className="lg-content lg-sheet__content">{children}</div>
        </div>
        <div className="lg-backdrop-surface lg-sheet__backdrop-surface" aria-hidden="true" />
        <div className="lg-shadow lg-sheet__shadow" aria-hidden="true" />
      </div>
    </div>
  );
};

GlassSheet.displayName = 'GlassSheet';
