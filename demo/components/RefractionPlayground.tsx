'use client';

import { useEffect, useState } from 'react';
import { GlassButton, GlassCard, GlassInput, GlassMenu, GlassNav, GlassSegmented, GlassSheet, GlassSlider, GlassSwitch } from '@zakisheriff/liquid-glass';
import { Bookmark, Check, Compass, Ellipsis, Grid, Heart, HeartFill, Note, Person, Play, Plus, Search, Share, Speaker, Sun } from './icons';
import { SheetFrame } from './SheetFrame';
import { usePreviewMorph } from './PreviewMorph';

const TABS = [
  { label: 'Explore', icon: <Compass /> },
  { label: 'Saved', icon: <Bookmark /> },
  { label: 'Library', icon: <Grid /> },
  { label: 'Music', icon: <Note /> },
  { label: 'Profile', icon: <Person /> },
];
const SEARCH_TAB = { label: 'Search', icon: <Search /> };
const TAB_COUNTS = [2, 3, 4, 5];

/** What the menu sorts: `rank` is the recommended order, `age` days since added. */
const WALLPAPERS = [
  { name: 'Aurora', rank: 1, age: 3, color: 'linear-gradient(135deg, #5e5ce6, #64d2ff)' },
  { name: 'Basalt', rank: 2, age: 1, color: 'linear-gradient(135deg, #3a3a3c, #8e8e93)' },
  { name: 'Coral', rank: 0, age: 6, color: 'linear-gradient(135deg, #ff6482, #ffb340)' },
];
const SORTS: Record<string, (a: (typeof WALLPAPERS)[number], b: (typeof WALLPAPERS)[number]) => number> = {
  Recommended: (a, b) => a.rank - b.rank,
  'Newest first': (a, b) => a.age - b.age,
  'Name A–Z': (a, b) => a.name.localeCompare(b.name),
};

/** Every material is live in the same scene, so they can be compared together. */
export function RefractionPlayground() {
  const [segment, setSegment] = useState(0);
  const [tab, setTab] = useState(0);
  const [tabCount, setTabCount] = useState(5);
  const [searchApart, setSearchApart] = useState(true);
  const [labels, setLabels] = useState(true);
  // Phones start with four tabs and search inside the bar, so it fits.
  useEffect(() => {
    if (!matchMedia('(max-width: 640px)').matches) return;
    setTabCount(4);
    setSearchApart(false);
  }, []);
  // Tab bar options morph the bar in place, like the Tab bar tile.
  const { ref: dock, morph } = usePreviewMorph();
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
      <GlassCard className="playground__panel" padding="16px 18px" radius="24px">
        <h3>Buttons</h3>
        <div className="playground__rows">
          <div className="playground__buttons">
            <GlassButton>Glass</GlassButton>
            <GlassButton variant="filled">Filled</GlassButton>
            <GlassButton variant="tinted" tint="#ff375f">Tinted</GlassButton>
            <GlassButton variant="filled" tint="#af52de">Tinted filled</GlassButton>
          </div>
          <div className="playground__buttons">
            <GlassButton destructive>Destructive</GlassButton>
            <GlassButton variant="filled" tint="#30d158" icon={<Play size={16} />}>Play</GlassButton>
            <GlassButton variant="tinted" icon={<Plus size={16} />}>Add</GlassButton>
            <GlassButton icon={liked ? <HeartFill size={18} /> : <Heart size={18} />} aria-label="Like playground" aria-pressed={liked} tint={liked ? '#ff375f' : undefined} onClick={() => setLiked(!liked)} />
            <GlassButton icon={<Share size={18} />} aria-label="Share playground" />
          </div>
        </div>
        <GlassButton className="playground__wide" variant="filled">Continue</GlassButton>
      </GlassCard>
      <GlassCard className="playground__panel" padding="16px 18px" radius="24px">
        <h3>Controls</h3>
        <div className="mixer">
          <GlassSlider showThumb={false} value={display} onChange={setDisplay} icon={<Sun size={18} />} label="Display" aria-label="Playground display" />
          <GlassSlider showThumb={false} value={sound} onChange={setSound} icon={<Speaker size={18} />} label="Sound" aria-label="Playground sound" />
        </div>
        <div className="playground__inline">
          <GlassSlider value={volume} onChange={setVolume} aria-label="Playground volume" />
          <GlassSwitch checked={notify} onChange={setNotify} aria-label="Playground notifications" />
        </div>
      </GlassCard>
      <GlassCard className="playground__panel" padding="16px 18px" radius="24px">
        <h3>Tab Bar</h3>
        <div ref={dock} className="playground__dock" data-labels={labels ? '' : undefined}>
          <GlassNav items={tabs} showLabels={labels} activeIndex={Math.min(tab, tabs.length - 1)} onChange={setTab} aria-label="Playground navigation" />
          {searchApart && <GlassButton className="playground__dock-search" icon={<Search size={22} />} aria-label="Search" />}
        </div>
        <div>
          <div className="setting"><span className="setting__label">Tabs</span><GlassSegmented size="sm" options={TAB_COUNTS.map(String)} value={TAB_COUNTS.indexOf(tabCount)} onChange={(index) => morph(() => setTabCount(TAB_COUNTS[index]))} aria-label="Number of tabs" /></div>
          <div className="setting"><span className="setting__label">Tabs + Button</span><GlassSwitch checked={searchApart} onChange={(on) => morph(() => setSearchApart(on))} aria-label="Tabs + Button" /></div>
          <div className="setting"><span className="setting__label">Show Labels</span><GlassSwitch checked={labels} onChange={(on) => morph(() => setLabels(on))} aria-label="Show tab labels" /></div>
        </div>
      </GlassCard>
      <GlassCard className="playground__panel playground__panel--menu" padding="16px 18px" radius="24px">
        <h3>Menu &amp; Sheet</h3>
        <div className="playground__menu-row">
          <div className="playground__menu-actions">
            <GlassMenu className="playground__menu" align="start" icon={<span className="playground__menu-label"><Ellipsis size={20} /><span>{sort}</span></span>} aria-label="Playground menu" width={200} check={<Check size={16} />} items={Object.keys(SORTS).map((label) => ({ label, checked: sort === label, onSelect: () => setSort(label) }))} />
            {/* Below the menu, so the open menu grows down inside the card. */}
            <GlassButton className="playground__sheet-trigger" variant="filled" aria-label="Open playground sheet" onClick={() => setSheet(true)}>Open sheet</GlassButton>
          </div>
          {/* The menu really sorts this list. */}
          <ul className="playground__list" aria-label="Wallpapers">
            {[...WALLPAPERS].sort(SORTS[sort]).map((item) => (
              <li key={item.name}>
                <span className="playground__swatch" style={{ background: item.color }} />
                <span>{item.name}</span>
                <small>{item.age === 1 ? 'Yesterday' : `${item.age} days ago`}</small>
              </li>
            ))}
          </ul>
        </div>
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
