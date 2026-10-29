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

<br />
<br />

<a href="https://liquidglass.theatom.lk/docs#demo"><img src="https://liquidglass.theatom.lk/video/demo-poster.jpg" alt="Liquid Glass demo: buttons, sliders, switches, tab bar, menu and sheet in motion. Click to watch." width="100%" /></a>

<sub>Click to watch the demo</sub>

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

| Component | Import | What it does |
| --- | --- | --- |
| [Button](#button--glassbutton) | `GlassButton` | Pill or circle. Swells, leans toward a drag, wobbles on release. |
| [Toggle switch](#toggle-switch--glassswitch) | `GlassSwitch` | The knob lifts into a clear lens that refracts the track. Tap, or drag with rubber-banding. |
| [Slider](#slider--glassslider) | `GlassSlider` | Thin track with a lens thumb, or a Control Center block. |
| [Segmented control](#segmented-control--glasssegmented) | `GlassSegmented` | The control swells and the selection becomes a draggable lens. |
| [Tab bar](#tab-bar--glassnav) | `GlassNav` | Floating tab bar. The selection inflates into a lens you can drag across tabs. |
| [Menu](#menu--glassmenu) | `GlassMenu` | Pull-down menu that grows out of its glass button and folds back into it. |
| [Search and text field](#search-and-text-field--glassinput) | `GlassInput` | Text or search field with icon, trailing accessory and clear button. |
| [Card](#card--glasscard) | `GlassCard` | Refracting panel, frosted or clear. |
| [Sheet](#sheet--glasssheet) | `GlassSheet` | Bottom sheet. Drag or flick to dismiss; with detents, half height to full screen. |

Every example below assumes `useState` from React and the stylesheet imported once. Icons such as `<PlusIcon />` stand for any React node, like an SVG icon component. `intensity` (1–10) scales refraction strength on every component.

<!-- components:start -->
### Button · `GlassButton`

A pill, or a circle when it has an icon and no label. It swells under the finger, leans toward a drag and wobbles as it settles.

**Variants**

```tsx
import { GlassButton } from '@zakisheriff/liquid-glass';

<GlassButton>Glass</GlassButton>
<GlassButton variant="clear">Clear</GlassButton>
<GlassButton variant="tinted">Tinted</GlassButton>
<GlassButton variant="filled">Filled</GlassButton>
```

**Any colour**

```tsx
<GlassButton variant="tinted" tint="#ff9f0a">Orange label</GlassButton>
<GlassButton variant="filled" tint="#af52de">Purple fill</GlassButton>
```

**Destructive**

```tsx
<GlassButton destructive>Delete</GlassButton>
<GlassButton variant="filled" destructive>Delete</GlassButton>
```

**Icons**

```tsx
{/* Icon with a label */}
<GlassButton icon={<PlusIcon />}>New note</GlassButton>

{/* Icon only: becomes a circle, so give it an accessible name */}
<GlassButton icon={<PlusIcon />} aria-label="Add" />
```

**Sizes**

```tsx
<GlassButton size="sm">Small</GlassButton>   {/* 36px */}
<GlassButton size="md">Medium</GlassButton>  {/* 44px, default */}
<GlassButton size="lg">Large</GlassButton>   {/* 52px */}
```

**Handling clicks**

```tsx
<GlassButton variant="filled" onClick={() => save()} disabled={saving}>
  Save
</GlassButton>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'glass' \| 'clear' \| 'tinted' \| 'filled'` | `'glass'` | Regular glass, see-through glass, glass with a coloured label, or a solid colour. |
| `tint` | `string` | `accent blue` | Any CSS colour. Colours the label for `tinted` and the fill for `filled`. |
| `destructive` | `boolean` | `false` | Red label, or a red fill with `filled`, for delete and other irreversible actions. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Height: 36, 44 or 52 px. |
| `icon` | `ReactNode` |  | Leading icon. With no children the button becomes a circle. |
| `shimmer` | `boolean` | `true` | Light bloom under the finger while pressed. |
| `thickness` | `number (1–4)` | `1` | Rim bevel scale. Wider bevels bend more of the backdrop. |
| `intensity` | `number (1–10)` | `5` | Refraction strength, from subtle to heavy. |

Also accepts every `<button>` prop (`onClick`, `disabled`, `type`, `aria-*`, …).

### Toggle switch · `GlassSwitch`

An iOS toggle. On press the knob lifts into a clear lens that refracts the track. Tap it, or drag the knob with rubber-banding at the ends.

**Controlled**

```tsx
import { useState } from 'react';
import { GlassSwitch } from '@zakisheriff/liquid-glass';

function WifiSetting() {
  const [on, setOn] = useState(true);
  return <GlassSwitch checked={on} onChange={setOn} aria-label="Wi-Fi" />;
}
```

**Uncontrolled**

```tsx
<GlassSwitch defaultChecked onChange={(on) => console.log(on)} aria-label="Bluetooth" />
```

**Custom on colour**

```tsx
<GlassSwitch checked={focus} onChange={setFocus} tint="#ff9f0a" aria-label="Focus" />
```

**In a settings list, with a visible label**

```tsx
<label className="setting">
  <span>Live Activities</span>
  <GlassSwitch checked={live} onChange={setLive} />
</label>
```

**Disabled**

```tsx
<GlassSwitch checked disabled aria-label="Managed by your organisation" />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` |  | On or off, when you control the state. |
| `defaultChecked` | `boolean` |  | Starting state, when the switch manages its own state. |
| `onChange` | `(checked: boolean) => void` |  | Called with the new state after a tap or a drag. |
| `tint` | `string` | `system green` | On-state colour. Any CSS colour. |
| `disabled` | `boolean` | `false` | Dims the switch and ignores input. |
| `intensity` | `number (1–10)` | `5` | Refraction strength, from subtle to heavy. |

Also accepts other `<button>` props (`aria-label`, `id`, `className`, …).

The switch is a `role="switch"` button: Space and Enter toggle it. Give it an `aria-label`, or wrap it in a `<label>` with visible text.

### Slider · `GlassSlider`

A thin iOS track whose thumb lifts into a lens that magnifies the rail, or a Control Center block that fills and stretches under the finger.

**Track with a lens thumb**

```tsx
import { GlassSlider } from '@zakisheriff/liquid-glass';

const [volume, setVolume] = useState(40);
<GlassSlider value={volume} onChange={setVolume} aria-label="Volume" />
```

**Control Center block**

```tsx
<GlassSlider
  showThumb={false}
  value={brightness}
  onChange={setBrightness}
  icon={<SunIcon />}
  label="Display"
/>
```

**Range, steps and colour**

```tsx
{/* Snaps to 5 °C steps between 10 and 30 */}
<GlassSlider min={10} max={30} step={5} value={temp} onChange={setTemp} tint="#ff9f0a" aria-label="Temperature" />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | `0` | Current value. |
| `onChange` | `(value: number) => void` |  | Called while dragging, with the full-precision value. |
| `min` | `number` | `0` | Lowest value. |
| `max` | `number` | `100` | Highest value. |
| `step` | `number \| 'any'` | `'any'` | Continuous by default. A number snaps to fixed increments. |
| `showThumb` | `boolean` | `true` | `true`: thin track with a lens thumb. `false`: Control Center block. |
| `icon` | `ReactNode` |  | Icon inside the block slider. |
| `label` | `string` |  | Label inside the block slider. Its number is rounded for display. |
| `tint` | `string` | `accent blue (white for blocks)` | Fill colour. |
| `intensity` | `number (1–10)` | `5` | Refraction strength, from subtle to heavy. |

Also accepts other `<input type="range">` props (`aria-label`, `disabled`, `name`, …).

Arrow keys, Page Up/Down, Home and End work as on a native range input.

### Segmented control · `GlassSegmented`

A row of choices. On press the whole control swells and the selection becomes a lens you can drag between segments.

**Text segments**

```tsx
import { GlassSegmented } from '@zakisheriff/liquid-glass';

const [mode, setMode] = useState(0);
<GlassSegmented options={['Chat', 'Work', 'Study']} value={mode} onChange={setMode} aria-label="Mode" />
```

**With icons**

```tsx
<GlassSegmented
  options={[{ label: 'Light', icon: <SunIcon /> }, { label: 'Dark', icon: <MoonIcon /> }]}
  value={theme}
  onChange={setTheme}
  aria-label="Appearance"
/>
```

**Compact**

```tsx
<GlassSegmented size="sm" options={['Day', 'Week', 'Month']} value={range} onChange={setRange} />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `Array<string \| { label, icon? }>` |  | Segment labels, or label and icon pairs. |
| `value` | `number` |  | Index of the selected segment. |
| `onChange` | `(index: number) => void` |  | Called with the index of the newly selected segment. |
| `size` | `'sm' \| 'md'` | `'md'` | Height: 28 or 36 px. |
| `intensity` | `number (1–10)` | `5` | Refraction strength, from subtle to heavy. |
| `aria-label` | `string` |  | Accessible name for the group. |
| `className, style` |  |  | Applied to the control. |

Arrow keys, Home and End move the selection.

### Tab bar · `GlassNav`

A floating iOS 26 tab bar. The selection inflates into a lens you can drag across the tabs. Icons with labels, or icons only.

**Icons and labels**

```tsx
import { GlassNav } from '@zakisheriff/liquid-glass';

const [tab, setTab] = useState(0);
<GlassNav
  activeIndex={tab}
  onChange={setTab}
  aria-label="Sections"
  items={[
    { label: 'Home', icon: <HomeIcon /> },
    { label: 'Saved', icon: <BookmarkIcon /> },
    { label: 'Library', icon: <GridIcon /> },
    { label: 'Search', icon: <SearchIcon /> },
  ]}
/>
```

**Icons only**

```tsx
{/* Labels become each tab's accessible name */}
<GlassNav showLabels={false} activeIndex={tab} onChange={setTab} items={tabs} />
```

**Tabs plus a separate search button**

```tsx
<div style={{ display: 'flex', gap: 12 }}>
  <GlassNav activeIndex={tab} onChange={setTab} items={tabs} />
  <GlassButton icon={<SearchIcon />} aria-label="Search" size="lg" />
</div>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Array<{ label: string; icon?: ReactNode }>` |  | The tabs. Icons sit above labels. |
| `activeIndex` | `number` | `0` | Index of the selected tab. |
| `onChange` | `(index: number) => void` |  | Called when a tab is tapped, or when the lens is dragged onto one. |
| `showLabels` | `boolean` | `true` | `false` shows icons only. |
| `intensity` | `number (1–10)` | `5` | Refraction strength, from subtle to heavy. |
| `aria-label` | `string` |  | Accessible name for the tab list. |
| `className, style` |  |  | Applied to the bar. |

Arrow keys, Home and End move between tabs. Position the bar yourself, for example `position: fixed; bottom: 24px`.

### Menu · `GlassMenu`

A pull-down menu that grows out of its glass button and folds back into it with a jiggle. Slide a finger across the items to pick one.

**Actions**

```tsx
import { GlassMenu } from '@zakisheriff/liquid-glass';

<GlassMenu
  icon={<EllipsisIcon />}
  aria-label="More"
  items={[
    { label: 'Share', icon: <ShareIcon />, onSelect: share },
    { label: 'Duplicate', icon: <CopyIcon />, onSelect: duplicate },
    { label: 'Delete', icon: <TrashIcon />, destructive: true, onSelect: remove },
  ]}
/>
```

**Choices with a checkmark**

```tsx
<GlassMenu
  icon={<SortIcon />}
  aria-label="Sort by"
  items={['Date', 'Name', 'Size'].map((sort) => ({
    label: sort,
    checked: sort === current,
    onSelect: () => setCurrent(sort),
  }))}
/>
```

**Placement and size**

```tsx
{/* Grows from the left edge of a small trigger, 260px wide */}
<GlassMenu icon={<EllipsisIcon />} aria-label="More" align="start" size="sm" width={260} items={items} />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `ReactNode` |  | Icon on the trigger button, such as an ellipsis. |
| `items` | `Array<{ label, icon?, checked?, destructive?, disabled?, onSelect? }>` |  | Menu rows. `checked` adds a trailing checkmark; `destructive` makes the label red. |
| `aria-label` | `string` |  | Accessible name for the trigger. Required. |
| `align` | `'start' \| 'end'` | `'end'` | Edge of the trigger the menu grows from. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Trigger size, as for GlassButton. |
| `width` | `number` | `230` | Menu width in px. |
| `check` | `ReactNode` |  | Replaces the trailing checkmark icon. |
| `className` | `string` |  | Applied to the menu wrapper. |

Escape or a tap outside closes the menu. Arrow keys move between items.

### Search and text field · `GlassInput`

A glass text field with a leading icon, an optional trailing accessory and a clear button.

**Search**

```tsx
import { GlassInput } from '@zakisheriff/liquid-glass';

const [query, setQuery] = useState('');
<GlassInput
  type="search"
  placeholder="Search"
  value={query}
  onChange={(event) => setQuery(event.target.value)}
  trailing={<MicIcon />}
  aria-label="Search"
/>
```

**Text field with a label**

```tsx
<GlassInput label="Name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
```

**Custom icon and clear behaviour**

```tsx
<GlassInput
  icon={<MailIcon />}
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  onClear={() => setEmail('')}
  tint="#30d158"
/>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `string` | `'text'` | Any input type. `'search'` adds a magnifier icon. |
| `value` | `string` |  | Current text. |
| `onChange` | `(event) => void` |  | Standard input change event. |
| `placeholder` | `string` |  | Hint shown while empty. |
| `label` | `string` |  | Small label above the field. |
| `icon` | `ReactNode` |  | Leading icon. |
| `trailing` | `ReactNode` |  | Trailing accessory, such as a microphone. |
| `onClear` | `() => void` |  | Called by the clear button. Without it, clearing sends an empty `onChange`. |
| `tint` | `string` |  | Caret and focus glow colour. |
| `intensity` | `number (1–10)` | `5` | Refraction strength, from subtle to heavy. |

Also accepts every other `<input>` prop (`name`, `autoFocus`, `disabled`, …), and `ref` reaches the input.

### Card · `GlassCard`

A refracting glass panel for grouping content and controls: frosted, or clear.

**Regular and clear**

```tsx
import { GlassCard } from '@zakisheriff/liquid-glass';

<GlassCard>Frosted panel</GlassCard>
<GlassCard variant="clear">See-through panel</GlassCard>
```

**Spacing, corners and tint**

```tsx
<GlassCard padding="20px" radius="32px" tint="rgb(255 55 95 / 0.18)">
  <h3>Now playing</h3>
  <GlassSlider value={progress} onChange={seek} aria-label="Position" />
</GlassCard>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'regular' \| 'clear'` | `'regular'` | Frosted or see-through glass. |
| `padding` | `string` | `'24px'` | Inner padding, any CSS length. |
| `radius` | `string` | `'28px'` | Corner radius, any CSS length. |
| `tint` | `string` |  | CSS colour washed over the glass. |
| `thickness` | `number (1–4)` | `1` | Rim bevel scale. |
| `intensity` | `number (1–10)` | `5` | Refraction strength, from subtle to heavy. |

Also accepts every `<div>` prop (`className`, `style`, `onClick`, …).

### Sheet · `GlassSheet`

A floating bottom sheet with a spring entrance. Drag or flick it down to dismiss. With detents it opens at half height and drags up to full screen.

**Fits its content**

```tsx
import { GlassSheet, GlassButton } from '@zakisheriff/liquid-glass';

const [open, setOpen] = useState(false);
<GlassButton onClick={() => setOpen(true)}>Details</GlassButton>
<GlassSheet open={open} onClose={() => setOpen(false)} aria-label="Details">
  <p>Anything goes here.</p>
</GlassSheet>
```

**Half height, then full screen**

```tsx
<GlassSheet open={open} onClose={() => setOpen(false)} detents={['medium', 'large']} aria-label="Comments">
  {comments}
</GlassSheet>
```

**Inside a container**

```tsx
{/* Stays inside a positioned element (e.g. a phone mockup) without locking page scroll */}
const [frame, setFrame] = useState<HTMLDivElement | null>(null);
<div ref={setFrame} style={{ position: 'relative', height: 600, overflow: 'hidden' }}>
  <GlassSheet open={open} onClose={() => setOpen(false)} container={frame}>…</GlassSheet>
</div>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` |  | Whether the sheet is shown. |
| `onClose` | `() => void` |  | Called when the scrim is tapped, Escape is pressed or the sheet is swiped down. |
| `detents` | `Array<'medium' \| 'large'>` |  | Resting heights. `['medium', 'large']` opens at half height. Unset: fits its content. |
| `container` | `HTMLElement \| null` | `viewport` | Positioned element to keep the sheet inside. |
| `tint` | `string` |  | CSS colour washed over the glass. |
| `aria-label` | `string` |  | Accessible name for the dialog. |
| `intensity` | `number (1–10)` | `5` | Refraction strength, from subtle to heavy. |
<!-- components:end -->

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
