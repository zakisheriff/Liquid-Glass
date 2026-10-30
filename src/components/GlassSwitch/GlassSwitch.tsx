import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { SPRINGS, clamp, createJelly, createSpring, rubberband, springFrom } from '../../engine/spring';

/** The knob drops back with a short, gentle settle rather than a jelly bounce. */
const SETTLE = springFrom(0.36, 0.68);
import { useRefraction } from '../../engine/refraction';
import { haptic } from '../../engine/haptics';
import { guardSelection } from '../../engine/selection';
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

    // iOS: the lifted knob is a lens that thins the track beneath it. The
    // track runs on through the lens, thinner inside and flaring back to full
    // height at the rim where it meets the track outside. It's drawn from a
    // live copy of the switch so it can show past its own edge.
    useRefraction(thumbRef, { kind: 'lens', zoom: 0.72, zoomX: 1, dispersion: 1, stretch: 1, copy: 'refract', strength: Math.max(1, Math.min(10, intensity)) / 5 }, true, ref, () =>
      parseFloat(ref.current?.style.getPropertyValue('--lg-lift') || '0') > 0.01,
    );

    useEffect(() => {
      const el = ref.current!;
      const thumb = thumbRef.current!;
      const fill = fillRef.current!;
      // `glass` is how far the knob reads as a lens. It follows the lift up,
      // but on the way down it only falls: the lift spring bounces past rest
      // to wobble the knob's size, and letting the lens look ride that bounce
      // flashed it back on before it snapped off.
      const v = { x: checked ? 1 : 0, lift: 0, glass: 0, stretch: 0 };

      const paint = () => {
        const s = REST + (1 - REST) * v.lift;
        const sx = s * (1 + v.stretch);
        const sy = s * (1 - v.stretch * 0.5);
        thumb.style.transform = `translate(${v.x * TRAVEL}px, -50%) scale(${sx}, ${sy})`;
        const l = clamp(v.glass, 0, 1);
        // Open a gap in the real track under the lifted lens; the lens shows
        // the track shrunk inside it, so drawing it here too would double it.
        el.style.setProperty('--lg-knob-x', `${(21 + v.x * TRAVEL).toFixed(2)}px`);
        el.style.setProperty('--lg-hole', `${(l > 0.01 ? 23 * sx : 0).toFixed(2)}px`);
        el.style.setProperty('--lg-lift', String(l));
        el.toggleAttribute('data-lifted', l > 0.01);
      };
      // The knob stretches with its speed and jiggles round when it stops.
      const jelly = createJelly((value) => {
        v.stretch = value;
        paint();
      }, 0.14, 5);
      const position = createSpring(v.x, SPRINGS.snap, (value, velocity) => {
        v.x = value;
        jelly.feed(velocity);
        paint();
      });
      const lift = createSpring(0, SPRINGS.lift, (value) => {
        v.lift = value;
        v.glass = lift.target ? value : Math.min(v.glass, value);
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

      // The knob has to travel most of the way before the switch flips, so a
      // drag that wanders past the middle doesn't toggle it by accident.
      const flips = (from: number, raw: number) => (from ? raw > 0.3 : raw > 0.7);

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
        const on = flips(gesture.from, raw);
        if ((color.target === 1) !== on) haptic();
        color.set(on ? 1 : 0);
      };
      const up = (event: PointerEvent) => {
        if (event.pointerId !== gesture?.id) return;
        const { from, x, moved, at } = gesture;
        gesture = null;
        ignoreClick = true;
        const next = moved ? flips(from, from + (event.clientX - x) / TRAVEL) : !latest.current.checked;
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

      const unguard = guardSelection(el);
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', cancel);
      el.addEventListener('click', click);
      return () => {
        clearTimeout(dropTimer);
        [position, lift, color, jelly].forEach((s) => s.stop());
        unguard();
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
        <span className="lg-switch__track" aria-hidden="true" />
        <span ref={fillRef} className="lg-switch__fill" aria-hidden="true" />
        <span ref={thumbRef} className="lg-glass lg-switch__thumb" aria-hidden="true">
          <span ref={faceRef} className="lg-switch__face" />
        </span>
      </button>
    );
  },
);

GlassSwitch.displayName = 'GlassSwitch';
