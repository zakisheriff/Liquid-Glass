import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { SPRINGS, clamp, createSpring, rubberband } from '../../engine/spring';
import { useRefraction } from '../../engine/refraction';
import { haptic } from '../../engine/haptics';
import './GlassSlider.css';

export interface GlassSliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value' | 'min' | 'max'> {
  value?: number;
  min?: number;
  max?: number;
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
      step = 1,
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
    useImperativeHandle(forwardedRef, () => inputRef.current!);

    const strength = Math.max(1, Math.min(10, intensity)) / 5;
    const progress = max > min ? clamp((Number(value) - min) / (max - min), 0, 1) : 0;

    useRefraction(thumbRef, { kind: 'lens', zoom: 1.18, strength }, showThumb, rootRef);
    useRefraction(blockRef, { kind: 'surface', strength }, !showThumb);

    // Thumb lift (thin slider)
    useEffect(() => {
      if (!showThumb) return;
      const input = inputRef.current!;
      const thumb = thumbRef.current!;
      const face = faceRef.current!;
      const root = rootRef.current!;
      const v = { lift: 0, stretch: 0 };
      const paint = () => {
        const s = 0.655 + 0.345 * v.lift;
        thumb.style.scale = `${s * (1 + v.stretch)} ${s * (1 - v.stretch * 0.5)}`;
        face.style.opacity = String(1 - clamp(v.lift, 0, 1) * 0.92);
        root.style.setProperty('--lg-lift', String(clamp(v.lift, 0, 1)));
      };
      const lift = createSpring(0, SPRINGS.lift, (x) => {
        v.lift = x;
        paint();
      });
      const stretch = createSpring(0, SPRINGS.release, (x) => {
        v.stretch = x;
        paint();
      });
      paint();
      let lastX = 0;
      let lastT = 0;
      const down = (event: PointerEvent) => {
        if (input.disabled) return;
        lastX = event.clientX;
        lastT = event.timeStamp;
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
        stretch.set(clamp(speed * 0.03, 0, 0.07));
      };
      const up = () => {
        if (lift.target === 0) return;
        lift.tune(SPRINGS.settle);
        lift.set(0);
        stretch.tune(SPRINGS.release);
        stretch.set(0);
      };
      input.addEventListener('pointerdown', down);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
      input.addEventListener('blur', up);
      return () => {
        lift.stop();
        stretch.stop();
        input.removeEventListener('pointerdown', down);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        input.removeEventListener('blur', up);
      };
    }, [showThumb]);

    // Block stretch (Control Center style): swells on touch, rubber-bands past the ends.
    useEffect(() => {
      if (showThumb) return;
      const input = inputRef.current!;
      const block = blockRef.current!;
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
      let active: { id: number; box: DOMRect } | null = null;
      const down = (event: PointerEvent) => {
        if (input.disabled) return;
        active = { id: event.pointerId, box: block.getBoundingClientRect() };
        swell.tune(SPRINGS.press);
        swell.set(1);
        haptic();
      };
      const move = (event: PointerEvent) => {
        if (event.pointerId !== active?.id) return;
        const { box } = active;
        const past = event.clientX < box.left ? event.clientX - box.left : event.clientX > box.right ? event.clientX - box.right : 0;
        over.tune(SPRINGS.drag);
        // A short, firm overscroll: the block only gives a few px past its end.
        over.set(rubberband(past, 26, 0.6));
      };
      const up = (event: PointerEvent) => {
        if (event.pointerId !== active?.id) return;
        active = null;
        swell.tune(SPRINGS.release);
        swell.set(0);
        over.tune(SPRINGS.release);
        over.set(0);
      };
      input.addEventListener('pointerdown', down);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
      return () => {
        swell.stop();
        over.stop();
        input.removeEventListener('pointerdown', down);
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
              <span className="lg-slider__value">{Number(value)}</span>
            </span>
            {/* The lit part, with its own dark glyphs so they read on white. */}
            <span className="lg-slider__block-fill" aria-hidden="true">
              <span className="lg-slider__block-content lg-slider__block-content--lit">
                {icon && <span className="lg-slider__icon">{icon}</span>}
                {label && <span className="lg-slider__label">{label}</span>}
                <span className="lg-slider__value">{Number(value)}</span>
              </span>
            </span>
          </div>
          {input}
        </div>
      );
    }

    return (
      <div ref={rootRef} className={['lg-slider', className].filter(Boolean).join(' ')} data-liquid-glass="" style={vars}>
        <span className="lg-slider__rail" aria-hidden="true">
          <span className="lg-slider__fill" />
        </span>
        <span className="lg-slider__thumb-slot" aria-hidden="true">
          <span ref={thumbRef} className="lg-glass lg-slider__thumb">
            <span ref={faceRef} className="lg-slider__face" />
          </span>
        </span>
        {input}
      </div>
    );
  },
);

GlassSlider.displayName = 'GlassSlider';
