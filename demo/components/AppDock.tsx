'use client';

import { useRef } from 'react';
import { GlassButton, GlassNav, useRefraction } from '@zakisheriff/liquid-glass';
import { Bookmark, Compass, Search, Suitcase } from './icons';

const TABS = [
  { label: 'Explore', icon: <Compass /> },
  { label: 'Saved', icon: <Bookmark /> },
  { label: 'Trips', icon: <Suitcase /> },
];

/** A stable glass dock; scrolling the app never changes its size. */
export function AppDock({ tab, onChange, onSearch }: {
  tab: number;
  onChange: (index: number) => void;
  onSearch: () => void;
}) {
  const shell = useRef<HTMLDivElement>(null);
  useRefraction(shell, { kind: 'surface' });
  return (
    <div className="device__bottom">
      <div ref={shell} className="lg-glass lg-glass--host device__tabs app-tabs">
        <GlassNav activeIndex={tab} onChange={onChange} items={TABS} aria-label="Travel navigation" />
      </div>
      <GlassButton size="lg" icon={<Search size={22} />} aria-label="Search places" className="device__search" onClick={onSearch} />
    </div>
  );
}
