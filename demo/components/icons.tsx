import React from 'react';
import { Symbol } from '../../src/components/internal/Symbol';

type P = { size?: number } & React.HTMLAttributes<HTMLSpanElement>;

// Official Apple SF Symbols, kept as local masks so colour follows the UI.
export const Home = (props: P) => <Symbol source="/symbols/house.fill.png" {...props} />;
export const Grid = (props: P) => <Symbol source="/symbols/square.grid.2x2.fill.png" {...props} />;
export const Note = (props: P) => <Symbol source="/symbols/music.note.png" {...props} />;
export const Search = (props: P) => <Symbol source="/symbols/magnifyingglass.png" {...props} />;
export const Person = (props: P) => <Symbol source="/symbols/person.crop.circle.fill.png" {...props} />;
export const Menu = (props: P) => <Symbol source="/symbols/line.3.horizontal.png" {...props} />;
export const Plus = (props: P) => <Symbol source="/symbols/plus.png" {...props} />;
export const Ellipsis = (props: P) => <Symbol source="/symbols/ellipsis.png" {...props} />;
export const Heart = (props: P) => <Symbol source="/symbols/heart.png" {...props} />;
export const Share = (props: P) => <Symbol source="/symbols/square.and.arrow.up.png" {...props} />;
export const Mic = (props: P) => <Symbol source="/symbols/mic.fill.png" {...props} />;
export const Sun = (props: P) => <Symbol source="/symbols/sun.max.fill.png" {...props} />;
export const Moon = (props: P) => <Symbol source="/symbols/moon.fill.png" {...props} />;
export const Speaker = (props: P) => <Symbol source="/symbols/speaker.wave.2.fill.png" {...props} />;
export const Wifi = (props: P) => <Symbol source="/symbols/wifi.png" {...props} />;
export const Plane = (props: P) => <Symbol source="/symbols/airplane.png" {...props} />;
export const Bolt = (props: P) => <Symbol source="/symbols/bolt.fill.png" {...props} />;
export const Play = (props: P) => <Symbol source="/symbols/play.fill.png" {...props} />;
export const Copy = (props: P) => <Symbol source="/symbols/doc.on.doc.png" {...props} />;
export const Check = (props: P) => <Symbol source="/symbols/checkmark.png" {...props} />;
export const ArrowUpRight = (props: P) => <Symbol source="/symbols/arrow.up.right.png" {...props} />;
// GitHub's own mark (no SF Symbol exists for it), drawn in the text colour.
export const GitHub = ({ size = 16, ...props }: P) => (
  <span aria-hidden="true" {...props} style={{ display: 'inline-flex', width: size, height: size, ...props.style }}>
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  </span>
);
export const Drop = (props: P) => <Symbol source="/symbols/drop.fill.png" {...props} />;
export const Sparkle = (props: P) => <Symbol source="/symbols/sparkles.png" {...props} />;
export const Cellular = (props: P) => <Symbol source="/symbols/cellularbars.png" {...props} />;
export const Battery = (props: P) => <Symbol source="/symbols/battery.100.png" {...props} />;
export const Compass = (props: P) => <Symbol source="/symbols/safari.fill.png" {...props} />;
export const Bookmark = (props: P) => <Symbol source="/symbols/bookmark.fill.png" {...props} />;
export const Suitcase = (props: P) => <Symbol source="/symbols/suitcase.rolling.fill.png" {...props} />;
export const Pin = (props: P) => <Symbol source="/symbols/mappin.and.ellipse.png" {...props} />;
export const ArrowRight = (props: P) => <Symbol source="/symbols/arrow.right.png" {...props} />;
export const Close = (props: P) => <Symbol source="/symbols/xmark.png" {...props} />;
export const Star = (props: P) => <Symbol source="/symbols/star.fill.png" {...props} />;
export const MapIcon = (props: P) => <Symbol source="/symbols/map.fill.png" {...props} />;
export const HeartFill = (props: P) => <Symbol source="/symbols/heart.fill.png" {...props} />;

export const ArrowLeft = (props: P) => <Symbol source="/symbols/arrow.left.png" {...props} />;
