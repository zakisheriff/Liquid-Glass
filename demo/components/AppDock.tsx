'use client';

import { useRef } from 'react';
import { GlassButton, GlassNav, useRefraction, type GlassNavItem } from '@zakisheriff/liquid-glass';
import { Bookmark, Compass, Grid, Search } from './icons';

const TABS = [
  { label: 'Explore', icon: <Compass /> },
  { label: 'Saved', icon: <Bookmark /> },
  { label: 'Library', icon: <Grid /> },
  { label: 'Search', icon: <Search /> },
];

/**
 * A stable glass dock; scrolling the app never changes its size. With a
 * `trailing` action it splits like iOS 26: the tabs on the left, a separate
 * glass circle (e.g. Search) on the right.
 */
export function AppDock({ tab, onChange, onSearch, items = TABS, trailing, showLabels = true, style }: {
  tab: number;
  onChange: (index: number) => void;
  onSearch?: () => void;
  items?: GlassNavItem[];
  trailing?: { label: string; icon: React.ReactNode; onClick?: () => void };
  showLabels?: boolean;
  style?: React.CSSProperties;
}) {
  const shell = useRef<HTMLDivElement>(null);
  useRefraction(shell, { kind: 'surface' });
  const search = items.length - 1;
  return (
    <div className={`device__bottom${trailing ? ' device__bottom--split' : ''}`} style={style}>
      <div ref={shell} className="lg-glass lg-glass--host device__tabs app-tabs">
        <GlassNav activeIndex={tab} onChange={(index) => {
          if (!trailing && index === search && onSearch) onSearch();
          else onChange(index);
        }} items={items} showLabels={showLabels} aria-label="App navigation" />
      </div>
      {trailing && (
        <GlassButton className="device__action" icon={trailing.icon} aria-label={trailing.label} onClick={trailing.onClick} />
      )}
    </div>
  );
}
