# <div align="center">@zakisheriff/liquid-glass</div>

<div align="center">
<strong>Real, refracting Liquid Glass for React.</strong>
<br />
<br />

![React](https://img.shields.io/badge/React-%3E%3D17-61dafb?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**[liquidglass.theatom.lk](https://liquidglass.theatom.lk)** ·
**[npm](https://www.npmjs.com/package/@zakisheriff/liquid-glass)** ·
**[GitHub](https://github.com/zakisheriff/Liquid-Glass)**

</div>

---

Glass that bends light rather than just blurring it. Every surface ray-traces its own Snell's-law refraction map through a curved bevel. Lenses magnify and split colour at the rim. Every touch swells, stretches and settles with a jelly wobble, tuned frame by frame against iOS 26 screen recordings.

## Install

```bash
npm i @zakisheriff/liquid-glass
```

```tsx
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
| `GlassButton` | Pill or circle (`icon` with no children). Swells, leans toward a drag, wobbles on release. Variants `default`, `clear`, `filled`, `destructive`. |
| `GlassSwitch` | The knob lifts into a clear lens that refracts the track. Tap, or drag with rubber-banding. |
| `GlassNav` | Floating tab bar. The selection inflates into a lens you can drag across tabs. |
| `GlassSegmented` | Segmented control. The whole control swells and the selection becomes a draggable lens. |
| `GlassSlider` | Thin track with a lens thumb, or `showThumb={false}` for a Control Center block that stretches past its ends. |
| `GlassInput` | Search / text field with icon, trailing accessory and clear button. |
| `GlassCard` | Refracting panel, `regular` or `clear`. |
| `GlassSheet` | Floating bottom sheet. Spring entrance, drag or flick to dismiss. |

```tsx
<GlassNav
  activeIndex={tab}
  onChange={setTab}
  items={[
    { label: 'Home', icon: <HomeIcon /> },
    { label: 'Library', icon: <LibraryIcon /> },
  ]}
/>

<GlassSegmented options={['Chat', 'Work']} value={mode} onChange={setMode} />

<GlassSlider value={volume} onChange={setVolume} />
<GlassSlider showThumb={false} value={brightness} onChange={setBrightness} icon={<SunIcon />} label="Display" />

<GlassButton icon={<PlusIcon />} aria-label="Add" />
<GlassButton variant="filled">Continue</GlassButton>
```

Most components accept `intensity` (1–10 refraction strength) and `tint`.

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

- **Chrome / Edge / Arc:** full live refraction of the backdrop through `backdrop-filter: url(#svg)`.
- **Safari / Firefox:** the same shapes, motion, specular rims and frosting, without live backdrop displacement.
- Respects `prefers-reduced-motion` and `prefers-reduced-transparency`.

## Develop

```bash
npm install
npm run site        # Next.js landing page at localhost:3000, renders straight from src/
npm run build       # library → dist/
```

## License

MIT © Zaki Sheriff. Not affiliated with Apple Inc.
