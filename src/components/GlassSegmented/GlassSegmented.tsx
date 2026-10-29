import React from 'react';
import { LensTrack } from '../internal/LensTrack';

export interface GlassSegmentedOption {
  label: string;
  icon?: React.ReactNode;
}

export interface GlassSegmentedProps {
  /** Segment labels, or `{ label, icon }` objects. */
  options: Array<string | GlassSegmentedOption>;
  /** Zero-based index of the selected segment. */
  value: number;
  onChange?: (index: number) => void;
  /** 36px (default) or compact 28px. */
  size?: 'sm' | 'md';
  /** Refraction strength from 1 (subtle) to 10 (heavy). Default 5. */
  intensity?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

/**
 * iOS 26 segmented control. The whole control swells under the finger and the
 * selection lifts into a clear lens that can be dragged between segments.
 */
export const GlassSegmented: React.FC<GlassSegmentedProps> = ({
  options,
  value,
  onChange,
  size = 'md',
  intensity = 5,
  className,
  style,
  'aria-label': ariaLabel,
}) => {
  const normalized = options.map((option) => (typeof option === 'string' ? { label: option } : option));
  return (
    <LensTrack
      variant="segmented"
      className={[size === 'sm' ? 'lg-track--sm' : '', className].filter(Boolean).join(' ')}
      style={style}
      aria-label={ariaLabel}
      intensity={intensity}
      index={value}
      onChange={onChange}
      labels={normalized.map((option) => option.label)}
      items={normalized.map((option, i) => (
        <React.Fragment key={i}>
          {/* Wrapped like tab bar icons, so the real icon hides under the lens
              (only its magnified copy shows) and takes the lens tint. */}
          {option.icon != null && <span className="lg-nav__icon">{option.icon}</span>}
          <span className="lg-nav__label">{option.label}</span>
        </React.Fragment>
      ))}
    />
  );
};

GlassSegmented.displayName = 'GlassSegmented';
