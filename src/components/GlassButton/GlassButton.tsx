import React, { useImperativeHandle, useRef } from 'react';
import { usePress } from '../../engine/press';
import { useRefraction } from '../../engine/refraction';
import { haptic } from '../../engine/haptics';
import './GlassButton.css';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Refraction strength from 1 (subtle) to 10 (heavy). Default 5. */
  intensity?: number;
  /** Any CSS colour. Colours the label (`tinted`) or the fill (`filled`). Default accent blue. */
  tint?: string;
  /** Light bloom under the finger while pressed. Default true. */
  shimmer?: boolean;
  /** Rim bevel scale (1–4). Wider bevels bend more of the backdrop. Default 1. */
  thickness?: number;
  /** Height preset: 36 / 44 / 52 px. Default 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /**
   * `glass` (alias `default`) regular glass · `clear` (alias `ghost`) see-through
   * glass · `tinted` glass with a coloured label · `tinted-filled` a soft wash
   * of the colour with a label in that colour · `filled` solid colour.
   * Combine with `tint` for any colour, or `destructive` for red.
   */
  variant?: 'glass' | 'default' | 'clear' | 'ghost' | 'tinted' | 'tinted-filled' | 'filled' | 'destructive';
  /** Marks a delete / irreversible action: red label, or red fill with `filled`. */
  destructive?: boolean;
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
      variant = 'glass',
      destructive = false,
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
    // `destructive` as a variant predates the flag; both mean a red tint.
    const red = destructive || variant === 'destructive';
    const kind = variant === 'ghost' ? 'clear' : variant === 'default' || variant === 'destructive' ? 'glass' : variant;

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
        data-destructive={red ? '' : undefined}
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
