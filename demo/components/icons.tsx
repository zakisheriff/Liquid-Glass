import React from 'react';

type P = { size?: number } & React.SVGProps<SVGSVGElement>;

const base = (size = 24) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

export const Home = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3.5 10.5 12 3.8l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.2v-5.8H9.2v5.8H5A1.5 1.5 0 0 1 3.5 19z" fill="currentColor" stroke="none" />
  </svg>
);
export const Grid = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    {[4, 13.5].map((x) => [4, 13.5].map((y) => <rect key={`${x}${y}`} x={x} y={y} width="6.5" height="6.5" rx="2" fill="currentColor" stroke="none" />))}
  </svg>
);
export const Note = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M9 18V6l11-2v12" />
    <circle cx="6.5" cy="18" r="2.6" fill="currentColor" />
    <circle cx="17.5" cy="16" r="2.6" fill="currentColor" />
  </svg>
);
export const Search = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2.2}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 4.5 4.5" />
  </svg>
);
export const Person = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="9.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="9.6" r="3.3" fill="var(--icon-cut, #fff)" stroke="none" />
    <path d="M6.6 18.2c1.2-2.3 3.2-3.5 5.4-3.5s4.2 1.2 5.4 3.5" stroke="var(--icon-cut, #fff)" strokeWidth={2.4} />
  </svg>
);
export const Menu = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2}>
    <path d="M4 7h16M4 12h10M4 17h16" />
  </svg>
);
export const Plus = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2.2}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const Ellipsis = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    {[6, 12, 18].map((x) => (
      <circle key={x} cx={x} cy="12" r="1.7" fill="currentColor" stroke="none" />
    ))}
  </svg>
);
export const Heart = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 20s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20z" />
  </svg>
);
export const Share = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3.5v11M8 7.5l4-4 4 4M7 11H6a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 18 11h-1" />
  </svg>
);
export const Mic = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
  </svg>
);
export const Sun = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </svg>
);
export const Moon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M19.5 14.8A8 8 0 0 1 9.2 4.5a8 8 0 1 0 10.3 10.3z" fill="currentColor" stroke="none" />
  </svg>
);
export const Speaker = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" stroke="none" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);
export const Wifi = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2.1}>
    <path d="M2.5 9a14 14 0 0 1 19 0M5.8 12.5a9.2 9.2 0 0 1 12.4 0M9.1 15.9a4.4 4.4 0 0 1 5.8 0" />
    <circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);
export const Plane = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M21 15.5v-2l-7.5-4.5V4a1.5 1.5 0 0 0-3 0v5L3 13.5v2l7.5-2.3V18l-2 1.5v1.5l3.5-1 3.5 1v-1.5l-2-1.5v-4.8z" fill="currentColor" stroke="none" />
  </svg>
);
export const Bolt = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z" fill="currentColor" stroke="none" />
  </svg>
);
export const Play = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M7 4.8v14.4a1 1 0 0 0 1.5.9l11.3-7.2a1 1 0 0 0 0-1.7L8.5 3.9A1 1 0 0 0 7 4.8z" fill="currentColor" stroke="none" />
  </svg>
);
export const Copy = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
    <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
  </svg>
);
export const Check = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2.4}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const ArrowUpRight = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2}>
    <path d="M7 17 17 7M8.5 7H17v8.5" />
  </svg>
);
export const GitHub = ({ size, ...p }: P) => (
  <svg width={size ?? 24} height={size ?? 24} viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path
      fill="currentColor"
      d="M12 1.8a10.2 10.2 0 0 0-3.2 19.9c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.4 1.1 3 .8.1-.7.4-1.1.6-1.4-2.3-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .9-.3 2.8 1a9.6 9.6 0 0 1 5.1 0c1.9-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10.2 10.2 0 0 0 12 1.8z"
    />
  </svg>
);
export const Drop = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3.2s-6.5 7-6.5 11.3a6.5 6.5 0 0 0 13 0C18.5 10.2 12 3.2 12 3.2z" fill="currentColor" stroke="none" />
  </svg>
);
export const Sparkle = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5z" fill="currentColor" stroke="none" />
    <path d="M18.5 15.5c.2 1.4.9 2.1 2.3 2.3-1.4.2-2.1.9-2.3 2.3-.2-1.4-.9-2.1-2.3-2.3 1.4-.2 2.1-.9 2.3-2.3z" fill="currentColor" stroke="none" />
  </svg>
);
