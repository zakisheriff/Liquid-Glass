'use client';

import { useRef, useState } from 'react';
import { GlassButton } from '@zakisheriff/liquid-glass';
import { AppDock } from './AppDock';
import { Avatar, HomeFeed } from './HomeFeed';
import { ArchivePage, SearchPage } from './PhonePages';
import { PhonePreviewThemeToggle } from './PreviewTheme';
import { studioArtwork, type StudioPalette } from './PhoneStudio';
import { ArrowLeft, Bookmark, Check, Home, Search } from './icons';

const TABS = [
  { label: 'Home', icon: <Home /> },
  { label: 'Archive', icon: <Bookmark /> },
  { label: 'Search', icon: <Search /> },
];
const TITLES = ['Home', 'Archive', 'Search'];

const PALETTES = [
  { name: 'Slate', color: '#5a768f' },
  { name: 'Ocean', color: '#317eab' },
  { name: 'Dusk', color: '#444d69' },
  { name: 'Mint', color: '#64a796' },
  { name: 'Indigo', color: '#596b9b' },
  { name: 'Stone', color: '#8b8e92' },
  { name: 'Sand', color: '#b5a17f' },
  { name: 'Glacier', color: '#8fb5c7' },
];
const background = (index: number) => PALETTES[index].color;

export function MockApp() {
  const [tab, setTab] = useState(0);
  const [saved, setSaved] = useState([1, 4]);
  const [selected, setSelected] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [sheetHost, setSheetHost] = useState<HTMLDivElement | null>(null);
  const [studio] = useState<StudioPalette>({ name: 'Slate', brightness: 76, hue: 212, vivid: true });
  const palettes = PALETTES.map((palette, index) => index === 0 ? { ...palette, name: studio.name.trim() || 'Untitled palette' } : palette);
  const feed = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const changeTab = (index: number) => {
    setTab(index);
    setSelected(null);
    setSearching(false);
    setQuery('');
    feed.current?.scrollTo({ top: 0 });
  };
  const toggleSaved = (index: number) => setSaved((items) => items.includes(index) ? items.filter((item) => item !== index) : [...items, index]);
  const startSearch = () => {
    setSearching(true);
    setSelected(null);
    feed.current?.scrollTo({ top: 0 });
    requestAnimationFrame(() => search.current?.focus({ preventScroll: true }));
  };
  const visible = PALETTES.map((_, index) => index).filter((index) =>
    (searching || saved.includes(index)) &&
    palettes[index].name.toLowerCase().includes(query.toLowerCase()),
  );

  const card = (index: number, featured = false) => (
    <article key={index} className={`mock__card${featured ? ' mock__card--feature' : ''}`}>
      <button className="mock__tile" style={index === 0 ? studioArtwork(studio) : { backgroundColor: background(index) }} aria-label={`Open ${palettes[index].name} palette`} onClick={() => {setSelected(index);feed.current?.scrollTo({top:0});}} />
      <GlassButton className="mock__save" size="sm" icon={saved.includes(index) ? <Check size={17} /> : <Bookmark size={17} />} aria-label={`${saved.includes(index) ? 'Unsave' : 'Save'} ${palettes[index].name} palette`} aria-pressed={saved.includes(index)} onClick={() => toggleSaved(index)} />
    </article>
  );

  return (
    <div ref={setSheetHost} className="mock-app">
      <div ref={feed} className="device__feed">
        {selected === null ? (searching ? (
          <SearchPage query={query} onQuery={setQuery} inputRef={search} onClose={() => {setSearching(false);setQuery('');}} paletteCards={query.trim() ? visible.map((index) => card(index)) : []} />
        ) : tab === 1 ? (
          <ArchivePage cards={visible.map((index) => card(index))} />
        ) : <HomeFeed />) : <>
          <GlassButton size="sm" icon={<ArrowLeft size={16} />} onClick={() => setSelected(null)}>Back</GlassButton>
          <div className="mock__preview" style={selected === 0 ? studioArtwork(studio) : { backgroundColor: background(selected) }} aria-label={`${palettes[selected].name} palette`} />
          <div className="mock__actions"><GlassButton icon={<Bookmark size={18} />} onClick={() => toggleSaved(selected)}>{saved.includes(selected) ? 'Saved' : 'Save'}</GlassButton><GlassButton variant="filled" icon={<Check size={18} />} onClick={() => {setSaved((items) => items.includes(selected) ? items : [...items, selected]);changeTab(1);}}>Show in Archive</GlassButton></div>
        </>}
      </div>
      <div className="device__top">
        {tab === 0 && !searching ? (
          <span className="device__brand">The Atom</span>
        ) : (
          <h2 className="device__title">{TITLES[searching ? 2 : tab]}</h2>
        )}
        <PhonePreviewThemeToggle />
        <Avatar thumb={{ src: '/phone/ava.jpg', photo: true }} className="device__me" />
      </div>
      <AppDock items={TABS} tab={searching ? 2 : tab} onChange={changeTab} onSearch={startSearch} />
    </div>
  );
}
