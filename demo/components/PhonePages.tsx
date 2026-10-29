'use client';

import { useState, type ReactNode, type RefObject } from 'react';
import { GlassButton, GlassInput } from '@zakisheriff/liquid-glass';
import { Avatar, ROWS, type Thumb } from './HomeFeed';
import { Close } from './icons';

const ARCHIVED: Array<{ group: string; thumb: Thumb; title: string; meta: string }> = [
  { group: 'This week', thumb: { src: '/phone/city.webp', photo: true }, title: 'Downtown LA photos', meta: '18 photos · Sat' },
  { group: 'This week', thumb: { src: '/phone/night.webp' }, title: 'Road trip mix', meta: '24 songs · Thu' },
  { group: 'September', thumb: { src: '/phone/shape.webp' }, title: 'Mood board', meta: 'Collection · 14 Sep' },
  { group: 'September', thumb: { src: '/phone/sync.webp', round: true }, title: 'August budget', meta: 'Spreadsheet · 2 Sep' },
  { group: 'September', thumb: { src: '/phone/popcorn.webp' }, title: 'Movie list', meta: 'Watchlist · 21 Sep' },
];

const RECENT = ['LA', 'Sunset mix', 'Budget', 'Slate'];

const BROWSE: Array<{ label: string; thumb: Thumb; query: string; background: string }> = [
  { label: 'Photos', thumb: { src: '/phone/city.webp', photo: true }, query: 'photos', background: 'linear-gradient(140deg, #ffb35c, #ff7a45)' },
  { label: 'Music', thumb: { src: '/phone/night.webp' }, query: 'mix', background: 'linear-gradient(140deg, #ff7cba, #d63384)' },
  { label: 'Mood boards', thumb: { src: '/phone/shape.webp' }, query: 'mood', background: 'linear-gradient(140deg, #8c8cff, #5650e0)' },
];

/** Everything the search can find, besides the palettes themselves. */
const INDEX = [
  ...ROWS.map((row) => ({ thumb: row.thumb, title: row.title, meta: row.text })),
  ...ARCHIVED.map((item) => ({ thumb: item.thumb, title: item.title, meta: `Archived · ${item.meta}` })),
];

function Row({ thumb, title, meta, action }: { thumb: Thumb; title: string; meta: string; action?: ReactNode }) {
  return (
    <li className="page__row">
      <Avatar thumb={thumb} className="page__icon" />
      <span className="home__text">
        <strong>{title}</strong>
        <span>{meta}</span>
      </span>
      {action}
    </li>
  );
}

/** Saved palettes up top, then archived items that can be restored. */
export function ArchivePage({ cards }: { cards: ReactNode[] }) {
  const [restored, setRestored] = useState<string[]>([]);
  const items = ARCHIVED.filter((item) => !restored.includes(item.title));
  const groups = [...new Set(items.map((item) => item.group))];
  return (
    <div className="page">
      <h3 className="page__heading">Saved palettes <span>{cards.length}</span></h3>
      {cards.length ? <div className="mock__grid">{cards}</div> : <p className="page__empty">Save a palette and it shows up here.</p>}
      {groups.map((group) => (
        <section key={group}>
          <h3 className="page__heading">{group}</h3>
          <ul className="page__list">
            {items.filter((item) => item.group === group).map((item) => (
              <Row
                key={item.title}
                {...item}
                action={
                  <GlassButton size="sm" onClick={() => setRestored((list) => [...list, item.title])} aria-label={`Restore ${item.title}`}>
                    Restore
                  </GlassButton>
                }
              />
            ))}
          </ul>
        </section>
      ))}
      {!items.length && <p className="page__empty">Everything's been restored.</p>}
    </div>
  );
}

/** Recent searches and a browse grid; typing searches palettes and activity. */
export function SearchPage({ query, onQuery, onClose, inputRef, paletteCards }: {
  query: string;
  onQuery: (value: string) => void;
  onClose: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
  paletteCards: ReactNode[];
}) {
  const q = query.trim().toLowerCase();
  const hits = q ? INDEX.filter((item) => `${item.title} ${item.meta}`.toLowerCase().includes(q)) : [];
  return (
    <div className="page">
      <div className="mock__search">
        <GlassInput ref={inputRef} type="search" placeholder="Search everything" aria-label="Search everything" value={query} onChange={(event) => onQuery(event.target.value)} />
        <GlassButton size="sm" icon={<Close size={16} />} aria-label="Close search" onClick={onClose} />
      </div>
      {!q ? <>
        <h3 className="page__heading">Recent</h3>
        <div className="page__chips">
          {RECENT.map((term) => <GlassButton key={term} size="sm" onClick={() => onQuery(term)}>{term}</GlassButton>)}
        </div>
        <h3 className="page__heading">Browse</h3>
        <div className="page__browse">
          {BROWSE.map((item) => (
            <button key={item.label} type="button" className="page__tile" style={{ background: item.background }} onClick={() => onQuery(item.query)}>
              <Avatar thumb={item.thumb} className="page__tile-art" />
              <strong>{item.label}</strong>
            </button>
          ))}
        </div>
      </> : <>
        {paletteCards.length > 0 && <>
          <h3 className="page__heading">Palettes</h3>
          <div className="mock__grid">{paletteCards}</div>
        </>}
        {hits.length > 0 && <>
          <h3 className="page__heading">Everything else</h3>
          <ul className="page__list">{hits.map((item) => <Row key={item.title} {...item} />)}</ul>
        </>}
        {!paletteCards.length && !hits.length && <p className="page__empty">No results for “{query.trim()}”</p>}
      </>}
    </div>
  );
}
