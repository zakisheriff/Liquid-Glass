'use client';

import { useRef } from 'react';
import { GlassNav, useRefraction } from '@zakisheriff/liquid-glass';
import { Bookmark, Compass, Grid, Search } from './icons';

const TABS = [
  { label: 'Explore', icon: <Compass /> },
  { label: 'Saved', icon: <Bookmark /> },
  { label: 'Library', icon: <Grid /> },
  { label: 'Search', icon: <Search /> },
];

/** A stable glass dock; scrolling the app never changes its size. */
export function AppDock({ tab, onChange, onSearch }: {
  tab: number;
  onChange: (index: number) => void;
  onSearch?: () => void;
}) {
  const shell = useRef<HTMLDivElement>(null);
  useRefraction(shell, { kind: 'surface' });
  return (
    <div className="device__bottom">
      <div ref={shell} className="lg-glass lg-glass--host device__tabs app-tabs">
        <GlassNav activeIndex={tab} onChange={(index) => {
          if (index === 3 && onSearch) onSearch();
          else onChange(index);
        }} items={TABS} aria-label="App navigation" />
      </div>
    </div>
  );
}
