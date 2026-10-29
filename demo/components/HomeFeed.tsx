'use client';

import { useState } from 'react';

/** Widget artwork, shown as-is in the grid. */
const Picture = ({ src, label }: { src: string; label: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img className="home__widget home__widget--picture" src={src} alt={label} decoding="async" />
);

// Today's move goal as three rings, drawn rather than shipped as artwork.
const RINGS = [
  { r: 38, done: 0.82, color: '#ff5a1f' },
  { r: 28, done: 0.64, color: '#1d1d1f' },
  { r: 18, done: 0.9, color: '#ff5a1f' },
];

const Rings = () => (
  <div className="home__widget home__widget--rings" role="img" aria-label="8,240 steps today, 82% of goal">
    <svg viewBox="0 0 100 100" aria-hidden="true">
      {RINGS.map(({ r, done, color }) => {
        const length = 2 * Math.PI * r;
        return (
          <g key={r}>
            <circle cx="50" cy="50" r={r} className="home__ring-track" />
            <circle cx="50" cy="50" r={r} stroke={color} strokeDasharray={`${(length * done).toFixed(2)} ${length.toFixed(2)}`} />
          </g>
        );
      })}
    </svg>
    <span className="home__rings-label" aria-hidden="true">8,240 steps</span>
  </div>
);

// A photo album widget: the cover fills the tile, captioned over a scrim.
const Album = () => (
  <div className="home__widget home__widget--album" role="img" aria-label="Galle album, 18 photos">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/phone/city.webp" alt="" decoding="async" aria-hidden="true" />
    <strong className="home__value">Galle</strong>
    <span className="home__label">18 photos</span>
  </div>
);

/** `photo` images are cropped round and `round` icons clipped to a circle;
 *  other icon artwork is shown whole. */
export type Thumb = { src: string; photo?: boolean; round?: boolean };

export const ROWS: Array<{ thumb: Thumb; title: string; text: string; time: string; unread: boolean }> = [
  { thumb: { src: '/phone/mia.webp', photo: true }, title: 'Lena', text: 'Whassup? Free tonight?', time: '2m', unread: true },
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
export function HomeFeed() {
  const [read, setRead] = useState<string[]>([]);
  return (
    <div className="home">
      <div className="home__grid">
        <Picture src="/phone/widgets/focus.webp" label="Focus timer, 45 minutes" />
        <Rings />
        <Picture src="/phone/widgets/calories.webp" label="1,847 calories burned today" />
        <Album />
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
