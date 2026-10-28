import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { SPRINGS, clamp, createSpring, rubberband, springFrom } from '../../engine/spring';

/** The knob drops back with a short, gentle settle rather than a jelly bounce. */
const SETTLE = springFrom(0.36, 0.68);
import { useRefraction } from '../../engine/refraction';
import { haptic } from '../../engine/haptics';
import './GlassSwitch.css';

export interface GlassSwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value' | 'defaultValue'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** On-state colour. Defaults to system green. */
  tint?: string;
  /** Refraction strength from 1 (subtle) to 10 (heavy). Default 5. */
  intensity?: number;
}

/** Thumb lens box at full lift; at rest it is scaled down to a 38×24 pill. */
const REST = 0.655;
const TRAVEL = 22;

/**
 * iOS 26 switch. Touch the knob and it inflates into a clear lens that hangs
 * over the track, refracting it; drag it across or tap, and it drops back
 * into a white pill with a jelly wobble.
 */
export const GlassSwitch = React.forwardRef<HTMLButtonElement, GlassSwitchProps>(
  (
    { checked: checkedProp, defaultChecked = false, onChange, tint, intensity = 5, className, style, disabled, ...rest },
    forwardedRef,
  ) => {
    const ref = useRef<HTMLButtonElement>(null);
    const thumbRef = useRef<HTMLSpanElement>(null);
    const fillRef = useRef<HTMLSpanElement>(null);
    const faceRef = useRef<HTMLSpanElement>(null);
    useImperativeHandle(forwardedRef, () => ref.current!);

    const [inner, setInner] = useState(defaultChecked);
    const controlled = checkedProp !== undefined;
    const checked = controlled ? checkedProp : inner;

    const latest = useRef({ checked, set: (_: boolean) => {}, disabled });
    latest.current = {
      checked,
      disabled,
      set: (next: boolean) => {
        if (!controlled) setInner(next);
        onChange?.(next);
      },
    };
    const sync = useRef<((value: boolean) => void) | null>(null);

    // 1×: the track shows at its real height with clear glass above and below,
    // as on iOS. Zooming either way smears the backdrop edge across the lens.
    useRefraction(thumbRef, { kind: 'lens', zoom: 1, dispersion: 0.5, strength: Math.max(1, Math.min(10, intensity)) / 5 }, true, ref, () =>
      parseFloat(ref.current?.style.getPropertyValue('--lg-lift') || '0') > 0.01,
    );

    useEffect(() => {
      const el = ref.current!;
      const thumb = thumbRef.current!;
      const fill = fillRef.current!;
      const face = faceRef.current!;
      const v = { x: checked ? 1 : 0, lift: 0, stretch: 0 };

      const paint = () => {
        const s = REST + (1 - REST) * v.lift;
        const sx = s * (1 + v.stretch);
        const sy = s * (1 - v.stretch * 0.5);
        thumb.style.transform = `translate(${v.x * TRAVEL}px, -50%) scale(${sx}, ${sy})`;
        const l = clamp(v.lift, 0, 1);
        face.style.opacity = String(1 - l * 0.92);
        el.style.setProperty('--lg-lift', String(l));
      };
      const position = createSpring(v.x, SPRINGS.snap, (value, velocity) => {
        v.x = value;
        v.stretch = clamp(Math.abs(velocity) / 140, 0, 0.05);
        paint();
      });
      const lift = createSpring(0, SPRINGS.lift, (value) => {
        v.lift = value;
        paint();
      });
      const color = createSpring(checked ? 1 : 0, SPRINGS.fade, (value) => {
        fill.style.opacity = String(clamp(value, 0, 1));
      });
      fill.style.opacity = checked ? '1' : '0';
      paint();

      sync.current = (value) => {
        position.tune(SPRINGS.snap);
        position.set(value ? 1 : 0);
        color.set(value ? 1 : 0);
      };

      let gesture: { id: number; x: number; from: number; moved: boolean; at: number } | null = null;
      let dropTimer = 0;
      let ignoreClick = false;

      const drop = (delay: number) => {
        clearTimeout(dropTimer);
        dropTimer = window.setTimeout(() => {
          lift.tune(SETTLE);
          lift.set(0);
        }, delay);
      };

      const down = (event: PointerEvent) => {
        el.removeAttribute('data-keyboard');
        if (!event.isPrimary || event.button !== 0 || latest.current.disabled) return;
        clearTimeout(dropTimer);
        gesture = { id: event.pointerId, x: event.clientX, from: latest.current.checked ? 1 : 0, moved: false, at: performance.now() };
        try {
          el.setPointerCapture(event.pointerId);
        } catch {
          /* noop */
        }
        lift.tune(SPRINGS.lift);
        lift.set(1);
        haptic();
      };
      const move = (event: PointerEvent) => {
        if (event.pointerId !== gesture?.id) return;
        const dx = event.clientX - gesture.x;
        if (!gesture.moved && Math.abs(dx) < 3) return;
        gesture.moved = true;
        const raw = gesture.from + dx / TRAVEL;
        const over = raw < 0 ? rubberband(raw * TRAVEL, TRAVEL, 0.6) / TRAVEL : raw > 1 ? 1 + rubberband((raw - 1) * TRAVEL, TRAVEL, 0.6) / TRAVEL : raw;
        position.tune(SPRINGS.drag);
        position.set(over);
        const on = raw > 0.5;
        if ((color.target === 1) !== on) haptic();
        color.set(on ? 1 : 0);
      };
      const up = (event: PointerEvent) => {
        if (event.pointerId !== gesture?.id) return;
        const { from, x, moved, at } = gesture;
        gesture = null;
        ignoreClick = true;
        const next = moved ? from + (event.clientX - x) / TRAVEL > 0.5 : !latest.current.checked;
        position.tune(SPRINGS.snap);
        position.set(next ? 1 : 0);
        color.set(next ? 1 : 0);
        if (next !== latest.current.checked) latest.current.set(next);
        // A quick tap keeps the lens up long enough to be seen crossing.
        drop(moved ? 0 : Math.max(0, 200 - (performance.now() - at)));
      };
      const cancel = (event: PointerEvent) => {
        if (event.pointerId !== gesture?.id) return;
        gesture = null;
        sync.current?.(latest.current.checked);
        drop(0);
      };
      const click = (event: MouseEvent) => {
        if (ignoreClick) {
          ignoreClick = false;
          return;
        }
        if (latest.current.disabled) return;
        // Keyboard / assistive activation
        event.preventDefault();
        const next = !latest.current.checked;
        lift.set(1);
        drop(220);
        latest.current.set(next);
        sync.current?.(next);
      };

      el.addEventListener('pointerdown', down);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', cancel);
      el.addEventListener('click', click);
      return () => {
        clearTimeout(dropTimer);
        [position, lift, color].forEach((s) => s.stop());
        el.removeEventListener('pointerdown', down);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', cancel);
        el.removeEventListener('click', click);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      sync.current?.(checked);
    }, [checked]);

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={['lg-switch', className].filter(Boolean).join(' ')}
        data-liquid-glass=""
        style={tint ? ({ '--lg-switch-on': tint, ...style } as React.CSSProperties) : style}
        {...rest}
        onKeyDown={(event) => {
          event.currentTarget.setAttribute('data-keyboard', '');
          rest.onKeyDown?.(event);
        }}
      >
        <span ref={fillRef} className="lg-switch__fill" aria-hidden="true" />
        <span ref={thumbRef} className="lg-glass lg-switch__thumb" aria-hidden="true">
          <span ref={faceRef} className="lg-switch__face" />
        </span>
      </button>
    );
  },
);

GlassSwitch.displayName = 'GlassSwitch';
