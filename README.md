# <div align="center">@zakisheriff/liquid-glass</div>

<div align="center">
<strong>Real, refracting Liquid Glass for React.</strong>
<br />
<br />

[![npm version](https://img.shields.io/npm/v/@zakisheriff/liquid-glass?style=for-the-badge&logo=npm&color=cb3837)](https://www.npmjs.com/package/@zakisheriff/liquid-glass)
[![Total npm downloads](https://badgen.net/npm/dt/@zakisheriff/liquid-glass?label=total%20downloads&color=0a84ff&scale=1.25)](https://www.npmjs.com/package/@zakisheriff/liquid-glass)
[![Bundle size](https://img.shields.io/badge/gzip-36_kB-30d158?style=for-the-badge)](https://www.npmjs.com/package/@zakisheriff/liquid-glass?activeTab=code)
[![Zero dependencies](https://img.shields.io/badge/dependencies-0-30d158?style=for-the-badge)](https://www.npmjs.com/package/@zakisheriff/liquid-glass?activeTab=dependencies)
<br />
![React](https://img.shields.io/badge/React-%3E%3D17-61dafb?style=for-the-badge&logo=react&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-ready-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

<br />

[![Live demo](https://img.shields.io/badge/Live_demo-liquidglass.theatom.lk-0a84ff?style=for-the-badge&logo=safari&logoColor=white)](https://liquidglass.theatom.lk)
[![Docs](https://img.shields.io/badge/Docs-read-1d1d1f?style=for-the-badge&logo=readthedocs&logoColor=white)](https://liquidglass.theatom.lk/docs)
[![npm](https://img.shields.io/badge/npm-install-cb3837?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/@zakisheriff/liquid-glass)
[![GitHub](https://img.shields.io/badge/GitHub-star-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/zakisheriff/Liquid-Glass)

</div>

---

Glass that bends light rather than just blurring it. Every surface ray-traces its own Snell's-law refraction map through a curved bevel. Lenses magnify and split colour at the rim. Every touch swells, stretches and settles with a jelly wobble, tuned frame by frame against iOS 26 screen recordings.

## Install

```bash
npm i @zakisheriff/liquid-glass
```

```tsx
import { useState } from 'react';
import { GlassSwitch } from '@zakisheriff/liquid-glass';
import '@zakisheriff/liquid-glass/styles.css';

export function Settings() {
  const [on, setOn] = useState(true);
  return <GlassSwitch checked={on} onChange={setOn} aria-label="Wi-Fi" />;
}
```

Works with Next.js (the bundle is marked `"use client"`), Vite and CRA.

## Components

| Component | What it does |
| --- | --- |
| `GlassButton` | Pill or circle (`icon` with no children). Swells, leans toward a drag, wobbles on release. |
| `GlassSwitch` | The knob lifts into a clear lens that refracts the track. Tap, or drag with rubber-banding. |
| `GlassNav` | Floating tab bar. The selection inflates into a lens you can drag across tabs. Icons with labels, or icons only. |
| `GlassSegmented` | Segmented control. The whole control swells and the selection becomes a draggable lens. |
| `GlassSlider` | Thin track with a lens thumb that magnifies the rail, or `showThumb={false}` for a Control Center block. |
| `GlassInput` | Search / text field with icon, trailing accessory and clear button. |
| `GlassCard` | Refracting panel, `regular` or `clear`. |
| `GlassMenu` | Pull-down menu that grows out of its glass button and folds back into it. Slide a finger across the items to pick one. |
| `GlassSheet` | Floating bottom sheet. Spring entrance, drag or flick to dismiss. With `detents` it opens at half height and expands to full screen. |

### Buttons

| Look | Code |
| --- | --- |
| Glass | `<GlassButton>Glass</GlassButton>` |
| Filled | `<GlassButton variant="filled">Filled</GlassButton>` |
| Tinted | `<GlassButton variant="tinted">Tinted</GlassButton>` |
| Tinted filled | `<GlassButton variant="filled" tint="#af52de">Tinted filled</GlassButton>` |
| Clear | `<GlassButton variant="clear">Clear</GlassButton>` |
| Destructive | `<GlassButton destructive>Delete</GlassButton>` |
| Destructive filled | `<GlassButton variant="filled" destructive>Delete</GlassButton>` |
| Icon circle | `<GlassButton icon={<PlusIcon />} aria-label="Add" />` |

`tint` takes any CSS colour: it colours the label for `tinted` and the fill for `filled`. Sizes: `size="sm" | "md" | "lg"` (36 / 44 / 52 px).

### Everything else

```tsx
<GlassSwitch checked={on} onChange={setOn} aria-label="Wi-Fi" />
<GlassSwitch checked={on} onChange={setOn} tint="#ff9f0a" aria-label="Focus" />

<GlassNav
  activeIndex={tab}
  onChange={setTab}
  items={[
    { label: 'Home', icon: <HomeIcon /> },
    { label: 'Library', icon: <LibraryIcon /> },
  ]}
/>

<GlassNav showLabels={false} activeIndex={tab} onChange={setTab} items={tabs} />

<GlassMenu
  icon={<EllipsisIcon />}
  aria-label="More"
  items={[
    { label: 'View as Gallery', icon: <GridIcon />, checked: view === 'gallery', onSelect: () => setView('gallery') },
    { label: 'Delete', destructive: true, onSelect: remove },
  ]}
/>

<GlassSegmented options={['Chat', 'Work']} value={mode} onChange={setMode} />
<GlassSegmented size="sm" options={[{ label: 'Light', icon: <SunIcon /> }, 'Dark']} value={t} onChange={setT} />

<GlassSlider value={volume} onChange={setVolume} />
<GlassSlider showThumb={false} value={brightness} onChange={setBrightness} icon={<SunIcon />} label="Display" />

<GlassInput type="search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} trailing={<MicIcon />} />

<GlassCard padding="20px" radius="28px">…</GlassCard>
<GlassCard variant="clear">…</GlassCard>

<GlassSheet open={open} onClose={() => setOpen(false)} aria-label="Details">…</GlassSheet>
<GlassSheet open={open} onClose={() => setOpen(false)} detents={['medium', 'large']} aria-label="Details">…</GlassSheet>
```

Sliders drag continuously by default (`step="any"`). Pass a numeric `step`, such as `step={5}`, when values should snap to fixed increments. `onChange` receives the full-precision value while block labels show a rounded number.

Pass a positioned element as a sheet's `container` to keep the sheet inside that element without locking page scrolling. Sheets use the full viewport by default.

### Props reference

| Component | Props |
| --- | --- |
| `GlassButton` | `variant` (`glass` · `clear` · `tinted` · `filled`), `destructive`, `tint`, `size`, `icon`, `shimmer`, `intensity`, `thickness`, plus all `<button>` props |
| `GlassSwitch` | `checked`, `defaultChecked`, `onChange(checked)`, `tint`, `disabled`, `intensity` |
| `GlassNav` | `items: { label, icon? }[]`, `activeIndex`, `onChange(index)`, `showLabels`, `intensity` |
| `GlassMenu` | `icon`, `items: { label, icon?, checked?, destructive?, disabled?, onSelect? }[]`, `aria-label`, `align` (`end` · `start`), `size`, `width`, `check` |
| `GlassSegmented` | `options: (string \| { label, icon? })[]`, `value`, `onChange(index)`, `size` (`sm` · `md`), `intensity` |
| `GlassSlider` | `value`, `min`, `max`, `step`, `onChange(value)`, `showThumb`, `icon`, `label`, `tint`, `intensity` |
| `GlassInput` | `type`, `value`, `onChange(event)`, `placeholder`, `label`, `icon`, `trailing`, `onClear`, `tint`, `intensity` |
| `GlassCard` | `variant` (`regular` · `clear`), `padding`, `radius`, `tint`, `thickness`, `intensity` |
| `GlassSheet` | `open`, `onClose()`, `detents` (`['medium', 'large']`), `container`, `tint`, `aria-label`, `intensity` |

`intensity` (1–10) scales refraction strength everywhere.

## Lightweight

About **31 KB of JavaScript and 5.5 KB of CSS gzipped**, with **no runtime dependencies** (React and React DOM are peers).

- Refraction maps are computed once per glass size, cached and shared, then drawn by the browser. Nothing is recalculated while you scroll.
- Springs run on one shared animation frame loop and stop when they settle.
- Lens copies only copy and lay out content while a control is pressed, and stop entirely off screen.
- The demo page, with 99 glass elements, holds about 11 MB of JavaScript memory and renders at 60 fps in Chrome.

The GPU cost is in what moves *under* the glass. Keep large refracting panels over static or slow content, prefer a few large glass surfaces over many small overlapping ones, and lower `intensity` (or use `GlassCard variant="clear"`) for low-end devices.

## Light and dark

Tokens follow `prefers-color-scheme`. To force a theme, set `data-theme="light"` or `data-theme="dark"` on any ancestor. Override any `--lg-*` variable to restyle, e.g. `--lg-accent`, `--lg-fill` or `--lg-blur`.

## Build your own glass

```tsx
import { useRefraction, usePress } from '@zakisheriff/liquid-glass';

function Droplet() {
  const ref = useRef<HTMLDivElement>(null);
  useRefraction(ref, { kind: 'lens', zoom: 1.3, dispersion: 1 });
  usePress(ref);
  return <div ref={ref} className="lg-glass" style={{ width: 240, height: 160, borderRadius: 999 }} />;
}
```

`createSpring`, `SPRINGS` and `haptic()` are exported too.

## Browser support

- **Chrome / Edge / Arc:** live refraction of anything behind the glass through `backdrop-filter: url(#svg)`. Tab and segmented lenses refract a tinted live copy of the bar, so everything inside the lens takes the active colour.
- **Safari:** lenses (switch, slider, tab bar, segmented) show a magnified live copy of the content beneath them. Bars, buttons and cards over arbitrary page content get frosting, rims and motion.
- **Firefox:** uses the same path as Safari; not yet tested.
- Respects `prefers-reduced-motion` and `prefers-reduced-transparency`.

## Develop

```bash
npm install
npm run site        # Next.js landing page at localhost:3000, renders straight from src/
npm run build       # library → dist/
```

## License

MIT © Zaki Sheriff. Not affiliated with Apple Inc.
