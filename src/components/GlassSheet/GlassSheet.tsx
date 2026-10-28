import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SPRINGS, clamp, createSpring, rubberband, springFrom } from '../../engine/spring';
import { useRefraction } from '../../engine/refraction';
import './GlassSheet.css';

export interface GlassSheetProps {
  /** Whether the sheet is open. */
  open: boolean;
  /** Called when the user dismisses the sheet (scrim, Escape, or swipe down). */
  onClose?: () => void;
  /** Refraction strength from 1 (subtle) to 10 (heavy). Default 5. */
  intensity?: number;
  /** CSS colour washed over the glass. */
  tint?: string;
  /** Accessible name for the dialog. */
  'aria-label'?: string;
  children?: React.ReactNode;
}

const OPEN = springFrom(0.42, 0.86);
const CLOSE = springFrom(0.34, 1);

/**
 * iOS 26 floating sheet. Rises on a spring, can be flicked or dragged down to
 * dismiss, and rubber-bands when pulled up.
 */
export const GlassSheet: React.FC<GlassSheetProps> = ({ open, onClose, intensity = 5, tint, children, 'aria-label': ariaLabel }) => {
  const [mounted, setMounted] = useState(open);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const progress = useRef<ReturnType<typeof createSpring> | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (open) setMounted(true);
    else progress.current?.set(0);
  }, [open]);

  useRefraction(sheetRef, { kind: 'surface', strength: Math.max(1, Math.min(10, intensity)) / 5, bezel: 20, thickness: 28 }, mounted);

  useEffect(() => {
    if (!mounted) return;
    const sheet = sheetRef.current!;
    const scrim = scrimRef.current!;
    let height = sheet.offsetHeight || 400;
    let drag = 0;

    const paint = (p: number) => {
      const y = (1 - p) * (height + 24) + drag;
      sheet.style.transform = `translateY(${y}px)`;
      scrim.style.opacity = String(clamp(p, 0, 1) * clamp(1 - drag / height, 0, 1));
    };
    const spring = createSpring(0, OPEN, (p) => {
      paint(p);
      if (p <= 0.001 && spring.target === 0) setMounted(false);
    });
    progress.current = {
      ...spring,
      set(target: number, instant?: boolean) {
        spring.tune(target ? OPEN : CLOSE);
        spring.set(target, instant);
      },
    } as typeof spring;
    paint(0);
    requestAnimationFrame(() => {
      height = sheet.offsetHeight || height;
      if (open) progress.current?.set(1);
    });

    let gesture: { id: number; y: number; t: number; v: number } | null = null;
    const down = (event: PointerEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target as HTMLElement;
      if (!target.closest('.lg-sheet__grabber-zone') && sheet.scrollTop > 0) return;
      if (target.closest('input, textarea, button, a, [role="slider"], [role="switch"]')) return;
      gesture = { id: event.pointerId, y: event.clientY, t: event.timeStamp, v: 0 };
      sheet.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerId !== gesture?.id) return;
      const dy = event.clientY - gesture.y;
      const dt = Math.max(1, event.timeStamp - gesture.t);
      gesture.v = (dy - drag) / dt;
      gesture.t = event.timeStamp;
      drag = dy > 0 ? dy : rubberband(dy, height, 0.3);
      paint(spring.value);
    };
    const up = (event: PointerEvent) => {
      if (event.pointerId !== gesture?.id) return;
      const flick = gesture.v > 0.6;
      gesture = null;
      const settle = createSpring(drag, SPRINGS.snap, (value) => {
        drag = value;
        paint(spring.value);
      });
      if (flick || drag > height * 0.3) {
        settle.stop();
        // Hand the current offset over to the close spring.
        const p = 1 - clamp(drag / (height + 24), 0, 1);
        drag = 0;
        spring.set(p, true);
        closeRef.current?.();
      } else {
        settle.set(0);
      }
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current?.();
    };
    sheet.addEventListener('pointerdown', down);
    sheet.addEventListener('pointermove', move);
    sheet.addEventListener('pointerup', up);
    sheet.addEventListener('pointercancel', up);
    window.addEventListener('keydown', key);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sheet.focus({ preventScroll: true });
    return () => {
      spring.stop();
      progress.current = null;
      sheet.removeEventListener('pointerdown', down);
      sheet.removeEventListener('pointermove', move);
      sheet.removeEventListener('pointerup', up);
      sheet.removeEventListener('pointercancel', up);
      window.removeEventListener('keydown', key);
      document.body.style.overflow = overflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="lg-sheet-layer" data-liquid-glass="">
      <div ref={scrimRef} className="lg-sheet__scrim" onClick={() => onClose?.()} aria-hidden="true" />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className="lg-glass lg-glass--host lg-sheet"
        style={tint ? ({ '--lg-host-tint': tint } as React.CSSProperties) : undefined}
      >
        <div className="lg-sheet__grabber-zone" aria-hidden="true">
          <span className="lg-sheet__grabber" />
        </div>
        <div className="lg-sheet__content">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

GlassSheet.displayName = 'GlassSheet';
