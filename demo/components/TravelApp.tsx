'use client';

import { useRef, useState } from 'react';
import { GlassButton, GlassInput, GlassSegmented } from '@zakisheriff/liquid-glass';
import { AppDock } from './AppDock';
import { ArrowLeft, ArrowRight, Bookmark, Check, Close, Ellipsis, Menu, Pin } from './icons';

const PLACES = [
  { id: 'lake', title: 'Lakeside days', region: 'The Italian lakes', category: 'Outdoors', tag: 'Slow living', description: 'Quiet mornings by the water, little lakeside villages, and no plans beyond the next view.' },
  { id: 'peaks', title: 'Above the clouds', region: 'The Alps', category: 'Outdoors', tag: 'Adventure', description: 'Take the scenic route. Follow mountain trails and make room for a long lunch with a view.' },
  { id: 'coast', title: 'A little more ocean', region: 'Coastal escapes', category: 'Outdoors', tag: 'Unwind', description: 'Barefoot afternoons, a good book, and the sound of the sea. A change of pace worth saving.' },
  { id: 'village', title: 'The colorful coast', region: 'Italian Riviera', category: 'City breaks', tag: 'Culture', description: 'Wander colorful streets, find a favorite café, and watch the coast light up at golden hour.' },
  { id: 'night', title: 'Under the stars', region: 'Alpine hideaways', category: 'Outdoors', tag: 'Disconnect', description: 'Swap city lights for open skies. Find a quiet mountain base for a weekend away from it all.' },
  { id: 'forest', title: 'Into the green', region: 'Forest retreats', category: 'Outdoors', tag: 'Nature', description: 'A cabin, a winding trail, and time to take it all in. Your invitation to head outside.' },
];
type Place = typeof PLACES[number];

export function TravelApp() {
  const [tab, setTab] = useState(0);
  const [segment, setSegment] = useState(0);
  const [saved, setSaved] = useState(['peaks', 'village']);
  const [trips, setTrips] = useState(['lake']);
  const [selected, setSelected] = useState<Place | null>(null);
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
    setQuery('');
    feed.current?.scrollTo({ top: 0 });
  };
  const toggleSaved = (id: string) => setSaved((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const startSearch = () => {
    setSearching(true);
    setSelected(null);
    feed.current?.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(() => search.current?.focus({ preventScroll: true }));
  };
  const visible = PLACES.filter((place) => (
    (tab === 0 || (tab === 1 ? saved : trips).includes(place.id)) &&
    (tab !== 0 || segment === 0 || place.category === 'Outdoors') &&
    `${place.title} ${place.region} ${place.tag}`.toLowerCase().includes(query.toLowerCase())
  ));
  if (sort) visible.sort((a, b) => a.title.localeCompare(b.title));

  const card = (place: Place, featured = false) => (
    <article key={place.id} className={`travel__card${featured ? ' travel__card--feature' : ''}`}>
      <button className="travel__place" onClick={() => { setSelected(place); feed.current?.scrollTo({ top: 0 }); }} aria-label={`Explore ${place.title}`}>
        <img src={`/places/${place.id}.jpg`} alt={place.region} loading="lazy" />
        <span className="travel__card-copy"><small>{place.region}</small><strong>{place.title}</strong>{featured && <span>Find a slower kind of weekend <ArrowRight size={16} /></span>}</span>
      </button>
      <GlassButton className="travel__save" size="sm" icon={saved.includes(place.id) ? <Check size={17} /> : <Bookmark size={17} />} aria-label={`${saved.includes(place.id) ? 'Unsave' : 'Save'} ${place.title}`} aria-pressed={saved.includes(place.id)} onClick={() => toggleSaved(place.id)} />
    </article>
  );

  return (
    <div className="travel-app">
      <div ref={feed} className="device__feed">
        {selected ? (
          <div className="travel__detail">
            <button className="travel__back" onClick={() => setSelected(null)}><ArrowLeft size={14} /> Back to {['Explore', 'Saved', 'Trips'][tab]}</button>
            <img className="travel__detail-image" src={`/places/${selected.id}.jpg`} alt={selected.region} />
            <h3 className="device__heading">{selected.title}</h3>
            <p className="travel__region"><Pin size={16} /> {selected.region}</p>
            <p className="travel__description">{selected.description}</p>
            <GlassButton variant="filled" onClick={() => {
              setTrips((items) => items.includes(selected.id) ? items : [...items, selected.id]);
              changeTab(2);
            }} icon={<Check size={18} />}>{trips.includes(selected.id) ? 'View in my trip' : 'Add to my trip'}</GlassButton>
            <GlassButton onClick={() => toggleSaved(selected.id)} icon={<Bookmark size={18} />}>{saved.includes(selected.id) ? 'Saved' : 'Save for later'}</GlassButton>
          </div>
        ) : (
          <>
            <h3 className="device__heading">{['Find your escape.', 'Worth keeping.', 'Your next chapter.'][tab]}</h3>
            {searching && <div className="travel__search"><GlassInput ref={search} type="search" placeholder="Find a place" aria-label="Find a place" value={query} onChange={(event) => setQuery(event.target.value)} /><GlassButton size="sm" icon={<Close size={16} />} aria-label="Close place search" onClick={() => {setSearching(false);setQuery('');}} /></div>}
            {tab === 0 && !query && visible[0] && card(visible[0], true)}
            <div className="travel__section-label"><strong>{tab === 0 ? 'A change of scenery' : tab === 1 ? 'Your saved places' : 'On the itinerary'}</strong><span>{visible.length} {visible.length === 1 ? 'place' : 'places'}</span></div>
            <div className="travel__grid">{(tab === 0 && !query ? visible.slice(1) : visible).map((place) => (
              <div key={place.id}>{card(place)}{tab === 2 && <button className="travel__remove" onClick={() => setTrips((items) => items.filter((id) => id !== place.id))}>Remove from trip</button>}</div>
            ))}</div>
            {!visible.length && <div className="travel__empty"><Bookmark size={32} /><strong>{query ? 'No places found' : 'Make room for a little adventure.'}</strong><span>{query ? 'Try a different place or mood.' : 'Explore a place and add it to your list.'}</span><GlassButton onClick={() => changeTab(0)}>Explore places</GlassButton></div>}
          </>
        )}
      </div>
      <div className="device__top">
        <GlassButton size="md" icon={<Menu size={20} />} aria-label="Travel menu" aria-expanded={menu} onClick={() => setMenu((value) => !value)} />
        <GlassSegmented options={['For You', 'Outdoors']} value={segment} onChange={(value) => {setSegment(value);changeTab(0);}} aria-label="Discover feed" />
        <GlassButton size="md" icon={<Ellipsis size={20} />} aria-label={sort ? 'Sort by recommended' : 'Sort places by name'} aria-pressed={sort} onClick={() => setSort((value) => !value)} />
      </div>
      {menu && <div className="lg-glass travel__menu"><button onClick={() => changeTab(0)}>Explore places</button><button onClick={() => changeTab(1)}>Saved places · {saved.length}</button><button onClick={() => changeTab(2)}>My trip · {trips.length}</button></div>}
      <AppDock tab={tab} onChange={changeTab} onSearch={startSearch} />
    </div>
  );
}
