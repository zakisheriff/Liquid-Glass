'use client';

import { useRef, useState } from 'react';
import { GlassButton, GlassInput, GlassSegmented } from '@zakisheriff/liquid-glass';
import { AppDock } from './AppDock';
import { PhoneStudio, studioArtwork, type StudioPalette } from './PhoneStudio';
import { ArrowLeft, Bookmark, Check, Close, Ellipsis } from './icons';

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
  const [segment, setSegment] = useState(0);
  const [saved, setSaved] = useState([1, 4]);
  const [collection, setCollection] = useState([0]);
  const [selected, setSelected] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [menu, setMenu] = useState(false);
  const [sort, setSort] = useState(false);
  const [sheetHost, setSheetHost] = useState<HTMLDivElement | null>(null);
  const [studio, setStudio] = useState<StudioPalette>({ name: 'Slate', brightness: 76, hue: 212, vivid: true });
  const palettes = PALETTES.map((palette, index) => index === 0 ? { ...palette, name: studio.name.trim() || 'Untitled palette' } : palette);
  const feed = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const changeTab = (index: number) => {
    setTab(index);
    setSelected(null);
    setMenu(false);
    setSearching(false);
    setQuery('');
    feed.current?.scrollTo({ top: 0 });
  };
  const toggleSaved = (index: number) => setSaved((items) => items.includes(index) ? items.filter((item) => item !== index) : [...items, index]);
  const startSearch = () => {
    setSearching(true);
    setSelected(null);
    setMenu(false);
    feed.current?.scrollTo({ top: 0 });
    requestAnimationFrame(() => search.current?.focus({ preventScroll: true }));
  };
  const visible = PALETTES.map((_, index) => index).filter((index) =>
    (tab === 0 || (tab === 1 ? saved : collection).includes(index)) &&
    palettes[index].name.toLowerCase().includes(query.toLowerCase()),
  );
  if (sort) visible.sort((a, b) => palettes[a].name.localeCompare(palettes[b].name));

  const card = (index: number, featured = false) => (
    <article key={index} className={`mock__card${featured ? ' mock__card--feature' : ''}`}>
      <button className="mock__tile" style={index === 0 ? studioArtwork(studio) : { backgroundColor: background(index) }} aria-label={`Open ${palettes[index].name} palette`} onClick={() => {setSelected(index);feed.current?.scrollTo({top:0});}} />
      <GlassButton className="mock__save" size="sm" icon={saved.includes(index) ? <Check size={17} /> : <Bookmark size={17} />} aria-label={`${saved.includes(index) ? 'Unsave' : 'Save'} ${palettes[index].name} palette`} aria-pressed={saved.includes(index)} onClick={() => toggleSaved(index)} />
    </article>
  );

  return (
    <div ref={setSheetHost} className="mock-app">
      <div ref={feed} className="device__feed">
        {tab === 0 && segment === 0 && !searching && selected === null ? <PhoneStudio container={sheetHost} palette={studio} onChange={setStudio} saved={saved.includes(0)} onSave={() => toggleSaved(0)} /> : selected === null ? <>
          {searching && <div className="mock__search"><GlassInput ref={search} type="search" placeholder="Find a palette" aria-label="Find a palette" value={query} onChange={(event) => setQuery(event.target.value)} /><GlassButton size="sm" icon={<Close size={16} />} aria-label="Close palette search" onClick={() => {setSearching(false);setQuery('');}} /></div>}
          {tab === 0 && !query && visible[0] !== undefined && card(visible[0], true)}
          <div className="mock__grid">{(tab === 0 && !query ? visible.slice(1) : visible).map((index) => card(index))}</div>
          {!visible.length && <p className="mock__empty">{query ? 'No matches' : 'Nothing saved yet'}</p>}
        </> : <>
          <GlassButton size="sm" icon={<ArrowLeft size={16} />} onClick={() => setSelected(null)}>Back</GlassButton>
          <div className="mock__preview" style={selected === 0 ? studioArtwork(studio) : { backgroundColor: background(selected) }} aria-label={`${palettes[selected].name} palette`} />
          <div className="mock__actions"><GlassButton icon={<Bookmark size={18} />} onClick={() => toggleSaved(selected)}>{saved.includes(selected) ? 'Saved' : 'Save'}</GlassButton><GlassButton variant="filled" icon={<Check size={18} />} onClick={() => {setCollection((items) => items.includes(selected) ? items : [...items, selected]);changeTab(2);}}>Add to collection</GlassButton></div>
        </>}
      </div>
      <div className="device__top">
        <span className="device__top-spacer" aria-hidden="true" />
        <GlassSegmented options={['Studio', 'Palettes']} value={segment} onChange={(value) => {setSegment(value);changeTab(0);}} aria-label="Palette feed" />
        <GlassButton size="md" icon={<Ellipsis size={20} />} aria-label="More options" aria-expanded={menu} onClick={() => setMenu((value) => !value)} />
      </div>
      {menu && <div className="lg-glass mock__menu" role="menu" aria-label="Palette options">
        <button role="menuitem" onClick={() => {setSort(false);setMenu(false);}}>Recommended {!sort && <Check size={16} />}</button><button role="menuitem" onClick={() => {setSort(true);setMenu(false);}}>Name A–Z {sort && <Check size={16} />}</button><button role="menuitem" onClick={() => setMenu(false)}>Close</button>
      </div>}
      <AppDock tab={searching ? 3 : tab} onChange={changeTab} onSearch={startSearch} />
    </div>
  );
}
