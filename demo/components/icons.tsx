import React from 'react';
import { Symbol } from '../../src/components/internal/Symbol';

type P = { size?: number } & React.HTMLAttributes<HTMLSpanElement>;

// Phosphor Icons (MIT), kept as local SVG masks so colour follows the UI.
export const Home = (props: P) => <Symbol source="/icons/house-fill.svg" {...props} />;
export const Grid = (props: P) => <Symbol source="/icons/squares-four-fill.svg" {...props} />;
export const Note = (props: P) => <Symbol source="/icons/music-note-fill.svg" {...props} />;
export const Search = (props: P) => <Symbol source="/icons/magnifying-glass-bold.svg" {...props} />;
export const Person = (props: P) => <Symbol source="/icons/user-circle-fill.svg" {...props} />;
export const Menu = (props: P) => <Symbol source="/icons/list-bold.svg" {...props} />;
export const Plus = (props: P) => <Symbol source="/icons/plus-bold.svg" {...props} />;
export const Ellipsis = (props: P) => <Symbol source="/icons/dots-three-bold.svg" {...props} />;
export const Heart = (props: P) => <Symbol source="/icons/heart-bold.svg" {...props} />;
export const Share = (props: P) => <Symbol source="/icons/export-bold.svg" {...props} />;
export const Mic = (props: P) => <Symbol source="/icons/microphone-fill.svg" {...props} />;
export const Sun = (props: P) => <Symbol source="/icons/sun-fill.svg" {...props} />;
export const Moon = (props: P) => <Symbol source="/icons/moon-fill.svg" {...props} />;
export const Speaker = (props: P) => <Symbol source="/icons/speaker-high-fill.svg" {...props} />;
export const Wifi = (props: P) => <Symbol source="/icons/wifi-high-bold.svg" {...props} />;
export const Plane = (props: P) => <Symbol source="/icons/airplane-fill.svg" {...props} />;
export const Bolt = (props: P) => <Symbol source="/icons/lightning-fill.svg" {...props} />;
export const Play = (props: P) => <Symbol source="/icons/play-fill.svg" {...props} />;
export const Copy = (props: P) => <Symbol source="/icons/copy-bold.svg" {...props} />;
export const Check = (props: P) => <Symbol source="/icons/check-bold.svg" {...props} />;
export const ArrowUpRight = (props: P) => <Symbol source="/icons/arrow-up-right-bold.svg" {...props} />;
/** Inline icons drawn in the text colour, for brand marks and the docs book. */
const Inline = ({ size = 16, viewBox, children, ...props }: P & { viewBox: string; children: React.ReactNode }) => (
  <span aria-hidden="true" {...props} style={{ display: 'inline-flex', width: size, height: size, ...props.style }}>
    <svg viewBox={viewBox} width={size} height={size} fill="currentColor">{children}</svg>
  </span>
);

// npm's own mark: the "n" cut from a square.
export const Npm = (props: P) => (
  <Inline viewBox="0 0 16 16" {...props}>
    <path d="M0 0v16h16V0H0zm13 13h-2.5V5.5H8V13H3V3h10v10z" />
  </Inline>
);

// An open book, for documentation.
export const Docs = (props: P) => (
  <Inline viewBox="0 0 16 16" {...props}>
    <path d="M1 2.6C2.6 1.9 4.9 1.8 7.25 3v10.6C5 12.5 2.8 12.6 1 13.3V2.6zm14 0c-1.6-.7-3.9-.8-6.25.4v10.6c2.25-1.1 4.45-1 6.25-.3V2.6z" />
  </Inline>
);

// GitHub's own mark, drawn in the text colour.
export const GitHub = ({ size = 16, ...props }: P) => (
  <span aria-hidden="true" {...props} style={{ display: 'inline-flex', width: size, height: size, ...props.style }}>
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  </span>
);
export const Drop = (props: P) => <Symbol source="/icons/drop-fill.svg" {...props} />;
export const Sparkle = (props: P) => <Symbol source="/icons/sparkle-fill.svg" {...props} />;
export const Cellular = (props: P) => <Symbol source="/icons/cell-signal-full-fill.svg" {...props} />;
export const Battery = (props: P) => <Symbol source="/icons/battery-full-fill.svg" {...props} />;
export const Compass = (props: P) => <Symbol source="/icons/compass-fill.svg" {...props} />;
export const Bookmark = (props: P) => <Symbol source="/icons/bookmark-simple-fill.svg" {...props} />;
export const Suitcase = (props: P) => <Symbol source="/icons/suitcase-rolling-fill.svg" {...props} />;
export const Pin = (props: P) => <Symbol source="/icons/map-pin-fill.svg" {...props} />;
export const ArrowRight = (props: P) => <Symbol source="/icons/arrow-right-bold.svg" {...props} />;
export const Close = (props: P) => <Symbol source="/icons/x-bold.svg" {...props} />;
export const Star = (props: P) => <Symbol source="/icons/star-fill.svg" {...props} />;
export const MapIcon = (props: P) => <Symbol source="/icons/map-trifold-fill.svg" {...props} />;
export const HeartFill = (props: P) => <Symbol source="/icons/heart-fill.svg" {...props} />;

export const ArrowLeft = (props: P) => <Symbol source="/icons/arrow-left-bold.svg" {...props} />;
