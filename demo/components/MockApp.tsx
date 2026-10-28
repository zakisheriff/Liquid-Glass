'use client';

import { useRef, useState } from 'react';
import { GlassButton, GlassInput, GlassSegmented } from '@zakisheriff/liquid-glass';
import { AppDock } from './AppDock';
import { ArrowLeft, Bookmark, Check, Close, Ellipsis } from './icons';

const PALETTES = [
  { name: 'Amber', colors: ['#ffbd70', '#ff6f61', '#8f3dd9'] },
  { name: 'Ocean', colors: ['#83ffe2', '#00aff5', '#1265ec'] },
  { name: 'Dusk', colors: ['#a7a4ff', '#6460da', '#171e38'] },
  { name: 'Mint', colors: ['#e1ffab', '#49e89c', '#059f98'] },
  { name: 'Iris', colors: ['#e2a4fb', '#9582ee', '#514ce1'] },
  { name: 'Rose', colors: ['#ffdd9e', '#f964ad', '#b11a7b'] },
  { name: 'Sunrise', colors: ['#fff29a', '#ffab36', '#f35b59'] },
  { name: 'Glacier', colors: ['#d6fff4', '#77c8e7', '#657bc5'] },
];
const background = (index: number) => {
  const [a, b, c] = PALETTES[index].colors;
  return `radial-gradient(ellipse at 10% 0%, ${a}, transparent 65%), radial-gradient(ellipse at 90% 95%, ${c}, transparent 65%), linear-gradient(135deg, ${b}, ${c})`;
};

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
    (segment === 0 || index % 2 === 0) &&
    PALETTES[index].name.toLowerCase().includes(query.toLowerCase()),
  );
  if (sort) visible.sort((a, b) => PALETTES[a].name.localeCompare(PALETTES[b].name));

  const card = (index: number, featured = false) => (
    <article key={index} className={`mock__card${featured ? ' mock__card--feature' : ''}`}>
      <button className="mock__tile" style={{ background: background(index) }} aria-label={`Open ${PALETTES[index].name} gradient`} onClick={() => {setSelected(index);feed.current?.scrollTo({top:0});}} />
      <GlassButton className="mock__save" size="sm" icon={saved.includes(index) ? <Check size={17} /> : <Bookmark size={17} />} aria-label={`${saved.includes(index) ? 'Unsave' : 'Save'} ${PALETTES[index].name} gradient`} aria-pressed={saved.includes(index)} onClick={() => toggleSaved(index)} />
    </article>
  );

  return (
    <div className="mock-app">
      <div ref={feed} className="device__feed">
        {selected === null ? <>
          {searching && <div className="mock__search"><GlassInput ref={search} type="search" placeholder="Find a gradient" aria-label="Find a gradient" value={query} onChange={(event) => setQuery(event.target.value)} /><GlassButton size="sm" icon={<Close size={16} />} aria-label="Close gradient search" onClick={() => {setSearching(false);setQuery('');}} /></div>}
          {tab === 0 && !query && visible[0] !== undefined && card(visible[0], true)}
          <div className="mock__grid">{(tab === 0 && !query ? visible.slice(1) : visible).map((index) => card(index))}</div>
          {!visible.length && <p className="mock__empty">{query ? 'No matches' : 'Nothing saved yet'}</p>}
        </> : <>
          <GlassButton size="sm" icon={<ArrowLeft size={16} />} onClick={() => setSelected(null)}>Back</GlassButton>
          <div className="mock__preview" style={{background:background(selected)}} aria-label={`${PALETTES[selected].name} gradient`} />
          <div className="mock__actions"><GlassButton icon={<Bookmark size={18} />} onClick={() => toggleSaved(selected)}>{saved.includes(selected) ? 'Saved' : 'Save'}</GlassButton><GlassButton variant="filled" icon={<Check size={18} />} onClick={() => {setCollection((items) => items.includes(selected) ? items : [...items, selected]);changeTab(2);}}>Add to collection</GlassButton></div>
        </>}
      </div>
      <div className="device__top">
        <span className="device__top-spacer" aria-hidden="true" />
        <GlassSegmented options={['For You', 'Palettes']} value={segment} onChange={(value) => {setSegment(value);changeTab(0);}} aria-label="Palette feed" />
        <GlassButton size="md" icon={<Ellipsis size={20} />} aria-label="More options" aria-expanded={menu} onClick={() => setMenu((value) => !value)} />
      </div>
      {menu && <div className="lg-glass mock__menu" role="menu" aria-label="Palette options">
        <button role="menuitem" onClick={() => {setSort(false);setMenu(false);}}>Recommended {!sort && <Check size={16} />}</button><button role="menuitem" onClick={() => {setSort(true);setMenu(false);}}>Name A–Z {sort && <Check size={16} />}</button><button role="menuitem" onClick={() => setMenu(false)}>Close</button>
      </div>}
      <AppDock tab={searching ? 3 : tab} onChange={changeTab} onSearch={startSearch} />
    </div>
  );
}
