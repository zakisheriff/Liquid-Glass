import React, { useImperativeHandle, useRef, useState } from 'react';
import { usePress } from '../../engine/press';
import { useRefraction } from '../../engine/refraction';
import './GlassInput.css';

export interface GlassInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Refraction strength from 1 (subtle) to 10 (heavy). Default 5. */
  intensity?: number;
  /** Colour for the caret and focus glow. */
  tint?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Small label above the field. */
  label?: string;
  /** Leading icon. `type="search"` gets a magnifier by default. */
  icon?: React.ReactNode;
  /** Trailing accessory, e.g. a microphone glyph. */
  trailing?: React.ReactNode;
  /** Called by the clear button. Without it, clearing emits an empty `onChange`. */
  onClear?: () => void;
}

const Magnifier = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
    <circle cx="8.5" cy="8.5" r="5.75" />
    <path d="m13 13 4 4" />
  </svg>
);

const ClearGlyph = (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="10" cy="10" r="9" fill="currentColor" />
    <path d="m7 7 6 6m0-6-6 6" stroke="var(--lg-clear-x, #fff)" strokeWidth={1.7} strokeLinecap="round" />
  </svg>
);

/** iOS 26 search / text field on regular glass. */
export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  (
    { intensity = 5, tint, label, icon, trailing, onClear, className, style, value, onChange, type = 'text', disabled, onFocus, onBlur, ...rest },
    forwardedRef,
  ) => {
    const fieldRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(forwardedRef, () => inputRef.current!);
    const [focused, setFocused] = useState(false);
    const [inner, setInner] = useState('');
    const current = value ?? inner;

    useRefraction(fieldRef, { kind: 'surface', strength: Math.max(1, Math.min(10, intensity)) / 5 });
    usePress(fieldRef, { grow: 6, lean: 3, stretch: 0.02, disabled });

    const leading = icon ?? (type === 'search' ? Magnifier : null);

    const clear = () => {
      if (onClear) onClear();
      else {
        const input = inputRef.current!;
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        setter?.call(input, '');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      inputRef.current?.focus();
    };

    return (
      <label
        className={['lg-input', className].filter(Boolean).join(' ')}
        data-liquid-glass=""
        style={tint ? ({ '--lg-input-tint': tint, ...style } as React.CSSProperties) : style}
      >
        {label && <span className="lg-input__label">{label}</span>}
        <div ref={fieldRef} className="lg-glass lg-input__field" data-focused={focused ? '' : undefined}>
          {leading && <span className="lg-input__icon">{leading}</span>}
          <input
            ref={inputRef}
            type={type}
            value={current}
            disabled={disabled}
            onChange={(event) => {
              if (value === undefined) setInner(event.target.value);
              onChange?.(event);
            }}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            {...rest}
          />
          {current && !disabled ? (
            <button
              type="button"
              className="lg-input__clear"
              aria-label="Clear"
              onPointerDown={(event) => event.preventDefault()}
              onClick={clear}
            >
              {ClearGlyph}
            </button>
          ) : (
            trailing && <span className="lg-input__icon lg-input__trailing">{trailing}</span>
          )}
        </div>
      </label>
    );
  },
);

GlassInput.displayName = 'GlassInput';
