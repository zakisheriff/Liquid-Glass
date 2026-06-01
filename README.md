# <div align="center">@zakisheriff/liquid-glass</div>

<div align="center">
<strong>Apple-Inspired iOS 26 Liquid Glass UI Components for React</strong>
</div>

<br />

<div align="center">

![React](https://img.shields.io/badge/React-%3E%3D17-61dafb?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-Backdrop%20Filter-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br />

<a href="https://www.npmjs.com/package/@zakisheriff/liquid-glass">
<img src="https://img.shields.io/badge/View%20on%20npm-Install%20Package-CB3837?style=for-the-badge&logo=npm&logoColor=white" height="50" />
</a>

<br />
<br />

**[Website: https://liquidglass.theatom.lk](https://liquidglass.theatom.lk)**

**[GitHub: https://github.com/zakisheriff/Liquid-Glass](https://github.com/zakisheriff/Liquid-Glass)**

**[npm: https://www.npmjs.com/package/@zakisheriff/liquid-glass](https://www.npmjs.com/package/@zakisheriff/liquid-glass)**

</div>

<br />

> **"Glass should feel physical, not painted on."**
>
> `@zakisheriff/liquid-glass` brings iOS-style liquid glass surfaces to React with layered shadows, prismatic borders, refraction filters, animated shine, and native CSS blur.

---

## Why Use It?

- **Ready-made glass components** for buttons, cards, inputs, sheets, nav bars, and sliders
- **Real depth and refraction** using layered CSS, `backdrop-filter`, masks, gradients, and SVG displacement filters
- **TypeScript-first API** with exported prop types for every component
- **No design framework required** because the package ships its own CSS
- **Customizable surfaces** through intensity, tint, shimmer, thickness, radius, and layout props

---

## Install

```bash
npm install @zakisheriff/liquid-glass
```

```bash
yarn add @zakisheriff/liquid-glass
```

```bash
pnpm add @zakisheriff/liquid-glass
```

---

## Setup

Import the stylesheet once in your app entry file.

```tsx
import '@zakisheriff/liquid-glass/styles.css';
```

Then import only the components you need.

```tsx
import {
  GlassButton,
  GlassCard,
  GlassInput,
  GlassNav,
  GlassSheet,
  GlassSlider,
  LiquidGlassFilter,
} from '@zakisheriff/liquid-glass';
```

For the cleanest output, wrap the area using glass components with `LiquidGlassFilter`. Components still work without it, but the provider renders one shared SVG filter set instead of each component injecting its own local filter.

```tsx
import { LiquidGlassFilter } from '@zakisheriff/liquid-glass';
import '@zakisheriff/liquid-glass/styles.css';

export default function App() {
  return (
    <LiquidGlassFilter>
      <YourApp />
    </LiquidGlassFilter>
  );
}
```

If you use Next.js App Router, use these components inside a client component because they rely on browser interaction APIs.

```tsx
'use client';

import { GlassButton } from '@zakisheriff/liquid-glass';
import '@zakisheriff/liquid-glass/styles.css';
```

---

## Quick Example

```tsx
import { GlassButton, GlassCard, LiquidGlassFilter } from '@zakisheriff/liquid-glass';
import '@zakisheriff/liquid-glass/styles.css';

export default function App() {
  return (
    <LiquidGlassFilter>
      <main style={{ minHeight: '100vh', padding: 40, background: '#f3f4f6' }}>
        <GlassCard padding="32px" radius="28px" intensity={6} shimmer>
          <h2>Hello, Liquid Glass</h2>
          <p>Build tactile glass interfaces with React.</p>

          <GlassButton size="lg" onClick={() => alert('Clicked!')}>
            Get Started
          </GlassButton>
        </GlassCard>
      </main>
    </LiquidGlassFilter>
  );
}
```

---

## Shared Visual Props

Most visual components use the same glass controls:

| Prop | Type | Default | What it does |
|------|------|---------|--------------|
| `intensity` | `number` | `5` | Controls refraction and blur strength. Values are clamped from `1` to `10`. |
| `tint` | `string` | `undefined` | Adds a CSS color overlay such as `rgba(0, 122, 255, 0.14)` or `#ffffff22`. |
| `shimmer` | `boolean` | `true` | Enables animated shine/reflection effects where supported. |
| `thickness` | `number` | `1` | Controls bevel/border thickness in pixels where supported. |

Use low intensity for subtle UI, mid intensity for standard panels, and high intensity for strong refraction demos.

---

## GlassButton

Use `GlassButton` for primary actions, secondary actions, destructive actions, icon buttons, and pill-shaped CTA buttons. It renders a real `<button>`, so native button props like `type`, `disabled`, `aria-label`, `onClick`, and `form` work.

```tsx
import { GlassButton } from '@zakisheriff/liquid-glass';

function Actions() {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <GlassButton size="lg" onClick={() => console.log('Save')}>
        Save Changes
      </GlassButton>

      <GlassButton variant="ghost" shimmer={false}>
        Cancel
      </GlassButton>

      <GlassButton variant="destructive">
        Delete
      </GlassButton>
    </div>
  );
}
```

Use the `size` prop for quick sizing, and use `style` when you need a fixed width.

```tsx
<GlassButton
  size="md"
  style={{ width: '100%' }}
>
  Continue
</GlassButton>
```

### GlassButton Props

| Prop | Type | Default | What it does |
|------|------|---------|--------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Changes height, font size, and minimum width. |
| `variant` | `'default' \| 'ghost' \| 'destructive'` | `'default'` | Sets the visual treatment. |
| `intensity` | `number` | `5` | Controls refraction strength. |
| `tint` | `string` | `undefined` | Adds a glass tint color. |
| `shimmer` | `boolean` | `true` | Enables the shine overlay. |
| `thickness` | `number` | `1` | Controls bevel thickness. |
| `children` | `React.ReactNode` | `undefined` | Button label or icon content. |
| Native button props | `ButtonHTMLAttributes<HTMLButtonElement>` | `-` | Supports `onClick`, `disabled`, `type`, `aria-*`, and more. |

---

## GlassCard

Use `GlassCard` as a glass surface for panels, forms, dashboards, settings groups, previews, and modal content. It renders a `<div>` and accepts normal div attributes.

```tsx
import { GlassCard } from '@zakisheriff/liquid-glass';

function ProfileCard() {
  return (
    <GlassCard
      intensity={6}
      tint="rgba(255,255,255,0.12)"
      padding="28px"
      radius="32px"
    >
      <h2>Account</h2>
      <p>Manage your profile and preferences.</p>
    </GlassCard>
  );
}
```

Use `padding` for inner spacing and `radius` for shape. Cards are best placed over a visible background, gradient, image, or soft color field so the blur/refraction is visible.

### GlassCard Props

| Prop | Type | Default | What it does |
|------|------|---------|--------------|
| `intensity` | `number` | `5` | Controls refraction strength. |
| `tint` | `string` | `undefined` | Adds a glass tint color. |
| `shimmer` | `boolean` | `true` | Enables animated border shine. |
| `thickness` | `number` | `1` | Controls bevel thickness. |
| `padding` | `string` | `'24px'` | Sets inner content padding. |
| `radius` | `string` | `'20px'` | Sets border radius, for example `'24px'` or `'36px'`. |
| `children` | `React.ReactNode` | `undefined` | Card content. |
| Native div props | `HTMLAttributes<HTMLDivElement>` | `-` | Supports `className`, `style`, `id`, `role`, and more. |

---

## GlassInput

Use `GlassInput` for controlled text fields with a floating label and glass focus state.

```tsx
import { useState } from 'react';
import { GlassInput } from '@zakisheriff/liquid-glass';

function LoginForm() {
  const [email, setEmail] = useState('');

  return (
    <GlassInput
      label="Email"
      placeholder="you@example.com"
      value={email}
      onChange={(event) => setEmail(event.target.value)}
      autoComplete="email"
      intensity={5}
    />
  );
}
```

The input is controlled through `value` and `onChange`. The `label` floats when the field is focused or has a value.

### GlassInput Props

| Prop | Type | Default | What it does |
|------|------|---------|--------------|
| `label` | `string` | `undefined` | Floating label displayed inside the glass field. |
| `placeholder` | `string` | `undefined` | Native input placeholder. |
| `value` | `string` | `undefined` | Controlled input value. |
| `onChange` | `(event: React.ChangeEvent<HTMLInputElement>) => void` | `undefined` | Change handler for controlled state. |
| `intensity` | `number` | `5` | Controls refraction strength. |
| `tint` | `string` | `undefined` | Adds a glass tint color. |
| Native input props | `InputHTMLAttributes<HTMLInputElement>` | `-` | Supports `type`, `name`, `required`, `autoComplete`, `disabled`, and more. |

---

## GlassSlider

Use `GlassSlider` for range controls. It renders a native range input overlay for accessibility, while the visual layer uses liquid glass.

There are two modes:

- `showThumb={false}` creates an iOS Control Center style block slider
- `showThumb={true}` creates a classic track slider with a circular knob

### Control Center Block Slider

```tsx
import { useState } from 'react';
import { GlassSlider } from '@zakisheriff/liquid-glass';

function VolumeControl() {
  const [volume, setVolume] = useState(46);

  return (
    <GlassSlider
      min={0}
      max={100}
      value={volume}
      onChange={setVolume}
      showThumb={false}
      label="Volume"
      icon={<span aria-hidden>🔊</span>}
      intensity={6}
    />
  );
}
```

### Classic Thumb Slider

```tsx
function HueControl() {
  const [hue, setHue] = useState(180);

  return (
    <GlassSlider
      min={0}
      max={360}
      value={hue}
      onChange={setHue}
      showThumb
      label="Hue"
    />
  );
}
```

### GlassSlider Props

| Prop | Type | Default | What it does |
|------|------|---------|--------------|
| `value` | `number \| string \| readonly string[]` | `0` | Current range value. Use a number for best results. |
| `min` | `number \| string` | `0` | Minimum range value. |
| `max` | `number \| string` | `100` | Maximum range value. |
| `onChange` | `(value: number) => void` | `undefined` | Receives the numeric slider value. |
| `showThumb` | `boolean` | `true` | Shows the circular knob when `true`; uses block-fill style when `false`. |
| `icon` | `React.ReactNode` | `undefined` | Optional icon shown on the left inside the track. |
| `label` | `string` | `undefined` | Optional label shown inside the track. |
| `intensity` | `number` | `5` | Controls refraction strength. |
| `tint` | `string` | `undefined` | Adds a glass tint color. |
| `shimmer` | `boolean` | `true` | Enables shine on the active fill. |
| `thickness` | `number` | `1` | Controls bevel thickness. |
| Native range props | `InputHTMLAttributes<HTMLInputElement>` | `-` | Supports `step`, `disabled`, `aria-label`, and more. |

---

## GlassNav

Use `GlassNav` for segmented controls, tab bars, and compact navigation. It manages only visuals and click events; you own the active state.

```tsx
import { useState } from 'react';
import { GlassNav } from '@zakisheriff/liquid-glass';

const tabs = [
  { label: 'Overview' },
  { label: 'Buttons' },
  { label: 'Inputs' },
];

function Tabs() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <GlassNav
      items={tabs}
      activeIndex={activeTab}
      onChange={setActiveTab}
      intensity={5}
    />
  );
}
```

Each item can include an icon.

```tsx
<GlassNav
  items={[
    { label: 'Home', icon: <HomeIcon /> },
    { label: 'Settings', icon: <SettingsIcon /> },
  ]}
  activeIndex={activeIndex}
  onChange={setActiveIndex}
/>
```

### GlassNav Props

| Prop | Type | Default | What it does |
|------|------|---------|--------------|
| `items` | `{ label: string; icon?: React.ReactNode }[]` | Required | Items rendered as tabs. |
| `activeIndex` | `number` | `0` | Zero-based active item index. |
| `onChange` | `(index: number) => void` | `undefined` | Called when a nav item is clicked. |
| `intensity` | `number` | `5` | Controls refraction strength. |

---

## GlassSheet

Use `GlassSheet` for bottom sheets, action drawers, mobile menus, and lightweight modal panels. You control it with an `open` boolean.

```tsx
import { useState } from 'react';
import { GlassButton, GlassSheet } from '@zakisheriff/liquid-glass';

function SettingsSheet() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <GlassButton onClick={() => setOpen(true)}>
        Open Settings
      </GlassButton>

      <GlassSheet open={open} onClose={() => setOpen(false)} intensity={6}>
        <h2>Settings</h2>
        <p>Sheet content goes here.</p>

        <GlassButton onClick={() => setOpen(false)}>
          Done
        </GlassButton>
      </GlassSheet>
    </>
  );
}
```

The sheet closes when the backdrop is clicked or when Escape is pressed. It also locks body scrolling while mounted.

### GlassSheet Props

| Prop | Type | Default | What it does |
|------|------|---------|--------------|
| `open` | `boolean` | Required | Controls whether the sheet is visible. |
| `onClose` | `() => void` | `undefined` | Called by backdrop click or Escape key. |
| `intensity` | `number` | `5` | Controls refraction strength. |
| `tint` | `string` | `undefined` | Adds a glass tint color. |
| `children` | `React.ReactNode` | `undefined` | Sheet content. |

---

## LiquidGlassFilter

Use `LiquidGlassFilter` once near the top of your app or page. It renders shared SVG filter definitions for refraction levels `1` through `10`.

```tsx
import { LiquidGlassFilter } from '@zakisheriff/liquid-glass';

function Root() {
  return (
    <LiquidGlassFilter>
      <App />
    </LiquidGlassFilter>
  );
}
```

You can skip it for quick demos because each component can inject its own filter fallback, but using the provider is cleaner for production apps.

---

## Hooks

### useGlassEffect

Use `useGlassEffect` when building your own custom glass component. It returns a `style` object with glass CSS variables and a matching `filterId`.

```tsx
import { useGlassEffect } from '@zakisheriff/liquid-glass';

function CustomGlassPanel() {
  const { style, filterId } = useGlassEffect({
    intensity: 7,
    tint: 'rgba(0, 122, 255, 0.14)',
    shimmer: true,
    thickness: 2,
    blur: 18,
  });

  return (
    <div data-liquid-glass style={style}>
      Custom glass panel using {filterId}
    </div>
  );
}
```

### useGlassAnimation

Use `useGlassAnimation` when creating custom interactive glass elements. It gives you hover, press, and focus state plus pointer/focus handlers.

```tsx
import { useGlassAnimation } from '@zakisheriff/liquid-glass';

function CustomGlassButton() {
  const { isHovered, isPressed, isFocused, handlers } = useGlassAnimation();

  return (
    <button
      {...handlers}
      style={{
        transform: isPressed ? 'scale(0.98)' : 'scale(1)',
        opacity: isHovered || isFocused ? 1 : 0.86,
      }}
    >
      Custom
    </button>
  );
}
```

---

## Styling Tips

- Put glass components over a visible background, image, gradient, or soft color surface so blur/refraction has something to bend.
- Use `intensity={3}` to `intensity={6}` for production UI and `intensity={7}` to `intensity={10}` for dramatic demos.
- Use subtle tint values such as `rgba(0, 122, 255, 0.12)` instead of fully opaque colors.
- Keep `LiquidGlassFilter` mounted once around repeated glass components for cleaner DOM output.
- Import `@zakisheriff/liquid-glass/styles.css` only once.

---

## Browser Support

- Chrome 89+
- Edge 89+
- Safari 15.4+
- Firefox 103+

`backdrop-filter` support is required for the full liquid glass look.

---

## Project Structure

```text
liquid-glass/
├── src/
│   ├── index.ts
│   ├── components/
│   │   ├── GlassButton/
│   │   ├── GlassCard/
│   │   ├── GlassInput/
│   │   ├── GlassNav/
│   │   ├── GlassSheet/
│   │   └── GlassSlider/
│   ├── filters/
│   │   └── LiquidGlassFilter.tsx
│   ├── hooks/
│   │   ├── useGlassAnimation.ts
│   │   └── useGlassEffect.ts
│   └── styles/
│       └── base.css
├── demo/
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

---

## Development

```bash
git clone https://github.com/zakisheriff/Liquid-Glass.git
cd Liquid-Glass
npm install
```

Run the library build:

```bash
npm run build
```

Watch the library build:

```bash
npm run dev
```

Run the demo:

```bash
npm run demo
```

---

## License

MIT License. Free for personal and commercial projects.

---

## Support the Project

If Liquid Glass helped you build a better interface, you can support future updates here:

<div align="center">
<a href="https://buymeacoffee.com/theoneatom">
<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="60" width="217" alt="Buy Me A Coffee">
</a>
</div>

---

<p align="center">
Made by <strong>Zaki Sheriff</strong>
</p>

<p align="center">
<em>Because interfaces should feel as good as they look.</em>
</p>
