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
| `GlassButton` | Pill or circle (`icon` with no children). Swells, leans toward a drag, wobbles on release. |
| `GlassSwitch` | The knob lifts into a clear lens that refracts the track. Tap, or drag with rubber-banding. |
| `GlassNav` | Floating tab bar. The selection inflates into a lens you can drag across tabs. |
| `GlassSegmented` | Segmented control. The whole control swells and the selection becomes a draggable lens. |
| `GlassSlider` | Thin track with a lens thumb that magnifies the rail, or `showThumb={false}` for a Control Center block. |
| `GlassInput` | Search / text field with icon, trailing accessory and clear button. |
| `GlassCard` | Refracting panel, `regular` or `clear`. |
| `GlassSheet` | Floating bottom sheet. Spring entrance, drag or flick to dismiss. |

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

<GlassSegmented options={['Chat', 'Work']} value={mode} onChange={setMode} />
<GlassSegmented size="sm" options={[{ label: 'Light', icon: <SunIcon /> }, 'Dark']} value={t} onChange={setT} />

<GlassSlider value={volume} onChange={setVolume} />
<GlassSlider showThumb={false} value={brightness} onChange={setBrightness} icon={<SunIcon />} label="Display" />

<GlassInput type="search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} trailing={<MicIcon />} />

<GlassCard padding="20px" radius="28px">…</GlassCard>
<GlassCard variant="clear">…</GlassCard>

<GlassSheet open={open} onClose={() => setOpen(false)} aria-label="Details">…</GlassSheet>
```

### Props reference

| Component | Props |
| --- | --- |
| `GlassButton` | `variant` (`glass` · `clear` · `tinted` · `filled`), `destructive`, `tint`, `size`, `icon`, `shimmer`, `intensity`, `thickness`, plus all `<button>` props |
| `GlassSwitch` | `checked`, `defaultChecked`, `onChange(checked)`, `tint`, `disabled`, `intensity` |
| `GlassNav` | `items: { label, icon? }[]`, `activeIndex`, `onChange(index)`, `intensity` |
| `GlassSegmented` | `options: (string \| { label, icon? })[]`, `value`, `onChange(index)`, `size` (`sm` · `md`), `intensity` |
| `GlassSlider` | `value`, `min`, `max`, `step`, `onChange(value)`, `showThumb`, `icon`, `label`, `tint`, `intensity` |
| `GlassInput` | `type`, `value`, `onChange(event)`, `placeholder`, `label`, `icon`, `trailing`, `onClear`, `tint`, `intensity` |
| `GlassCard` | `variant` (`regular` · `clear`), `padding`, `radius`, `tint`, `thickness`, `intensity` |
| `GlassSheet` | `open`, `onClose()`, `tint`, `aria-label`, `intensity` |

`intensity` (1–10) scales refraction strength everywhere.

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

- **Chrome / Edge / Arc:** live refraction of anything behind the glass through `backdrop-filter: url(#svg)`.
- **Safari:** lenses (switch, slider, tab bar, segmented) refract a live copy of the content beneath them, including magnification and the colour split. Bars, buttons and cards over arbitrary page content get frosting, rims and motion.
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
