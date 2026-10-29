'use client';

import { useState, type CSSProperties } from 'react';

/** Widget artwork, shown as-is in the grid. */
const Picture = ({ src, label }: { src: string; label: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img className="home__widget home__widget--picture" src={src} alt={label} decoding="async" />
);

// Tapping the palette opens it in Studio.
const Palette = ({ artwork, name, onOpen }: { artwork?: CSSProperties; name: string; onOpen?: () => void }) => (
  <button type="button" className="home__widget home__widget--palette" style={artwork} onClick={onOpen} aria-label={`Edit ${name} palette`}>
    <span className="home__label">Palette</span>
    <strong className="home__value">{name}</strong>
    <span className="home__chips" aria-hidden="true">
      <span /><span /><span />
    </span>
  </button>
);

/** `photo` images are cropped round and `round` icons clipped to a circle;
 *  other icon artwork is shown whole. */
export type Thumb = { src: string; photo?: boolean; round?: boolean };

export const ROWS: Array<{ thumb: Thumb; title: string; text: string; time: string; unread: boolean }> = [
  { thumb: { src: '/phone/mia.webp', photo: true }, title: 'Mia', text: 'Found a place by the fort', time: '2m', unread: true },
  { thumb: { src: '/phone/night.webp' }, title: 'Weekends', text: 'Ava voted for karaoke. Again.', time: '20m', unread: true },
  { thumb: { src: '/phone/popcorn.webp' }, title: 'Movie night', text: 'Ava: Past Lives. Your place?', time: '1h', unread: false },
  { thumb: { src: '/phone/city.webp', photo: true }, title: 'Weekend in Galle', text: '3 spots saved for Saturday', time: '3h', unread: false },
  { thumb: { src: '/phone/sync.webp', round: true }, title: 'Bills & Subscriptions', text: 'Your phone bill is sorted.', time: '5h', unread: false },
];

export function Avatar({ thumb, className = 'home__avatar' }: { thumb: Thumb; className?: string }) {
  return (
    <span className={className} data-photo={thumb.photo ? '' : undefined} data-round={thumb.round ? '' : undefined} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumb.src} alt="" decoding="async" />
    </span>
  );
}

/**
 * The phone's home: two rows of widgets, the third column cut off by the
 * screen edge, then an activity list that fades out at the bottom.
 */
export function HomeFeed({ artwork = { backgroundColor: '#5a768f' }, paletteName = 'Slate', onOpenPalette }: {
  artwork?: CSSProperties;
  paletteName?: string;
  onOpenPalette?: () => void;
}) {
  const [read, setRead] = useState<string[]>([]);
  return (
    <div className="home">
      <div className="home__grid">
        <Picture src="/phone/widgets/focus.webp" label="Focus timer, 45 minutes" />
        <Picture src="/phone/widgets/birthday.webp" label="Mia's birthday, March 20" />
        <Picture src="/phone/widgets/calories.webp" label="1,847 calories burned today" />
        <Palette artwork={artwork} name={paletteName} onOpen={onOpenPalette} />
        <Picture src="/phone/widgets/next-up.webp" label="Next up: a first look with the team" />
        <Picture src="/phone/widgets/recording.webp" label="Recording, 2 hours 30 minutes" />
      </div>
      <ul className="home__list">
        {ROWS.map((row) => {
          const unread = row.unread && !read.includes(row.title);
          return (
            <li key={row.title}>
              <button type="button" onClick={() => setRead((list) => [...list, row.title])}>
                <Avatar thumb={row.thumb} />
                <span className="home__text">
                  <strong>{row.title}</strong>
                  <span data-unread={unread ? '' : undefined}>{row.text}</span>
                </span>
                <span className="home__time">
                  {unread && <span className="home__dot" aria-label="Unread" />}
                  {row.time}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
