import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clamp, createSpring, rubberband, springFrom } from '../../engine/spring';
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
  /** Optional portal host for a sheet contained within an app preview. */
  container?: HTMLElement | null;
  /**
   * Resting heights, like iOS `.presentationDetents`. `['medium', 'large']`
   * opens at half height; drag or flick up for full screen, down to settle or
   * dismiss. Leave unset for a sheet that fits its content.
   */
  detents?: Array<'medium' | 'large'>;
  /** Accessible name for the dialog. */
  'aria-label'?: string;
  children?: React.ReactNode;
}

const OPEN = springFrom(0.42, 0.86);
const CLOSE = springFrom(0.34, 1);
/** Settling onto a detent after a drag. */
const SNAP = springFrom(0.4, 0.84);

/**
 * iOS 26 floating sheet. Rises on a spring, can be flicked or dragged down to
 * dismiss, and rubber-bands when pulled up. With `detents` it rests at half
 * height and expands to full screen.
 */
export const GlassSheet: React.FC<GlassSheetProps> = ({ open, onClose, intensity = 5, tint, container, detents, children, 'aria-label': ariaLabel }) => {
  const [mounted, setMounted] = useState(open);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ close: () => void } | null>(null);
  const stopsKey = detents?.join(',') ?? '';
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (open) setMounted(true);
    else api.current?.close();
  }, [open]);

  useRefraction(sheetRef, { kind: 'surface', strength: Math.max(1, Math.min(10, intensity)) / 5, bezel: 20, thickness: 28 }, mounted);

  useEffect(() => {
    if (!mounted) return;
    const sheet = sheetRef.current!;
    const scrim = scrimRef.current!;
    const layer = sheet.parentElement!;
    const wanted = stopsKey ? (stopsKey.split(',') as Array<'medium' | 'large'>) : [];

    // Positions are the sheet's translateY in px: 0 is fully raised.
    let height = 0;
    let hidden = 0;
    let stops: number[] = [0];
    let rest = 0;
    let medium = 0;
    const measure = () => {
      height = sheet.offsetHeight || 400;
      hidden = height + 24;
      // Medium shows the sheet's top half of the screen's height.
      medium = Math.max(0, height - layer.clientHeight * 0.5);
      stops = wanted.length ? wanted.map((d) => (d === 'large' ? 0 : medium)).sort((x, y) => x - y) : [0];
      rest = wanted.includes('medium') ? medium : stops[0];
    };
    measure();

    const paint = (y: number) => {
      sheet.style.transform = `translateY(${y}px)`;
      // iOS leaves the page undimmed at the medium detent and dims it as the
      // sheet rises to full height.
      const dim = wanted.includes('medium') && medium > 0
        ? clamp(1 - y / medium, 0, 1)
        : clamp(1 - y / Math.max(1, height), 0, 1);
      scrim.style.opacity = String(dim);
      const raised = y <= 1;
      if (wanted.length && sheet.hasAttribute('data-raised') !== raised) sheet.toggleAttribute('data-raised', raised);
    };
    let closing = false;
    const position = createSpring(hidden, OPEN, (y) => {
      paint(y);
      if (closing && y >= hidden - 1) setMounted(false);
    });
    const go = (y: number, feel: typeof OPEN) => {
      position.tune(feel);
      position.set(y);
    };
    api.current = {
      close() {
        closing = true;
        go(hidden, CLOSE);
      },
    };
    paint(hidden);
    requestAnimationFrame(() => {
      measure();
      position.set(hidden, true);
      if (open) go(rest, OPEN);
    });

    let gesture: { id: number; y: number; from: number; t: number; v: number; last: number } | null = null;
    const down = (event: PointerEvent) => {
      if (event.defaultPrevented || closing) return;
      const target = event.target as HTMLElement;
      // Fully raised, the content scrolls; drag from the grabber or the top.
      const raised = position.value <= 1;
      if (raised && !target.closest('.lg-sheet__grabber-zone') && sheet.scrollTop > 0) return;
      if (target.closest('input, textarea, button, a, [role="slider"], [role="switch"]')) return;
      position.stop();
      gesture = { id: event.pointerId, y: event.clientY, from: position.value, t: event.timeStamp, v: 0, last: position.value };
      sheet.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerId !== gesture?.id) return;
      const raw = gesture.from + event.clientY - gesture.y;
      // Past full height the sheet only gives a little.
      const y = raw < 0 ? rubberband(raw, height, 0.3) : raw;
      const dt = Math.max(1, event.timeStamp - gesture.t);
      gesture.v = gesture.v * 0.2 + ((y - gesture.last) / dt) * 0.8;
      gesture.t = event.timeStamp;
      gesture.last = y;
      position.set(y, true);
      paint(y);
    };
    const up = (event: PointerEvent) => {
      if (event.pointerId !== gesture?.id) return;
      const { v, last } = gesture;
      gesture = null;
      // Where the throw would carry it, then the nearest resting place.
      const projected = last + v * 180;
      const lowest = stops[stops.length - 1];
      if (projected > lowest + (hidden - lowest) * 0.45 || (v > 0.9 && last >= lowest - 4)) {
        closing = true;
        go(hidden, CLOSE);
        closeRef.current?.();
        return;
      }
      const target = stops.reduce((best, stop) => (Math.abs(stop - projected) < Math.abs(best - projected) ? stop : best), stops[0]);
      go(target, SNAP);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current?.();
    };
    const resize = () => {
      const at = position.target;
      const was = stops.indexOf(at);
      measure();
      if (!closing) go(was >= 0 ? stops[Math.min(was, stops.length - 1)] : rest, SNAP);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(layer);
    sheet.addEventListener('pointerdown', down);
    sheet.addEventListener('pointermove', move);
    sheet.addEventListener('pointerup', up);
    sheet.addEventListener('pointercancel', up);
    window.addEventListener('keydown', key);
    const overflow = document.body.style.overflow;
    if (!container) document.body.style.overflow = 'hidden';
    sheet.focus({ preventScroll: true });
    return () => {
      position.stop();
      api.current = null;
      observer.disconnect();
      sheet.removeEventListener('pointerdown', down);
      sheet.removeEventListener('pointermove', move);
      sheet.removeEventListener('pointerup', up);
      sheet.removeEventListener('pointercancel', up);
      window.removeEventListener('keydown', key);
      if (!container) document.body.style.overflow = overflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, container, stopsKey]);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="lg-sheet-layer" data-liquid-glass="" style={container ? { position: 'absolute' } : undefined}>
      <div ref={scrimRef} className="lg-sheet__scrim" onClick={() => onClose?.()} aria-hidden="true" />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={['lg-glass', 'lg-glass--host', 'lg-sheet', detents?.length ? 'lg-sheet--detents' : ''].filter(Boolean).join(' ')}
        style={tint ? ({ '--lg-host-tint': tint } as React.CSSProperties) : undefined}
      >
        <div className="lg-sheet__grabber-zone" aria-hidden="true">
          <span className="lg-sheet__grabber" />
        </div>
        <div className="lg-sheet__content">{children}</div>
      </div>
    </div>,
    container ?? document.body,
  );
};

GlassSheet.displayName = 'GlassSheet';
