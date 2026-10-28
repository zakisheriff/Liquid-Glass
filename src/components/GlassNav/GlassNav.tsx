import React from 'react';
import { LensTrack } from '../internal/LensTrack';

export interface GlassNavItem {
  label: string;
  icon?: React.ReactNode;
}

export interface GlassNavProps {
  /** Tabs to render. Icons sit above labels, like the iOS 26 tab bar. */
  items: GlassNavItem[];
  /** Zero-based index of the selected tab. Default 0. */
  activeIndex?: number;
  /** Called when a tab is tapped, or when the lens is dragged onto one. */
  onChange?: (index: number) => void;
  /** Refraction strength from 1 (subtle) to 10 (heavy). Default 5. */
  intensity?: number;
  /** Show the label under each icon. With `false` the bar is icons only and
   *  the labels become the tabs' accessible names. Default true. */
  showLabels?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

/**
 * The iOS 26 floating tab bar. Press a tab and the selection inflates into a
 * liquid lens you can drag across the bar; let go and it drops into place.
 */
export const GlassNav: React.FC<GlassNavProps> = ({
  items,
  activeIndex = 0,
  onChange,
  intensity = 5,
  showLabels = true,
  className,
  style,
  'aria-label': ariaLabel = 'Tabs',
}) => {
  const hasIcons = items.some((item) => item.icon != null);
  const iconsOnly = hasIcons && !showLabels;
  return (
    <LensTrack
      variant="tabbar"
      className={['lg-nav', hasIcons ? '' : 'lg-track--labels-only', iconsOnly ? 'lg-track--icons-only' : '', className].filter(Boolean).join(' ')}
      style={style}
      aria-label={ariaLabel}
      intensity={intensity}
      index={activeIndex}
      onChange={onChange}
      labels={items.map((item) => item.label)}
      items={items.map((item, i) => (
        <React.Fragment key={i}>
          {item.icon != null && <span className="lg-nav__icon">{item.icon}</span>}
          {!iconsOnly && <span className="lg-nav__label">{item.label}</span>}
        </React.Fragment>
      ))}
    />
  );
};

GlassNav.displayName = 'GlassNav';
