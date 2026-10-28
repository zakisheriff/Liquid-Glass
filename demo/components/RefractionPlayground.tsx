'use client';

import { useState } from 'react';
import { GlassButton, GlassCard, GlassInput, GlassMenu, GlassNav, GlassSegmented, GlassSheet, GlassSlider, GlassSwitch } from '@zakisheriff/liquid-glass';
import { Bookmark, Check, Compass, Ellipsis, Grid, Heart, HeartFill, Note, Person, Search, Share, Speaker, Sun } from './icons';
import { SheetFrame } from './SheetFrame';

const TABS = [
  { label: 'Explore', icon: <Compass /> },
  { label: 'Saved', icon: <Bookmark /> },
  { label: 'Library', icon: <Grid /> },
  { label: 'Music', icon: <Note /> },
  { label: 'Profile', icon: <Person /> },
];
const SEARCH_TAB = { label: 'Search', icon: <Search /> };
const TAB_COUNTS = [2, 3, 4, 5];

/** Every material is live in the same scene, so they can be compared together. */
export function RefractionPlayground() {
  const [segment, setSegment] = useState(0);
  const [tab, setTab] = useState(0);
  const [tabCount, setTabCount] = useState(4);
  const [searchApart, setSearchApart] = useState(false);
  const [query, setQuery] = useState('');
  const [volume, setVolume] = useState(64);
  const [display, setDisplay] = useState(64);
  const [sound, setSound] = useState(38);
  const [notify, setNotify] = useState(true);
  const [liked, setLiked] = useState(false);
  const [sort, setSort] = useState('Recommended');
  const [sheet, setSheet] = useState(false);
  // A bar ends with its Search tab; split, Search becomes its own circle.
  const tabs = searchApart ? TABS.slice(0, tabCount) : [...TABS.slice(0, tabCount - 1), SEARCH_TAB];
  return (
    <div className="playground">
      <div className="playground__search">
        <GlassInput type="search" placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Playground search" />
        <GlassSegmented options={['Design', 'Code', 'Preview']} value={segment} onChange={setSegment} aria-label="Playground segments" />
      </div>
      <GlassCard className="playground__panel" padding="20px" radius="26px">
        <h3>Buttons</h3>
        <div className="playground__buttons">
          <GlassButton>Glass</GlassButton>
          <GlassButton variant="filled">Filled</GlassButton>
          <GlassButton variant="tinted" tint="#ff375f">Tinted</GlassButton>
          <GlassButton variant="filled" tint="#af52de">Tinted filled</GlassButton>
          <GlassButton destructive>Destructive</GlassButton>
          <GlassButton icon={liked ? <HeartFill size={18} /> : <Heart size={18} />} aria-label="Like playground" aria-pressed={liked} tint={liked ? '#ff375f' : undefined} onClick={() => setLiked(!liked)} />
          <GlassButton icon={<Share size={18} />} aria-label="Share playground" />
        </div>
      </GlassCard>
      <GlassCard className="playground__panel" padding="20px" radius="26px">
        <h3>Controls</h3>
        <div className="mixer">
          <GlassSlider showThumb={false} value={display} onChange={setDisplay} icon={<Sun size={18} />} label="Display" aria-label="Playground display" />
          <GlassSlider showThumb={false} value={sound} onChange={setSound} icon={<Speaker size={18} />} label="Sound" aria-label="Playground sound" />
        </div>
        <GlassSlider value={volume} onChange={setVolume} icon={<Speaker size={18} />} label="Volume" aria-label="Playground volume" />
        <div className="setting"><span className="setting__label">Notifications</span><GlassSwitch checked={notify} onChange={setNotify} aria-label="Playground notifications" /></div>
      </GlassCard>
      <GlassCard className="playground__panel" padding="20px" radius="26px">
        <h3>Tab bar</h3>
        <div className="playground__dock">
          <GlassNav items={tabs} showLabels={false} activeIndex={Math.min(tab, tabs.length - 1)} onChange={setTab} aria-label="Playground navigation" />
          {searchApart && <GlassButton className="playground__dock-search" icon={<Search size={22} />} aria-label="Search" />}
        </div>
        <div>
          <div className="setting"><span className="setting__label">Tabs</span><GlassSegmented size="sm" options={TAB_COUNTS.map(String)} value={TAB_COUNTS.indexOf(tabCount)} onChange={(index) => setTabCount(TAB_COUNTS[index])} aria-label="Number of tabs" /></div>
          <div className="setting"><span className="setting__label">Search on its own</span><GlassSwitch checked={searchApart} onChange={setSearchApart} aria-label="Search on its own" /></div>
        </div>
      </GlassCard>
      <GlassCard className="playground__panel playground__panel--menu" padding="20px" radius="26px">
        <h3>Menu &amp; sheet</h3>
        <GlassButton className="playground__sheet-trigger" variant="filled" aria-label="Open playground sheet" onClick={() => setSheet(true)}>Open sheet</GlassButton>
        <GlassMenu className="playground__menu" align="start" icon={<span className="playground__menu-label"><Ellipsis size={20} /><span>{sort}</span></span>} aria-label="Playground menu" width={200} check={<Check size={16} />} items={['Recommended', 'Newest first', 'Name A–Z'].map((label) => ({ label, checked: sort === label, onSelect: () => setSort(label) }))} />
      </GlassCard>
      <GlassSheet open={sheet} onClose={() => setSheet(false)} detents={['medium', 'large']} aria-label="Playground sheet">
        <SheetFrame footer={<GlassButton size="lg" variant="filled" onClick={() => setSheet(false)} style={{ width: '100%' }}>Done</GlassButton>}>
          <div className="playground__sheet">
            <h2>Made of glass.</h2>
            <p>Drag the handle to expand, scroll the content, or tap Done.</p>
            <GlassCard padding="24px" radius="24px"><p>Cards, controls, and a sheet — all using the same liquid glass material.</p></GlassCard>
            <GlassSlider value={volume} onChange={setVolume} label="Volume" aria-label="Sheet playground volume" />
            <div className="setting"><span className="setting__label">Notifications</span><GlassSwitch checked={notify} onChange={setNotify} aria-label="Sheet playground notifications" /></div>
          </div>
        </SheetFrame>
      </GlassSheet>
    </div>
  );
}
