import React, { useRef } from 'react';
import { useLensTrack } from '../../engine/lensTrack';
import { useRefraction } from '../../engine/refraction';
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

  useRefraction(glass, { kind: 'surface', strength });
  // No Safari mirror here: bars float over arbitrary content (photos,
  // feeds) that a copy can't rebuild, so the lens there is clear frosted
  // glass over the real backdrop instead of a grey stand-in.
  useRefraction(lens, { kind: 'lens', strength, zoom: variant === 'tabbar' ? 1.14 : 1.1 });

  const tabbar = variant === 'tabbar';
  useLensTrack(
    { bar, glass, lens, select },
    {
      count: items.length,
      index,
      onSelect: (next) => onChange?.(next),
      overhang: tabbar ? 8 : 12,
      spread: tabbar ? 0.18 : 0.16,
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
