import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { SPRINGS, clamp, createSpring, rubberband } from '../../engine/spring';
import { canRefractBackdrop, useRefraction } from '../../engine/refraction';
import { haptic } from '../../engine/haptics';
import { guardSelection } from '../../engine/selection';
import './GlassSlider.css';

export interface GlassSliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value' | 'min' | 'max'> {
  value?: number;
  min?: number;
  max?: number;
  /** Continuous dragging by default (`"any"`). Set a numeric step to snap. */
  step?: React.InputHTMLAttributes<HTMLInputElement>['step'];
  /** Refraction strength from 1 (subtle) to 10 (heavy). Default 5. */
  intensity?: number;
  /** Fill colour. Defaults to the accent blue (white in block mode). */
  tint?: string;
  /** Kept for API compatibility. */
  shimmer?: boolean;
  /** Kept for API compatibility. */
  thickness?: number;
  /**
   * `true` (default): thin iOS track with a glass thumb that lifts into a lens.
   * `false`: Control Center block that fills and stretches under the finger.
   */
  showThumb?: boolean;
  /** Icon shown inside the block slider. */
  icon?: React.ReactNode;
  /** Label shown inside the block slider. */
  label?: string;
  onChange?: (value: number) => void;
}

export const GlassSlider = React.forwardRef<HTMLInputElement, GlassSliderProps>(
  (
    {
      value = 0,
      min = 0,
      max = 100,
      step = 'any',
      intensity = 5,
      tint,
      shimmer: _shimmer,
      thickness: _thickness,
      showThumb = true,
      icon,
      label,
      onChange,
      className,
      style,
      disabled,
      ...rest
    },
    forwardedRef,
  ) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const thumbRef = useRef<HTMLSpanElement>(null);
    const faceRef = useRef<HTMLSpanElement>(null);
    const blockRef = useRef<HTMLDivElement>(null);
    /** How far (px) the finger has dragged past either end; drives overscroll. */
    const pastRef = useRef(0);
    useImperativeHandle(forwardedRef, () => inputRef.current!);

    // Sliding is relative, like iOS: touching the track never jumps the value,
    // only moving the finger changes it. A numeric step remains an explicit
    // opt-in, and the native range still owns keyboard/accessibility.
    useEffect(() => {
      const input = inputRef.current!;
      const root = rootRef.current!;
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      let drag: { id: number; x: number; from: number; travel: number } | null = null;
      const update = (clientX: number) => {
        if (!drag || max <= min) return;
        const raw = drag.from + (clientX - drag.x) / drag.travel;
        const fraction = clamp(raw, 0, 1);
        pastRef.current = (raw - fraction) * drag.travel;
        let next = min + fraction * (max - min);
        const increment = Number(step);
        if (step !== 'any' && Number.isFinite(increment) && increment > 0) {
          next = clamp(min + Math.round((next - min) / increment) * increment, min, max);
          next = Number(next.toFixed(10));
        }
        root.style.setProperty('--lg-progress', String((next - min) / (max - min)));
        if (next === input.valueAsNumber) return;
        // Use the native setter so React receives a real input update exactly
        // once; consumers' onInput handlers keep working too.
        setValue.call(input, String(next));
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const down = (event: PointerEvent) => {
        if (input.disabled || !event.isPrimary || event.button !== 0 || drag) return;
        event.preventDefault();
        delete root.dataset.keyboard;
        // Focusing the hidden native range during a touch can immediately
        // blur it on iOS. Pointer capture, not input focus, owns the gesture.
        if (event.pointerType !== 'touch') input.focus({ preventScroll: true });
        const box = root.getBoundingClientRect();
        const inset = showThumb ? 19 * box.width / root.offsetWidth : 0;
        const from = max > min ? clamp((input.valueAsNumber - min) / (max - min), 0, 1) : 0;
        drag = { id: event.pointerId, x: event.clientX, from, travel: Math.max(1, box.width - inset * 2) };
        pastRef.current = 0;
        root.dataset.dragging = '';
        root.setPointerCapture(event.pointerId);
      };
      const move = (event: PointerEvent) => {
        if (event.pointerId !== drag?.id) return;
        event.preventDefault();
        update(event.clientX);
      };
      const release = () => {
        if (!drag) return;
        const id = drag.id;
        drag = null;
        pastRef.current = 0;
        delete root.dataset.dragging;
        if (root.hasPointerCapture(id)) root.releasePointerCapture(id);
      };
      const up = (event: PointerEvent) => {
        if (event.pointerId !== drag?.id) return;
        update(event.clientX);
        release();
      };
      // Hit-test the custom surface, not WebKit's native range control.
      // On iOS the native thumb can cancel pointer events as it takes over
      // the drag, dropping the glass lift while values continue changing.
      const unguard = guardSelection(root);
      root.addEventListener('pointerdown', down);
      root.addEventListener('pointermove', move);
      root.addEventListener('pointerup', up);
      root.addEventListener('pointercancel', release);
      root.addEventListener('lostpointercapture', release);
      window.addEventListener('blur', release);
      return () => {
        release();
        unguard();
        root.removeEventListener('pointerdown', down);
        root.removeEventListener('pointermove', move);
        root.removeEventListener('pointerup', up);
        root.removeEventListener('pointercancel', release);
        root.removeEventListener('lostpointercapture', release);
        window.removeEventListener('blur', release);
      };
    }, [min, max, step, showThumb]);

    const strength = Math.max(1, Math.min(10, intensity)) / 5;
    // Safari/Firefox draw the magnified rail as a copy inside the thumb.
    const [mirrored, setMirrored] = React.useState(false);
    useEffect(() => setMirrored(!canRefractBackdrop()), []);
    const progress = max > min ? clamp((Number(value) - min) / (max - min), 0, 1) : 0;

    // iOS magnifies the rail ~2× inside the lifted thumb.
    // Only the band around the rail bends; above and below it the lens stays
    // clear, so its rim doesn't drag a sliver of the fill to the top edge.
    useRefraction(thumbRef, { kind: 'lens', zoom: 1.95, bezel: 7, thickness: 16, strength, dispersion: 0.6, inset: 11 }, showThumb, rootRef, () =>
      parseFloat(rootRef.current?.style.getPropertyValue('--lg-lift') || '0') > 0.01,
    );
    useRefraction(blockRef, { kind: 'surface', strength }, !showThumb);

    // Thumb lift (thin slider)
    useEffect(() => {
      if (!showThumb) return;
      const input = inputRef.current!;
      const thumb = thumbRef.current!;
      const face = faceRef.current!;
      const root = rootRef.current!;
      const v = { lift: 0, stretch: 0, over: 0 };
      const paint = () => {
        const s = 0.655 + 0.345 * v.lift;
        // Pulled past an end, the lens slides a little further and stretches
        // toward the finger, then springs back on release.
        const pull = (Math.abs(v.over) / 58) * 0.6;
        thumb.style.scale = `${s * (1 + v.stretch + pull)} ${s * (1 - v.stretch * 0.5 - pull * 0.4)}`;
        face.style.opacity = String(1 - clamp(v.lift, 0, 1) * 0.92);
        root.style.setProperty('--lg-lift', String(clamp(v.lift, 0, 1)));
        root.style.setProperty('--lg-over', `${v.over.toFixed(2)}px`);
        if (v.lift < 0.01 && lift.target === 0) delete root.dataset.lifted;
      };
      const lift = createSpring(0, SPRINGS.lift, (x) => {
        v.lift = x;
        paint();
      });
      const stretch = createSpring(0, SPRINGS.release, (x) => {
        v.stretch = x;
        paint();
      });
      const over = createSpring(0, SPRINGS.release, (x) => {
        v.over = x;
        paint();
      });
      paint();
      let lastX = 0;
      let lastT = 0;
      const down = (event: PointerEvent) => {
        if (input.disabled || !event.isPrimary || event.button !== 0) return;
        lastX = event.clientX;
        lastT = event.timeStamp;
        root.dataset.lifted = '';
        lift.tune(SPRINGS.lift);
        lift.set(1);
        haptic();
      };
      const move = (event: PointerEvent) => {
        if (lift.target !== 1) return;
        const dt = Math.max(1, event.timeStamp - lastT);
        const speed = Math.abs(event.clientX - lastX) / dt;
        lastX = event.clientX;
        lastT = event.timeStamp;
        stretch.tune(SPRINGS.drag);
        stretch.set(clamp(speed * 0.015, 0, 0.035));
        over.tune(SPRINGS.drag);
        over.set(rubberband(pastRef.current, 12, 0.5));
      };
      const up = () => {
        if (lift.target === 0) return;
        lift.tune(SPRINGS.settle);
        lift.set(0);
        stretch.tune(SPRINGS.release);
        stretch.set(0);
        over.tune(SPRINGS.release);
        over.set(0);
      };
      root.addEventListener('pointerdown', down);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
      root.addEventListener('lostpointercapture', up);
      window.addEventListener('blur', up);
      return () => {
        lift.stop();
        stretch.stop();
        over.stop();
        root.removeEventListener('pointerdown', down);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        root.removeEventListener('lostpointercapture', up);
        window.removeEventListener('blur', up);
        delete root.dataset.lifted;
      };
    }, [showThumb]);

    // Block stretch (Control Center style): swells on touch, rubber-bands past the ends.
    useEffect(() => {
      if (showThumb) return;
      const input = inputRef.current!;
      const block = blockRef.current!;
      const root = rootRef.current!;
      const v = { swell: 0, over: 0 };
      const paint = () => {
        const w = block.offsetWidth || 1;
        const grow = 1 + (10 / Math.max(w, 1)) * v.swell;
        const stretchX = 1 + Math.abs(v.over) / w;
        block.style.scale = `${grow * stretchX} ${grow * (1 - Math.abs(v.over) / w / 2)}`;
        block.style.translate = `${v.over / 2}px 0`;
      };
      const swell = createSpring(0, SPRINGS.press, (x) => {
        v.swell = x;
        paint();
      });
      const over = createSpring(0, SPRINGS.release, (x) => {
        v.over = x;
        paint();
      });
      let active: { id: number } | null = null;
      const down = (event: PointerEvent) => {
        if (input.disabled || !event.isPrimary || event.button !== 0) return;
        active = { id: event.pointerId };
        swell.tune(SPRINGS.press);
        swell.set(1);
        haptic();
      };
      const move = (event: PointerEvent) => {
        if (event.pointerId !== active?.id) return;
        over.tune(SPRINGS.drag);
        // A short, firm overscroll: the block only gives a few px past its end.
        over.set(rubberband(pastRef.current, 26, 0.6));
      };
      const reset = () => {
        if (!active) return;
        active = null;
        swell.tune(SPRINGS.release);
        swell.set(0);
        over.tune(SPRINGS.release);
        over.set(0);
      };
      const up = (event: PointerEvent) => {
        if (event.pointerId === active?.id) reset();
      };
      root.addEventListener('pointerdown', down);
      root.addEventListener('lostpointercapture', reset);
      window.addEventListener('blur', reset);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
      return () => {
        swell.stop();
        over.stop();
        root.removeEventListener('pointerdown', down);
        root.removeEventListener('lostpointercapture', reset);
        window.removeEventListener('blur', reset);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
      };
    }, [showThumb]);

    const input = (
      <input
        ref={inputRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={rest['aria-label'] ?? label}
        onChange={(event) => onChange?.(Number(event.currentTarget.value))}
        onKeyDown={() => rootRef.current?.setAttribute('data-keyboard', '')}
        onPointerDown={() => rootRef.current?.removeAttribute('data-keyboard')}
        className="lg-slider__input"
        {...rest}
      />
    );

    const vars = { '--lg-progress': progress, ...(tint ? { '--lg-slider-fill': tint } : {}), ...style } as React.CSSProperties;

    if (!showThumb) {
      return (
        <div
          ref={rootRef}
          className={['lg-slider', 'lg-slider--block', className].filter(Boolean).join(' ')}
          data-liquid-glass=""
          style={vars}
        >
          <div ref={blockRef} className="lg-glass lg-slider__block">
            <span className="lg-slider__block-content" aria-hidden="true">
              {icon && <span className="lg-slider__icon">{icon}</span>}
              {label && <span className="lg-slider__label">{label}</span>}
              <span className="lg-slider__value">{Math.round(Number(value))}</span>
            </span>
            {/* The lit part, with its own dark glyphs so they read on white. */}
            <span className="lg-slider__block-fill" aria-hidden="true">
              <span className="lg-slider__block-content lg-slider__block-content--lit">
                {icon && <span className="lg-slider__icon">{icon}</span>}
                {label && <span className="lg-slider__label">{label}</span>}
                <span className="lg-slider__value">{Math.round(Number(value))}</span>
              </span>
            </span>
          </div>
          {input}
        </div>
      );
    }

    return (
      <div
        ref={rootRef}
        className={['lg-slider', className].filter(Boolean).join(' ')}
        data-liquid-glass=""
        data-mirror={mirrored ? '' : undefined}
        style={vars}
      >
        <span className="lg-slider__rail" aria-hidden="true">
          <span className="lg-slider__fill" />
        </span>
        <span className="lg-slider__thumb-slot" aria-hidden="true">
          <span ref={thumbRef} className="lg-glass lg-slider__thumb" data-lg-mirror-bare="">
            <span ref={faceRef} className="lg-slider__face" />
          </span>
        </span>
        {input}
      </div>
    );
  },
);

GlassSlider.displayName = 'GlassSlider';
