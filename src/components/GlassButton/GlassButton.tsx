import React, { useImperativeHandle, useRef } from 'react';
import { usePress } from '../../engine/press';
import { useRefraction } from '../../engine/refraction';
import { haptic } from '../../engine/haptics';
import './GlassButton.css';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Refraction strength from 1 (subtle) to 10 (heavy). Default 5. */
  intensity?: number;
  /** Any CSS colour. Tints the label, or the fill for `filled`. */
  tint?: string;
  /** Light bloom under the finger while pressed. Default true. */
  shimmer?: boolean;
  /** Rim bevel scale (1–4). Wider bevels bend more of the backdrop. Default 1. */
  thickness?: number;
  /** Height preset: 36 / 44 / 52 px. Default 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /**
   * `default` regular glass · `clear` (alias `ghost`) see-through glass ·
   * `filled` accent-coloured · `destructive` red label.
   */
  variant?: 'default' | 'ghost' | 'clear' | 'filled' | 'destructive';
  /** Leading icon. With no children the button becomes a circle. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      intensity = 5,
      tint,
      shimmer = true,
      thickness = 1,
      size = 'md',
      variant = 'default',
      icon,
      className,
      style,
      children,
      type = 'button',
      onPointerDown,
      ...rest
    },
    forwardedRef,
  ) => {
    const ref = useRef<HTMLButtonElement>(null);
    useImperativeHandle(forwardedRef, () => ref.current!);

    const level = Math.max(1, Math.min(10, intensity));
    const height = size === 'sm' ? 36 : size === 'lg' ? 52 : 44;
    usePress(ref, { disabled: rest.disabled });
    useRefraction(ref, {
      kind: 'surface',
      strength: level / 5,
      bezel: Math.min(height * 0.36, 22) * Math.max(0.5, thickness),
    });

    const iconOnly = icon != null && (children == null || children === false);
    const kind = variant === 'ghost' ? 'clear' : variant;

    const classes = ['lg-glass', 'lg-button', `lg-button--${size}`, `lg-button--${kind}`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        data-liquid-glass=""
        data-icon-only={iconOnly ? '' : undefined}
        data-shimmer={shimmer ? '' : undefined}
        style={tint ? ({ '--lg-tint': tint, ...style } as React.CSSProperties) : style}
        onPointerDown={(event) => {
          if (!rest.disabled) haptic();
          onPointerDown?.(event);
        }}
        {...rest}
      >
        {icon != null && <span className="lg-button__icon">{icon}</span>}
        {!iconOnly && children != null && <span className="lg-button__label">{children}</span>}
      </button>
    );
  },
);

GlassButton.displayName = 'GlassButton';
