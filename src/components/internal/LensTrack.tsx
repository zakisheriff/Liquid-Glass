import React, { useRef } from 'react';
import { useLensTrack } from '../../engine/lensTrack';
import { canRefractBackdrop, useRefraction } from '../../engine/refraction';
import './LensTrack.css';

export interface LensTrackProps {
  items: React.ReactNode[];
  labels: string[];
  index: number;
  onChange?: (index: number) => void;
  variant: 'tabbar' | 'segmented';
  intensity?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

export function LensTrack({
  items,
  labels,
  index,
  onChange,
  variant,
  intensity = 5,
  className,
  style,
  'aria-label': ariaLabel,
}: LensTrackProps) {
  const bar = useRef<HTMLDivElement>(null);
  const glass = useRef<HTMLSpanElement>(null);
  const lens = useRef<HTMLSpanElement>(null);
  const select = useRef<HTMLSpanElement>(null);
  const strength = Math.max(1, Math.min(10, intensity)) / 5;
  const tabbar = variant === 'tabbar';
  const zoom = tabbar ? 1.14 : 1.1;

  useRefraction(glass, { kind: 'surface', strength });
  // iOS: a magnified centre and a thick rounded rim that bends whatever sits
  // under its edge (icons, labels, the bar's own border) with a faint
  // rainbow fringe.
  useRefraction(lens, { kind: 'lens', strength: 0.85, zoom, dispersion: 0.35 });

  useLensTrack(
    { bar, glass, lens, select },
    {
      count: items.length,
      index,
      onSelect: (next) => onChange?.(next),
      overhang: tabbar ? 14 : 12,
      spread: tabbar ? 0.3 : 0.16,
      contentZoom: canRefractBackdrop() ? zoom : 1,
      swell: tabbar ? 8 : 14,
    },
  );

  return (
    <div
      ref={bar}
      role="tablist"
      aria-label={ariaLabel}
      className={['lg-track', `lg-track--${variant}`, className].filter(Boolean).join(' ')}
      data-liquid-glass=""
      style={{ ...style, '--lg-count': items.length, '--lg-index': index } as React.CSSProperties}
    >
      <span ref={glass} className="lg-glass lg-track__glass" aria-hidden="true" />
      <span ref={select} className="lg-track__select" aria-hidden="true" />
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          data-lg-item={i}
          aria-selected={i === index}
          aria-label={labels[i]}
          tabIndex={i === index ? 0 : -1}
          className="lg-track__item"
        >
          {item}
        </button>
      ))}
      <span ref={lens} className="lg-glass lg-track__lens" aria-hidden="true" />
    </div>
  );
}
