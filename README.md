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

**[View on GitHub: https://github.com/zakisheriff/Liquid-Glass](https://github.com/zakisheriff/Liquid-Glass)**

</div>

<br />

> **"Glass should feel physical, not painted on."**
>
> `@zakisheriff/liquid-glass` brings Apple's liquid glass aesthetic to React.  
> Built with layered shadows, prismatic borders, animated shine overlays, and native CSS blur, it turns ordinary interface elements into tactile glass surfaces.

---

## 🌟 Vision

Liquid Glass exists to be:

- **A polished React component library** for building premium glass interfaces quickly
- **A native CSS-first design system** with no heavy visual runtime
- **A reusable foundation** for buttons, cards, inputs, sheets, navigation, and custom glass components

---

## ✨ Why Liquid Glass?

Most glassmorphism is just a translucent rectangle with blur.  
Liquid Glass goes deeper with **physical depth, refracted edges, animated highlights, and tactile interaction states**.

It is designed for teams who want Apple-inspired surfaces without rebuilding the same effect from scratch in every project.

---

## 🎨 Apple-Inspired Liquid Glass Design

- **Layered Surface Depth**  
  Multiple inset and outer shadows create the feeling of glass floating above the interface.

- **Prismatic Edge Refraction**  
  Conic-gradient borders with mask compositing simulate light catching the rim of glass.

- **Animated Shine**  
  Subtle hover glints and shimmer states make interactive elements feel alive.

- **Native Backdrop Blur**  
  CSS `backdrop-filter: blur()` creates real frosted-glass depth over page content.

- **System-Friendly Styling**  
  Components inherit typography and layout naturally, so they fit inside existing React apps.

---

## 🧩 Component Library

- **GlassButton**  
  Pill-shaped action button with depth, shimmer, variants, sizes, and press feedback.

- **GlassCard**  
  Flexible glass container for panels, sections, previews, and grouped content.

- **GlassInput**  
  Glass-surfaced text input with focus animation and optional floating label.

- **GlassSheet**  
  Bottom sheet/modal overlay with smooth slide-up animation and glass backdrop.

- **GlassNav**  
  Pill navigation with glass surface and sliding active indicator.

- **LiquidGlassFilter**  
  Advanced SVG filter provider for custom glass experiments.

---

## 🪄 Hooks for Custom Glass

- **useGlassEffect**  
  Generates glass styles and filter IDs for building custom glass components.

- **useGlassAnimation**  
  Tracks hover, press, and focus states for interactive glass behavior.

---

## 📁 Project Structure

```text
liquid-glass/
├── src/
│   ├── index.ts                         # Public package exports
│   ├── components/
│   │   ├── GlassButton/
│   │   │   ├── GlassButton.tsx          # Liquid glass button component
│   │   │   ├── GlassButton.css          # Button-specific styles
│   │   │   └── index.ts                 # Component barrel export
│   │   ├── GlassCard/
│   │   │   ├── GlassCard.tsx            # Glass container component
│   │   │   └── index.ts
│   │   ├── GlassInput/
│   │   │   ├── GlassInput.tsx           # Glass text input
│   │   │   └── index.ts
│   │   ├── GlassSheet/
│   │   │   ├── GlassSheet.tsx           # Bottom sheet/modal surface
│   │   │   └── index.ts
│   │   └── GlassNav/
│   │       ├── GlassNav.tsx             # Glass navigation component
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useGlassAnimation.ts         # Interaction state hook
│   │   └── useGlassEffect.ts            # Custom glass style hook
│   ├── filters/
│   │   └── LiquidGlassFilter.tsx        # Advanced SVG filter provider
│   └── styles/
│       └── base.css                     # Core liquid glass styles
├── package.json                         # Package metadata and scripts
├── tsconfig.json                        # TypeScript configuration
└── tsup.config.ts                       # Build configuration
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+ recommended)
- **React** (v17+)
- **React DOM** (v17+)

### 1. Install the Package

```bash
npm install @zakisheriff/liquid-glass
```

```bash
yarn add @zakisheriff/liquid-glass
```

```bash
pnpm add @zakisheriff/liquid-glass
```

### 2. Import Styles

```tsx
import '@zakisheriff/liquid-glass/styles.css';
```

### 3. Use Components

```tsx
import { GlassButton, GlassCard } from '@zakisheriff/liquid-glass';
import '@zakisheriff/liquid-glass/styles.css';

function App() {
  return (
    <main style={{ minHeight: '100vh', padding: 40, background: '#f3f4f6' }}>
      <GlassCard padding="32px" radius="24px" shimmer>
        <h2>Hello, Glass</h2>
        <p>Build tactile glass interfaces with React.</p>

        <GlassButton size="lg" shimmer onClick={() => alert('Clicked!')}>
          Get Started
        </GlassButton>
      </GlassCard>
    </main>
  );
}
```

---

## 🎯 Key Features

✅ **React Components** — Buttons, cards, inputs, sheets, and navigation  
✅ **TypeScript Support** — Fully typed exports for component props and hooks  
✅ **CSS-First Effects** — Uses native CSS blur, shadows, masks, and gradients  
✅ **Interactive States** — Hover, press, focus, shimmer, and disabled states  
✅ **Custom Glass Hooks** — Build your own components with shared glass behavior  
✅ **Small Package Surface** — Exports only components, hooks, filters, and styles  
✅ **Framework Friendly** — Works in Vite, Next.js, Remix, and standard React apps  

---

## 🔧 Tech Stack

### Runtime
- **React** — Component model and rendering
- **React DOM** — DOM integration
- **CSS** — Liquid glass visuals, blur, masks, and animations

### Development
- **TypeScript** — Static types and public declaration files
- **Tsup** — Library bundling for ESM and CommonJS
- **npm** — Package publishing workflow

---

## 📦 Package Exports

### Components
- `GlassButton` — Action button with liquid glass styling
- `GlassCard` — Glass content container
- `GlassInput` — Styled input surface
- `GlassSheet` — Modal/bottom sheet component
- `GlassNav` — Pill navigation component
- `LiquidGlassFilter` — Advanced filter provider

### Hooks
- `useGlassEffect` — Generate reusable glass styles
- `useGlassAnimation` — Track interactive component states

### Styles
- `@zakisheriff/liquid-glass/styles.css` — Core stylesheet

---

## 🧪 Component Examples

### GlassButton

```tsx
<GlassButton size="lg" variant="default" shimmer onClick={handleClick}>
  Get the App
</GlassButton>
```

### GlassCard

```tsx
<GlassCard padding="24px" radius="20px" shimmer>
  <p>Content goes here</p>
</GlassCard>
```

### GlassInput

```tsx
<GlassInput
  label="Email"
  placeholder="you@example.com"
  value={email}
  onChange={(event) => setEmail(event.target.value)}
/>
```

### GlassSheet

```tsx
<GlassSheet open={isOpen} onClose={() => setIsOpen(false)}>
  <h3>Sheet Content</h3>
  <p>This slides up from the bottom.</p>
</GlassSheet>
```

### GlassNav

```tsx
<GlassNav
  items={[
    { label: 'Home' },
    { label: 'About' },
    { label: 'Contact' },
  ]}
  activeIndex={activeTab}
  onChange={setActiveTab}
/>
```

---

## 🧠 How It Works

Liquid Glass is built with a multi-layer CSS approach:

- **Surface Layer** — Semi-transparent gradients and `backdrop-filter` create the frosted base.
- **Depth Shadows** — Carefully layered `box-shadow` values create physical depth and press feedback.
- **Prismatic Border** — Masked conic gradients create a refractive rim around the surface.
- **Shine Overlay** — Animated light streaks simulate glints moving across the component.
- **Motion Curve** — `cubic-bezier(0.25, 1, 0.5, 1)` keeps transitions soft and tactile.

---

## 🌐 Browser Support

✅ **Chrome 89+**  
✅ **Edge 89+**  
✅ **Safari 15.4+**  
✅ **Firefox 103+**  

---

## 🛠️ Development

### Clone the Repository

```bash
git clone https://github.com/zakisheriff/Liquid-Glass.git
cd liquid-glass
```

### Install Dependencies

```bash
npm install
```

### Run the Build

```bash
npm run build
```

### Watch During Development

```bash
npm run dev
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a Pull Request.

---

## 📄 License

MIT License — free to use in personal and commercial projects.

---

## ☕️ Support the Project

If Liquid Glass helped you build a more beautiful interface or inspired your next project:

- Consider buying me a coffee
- It keeps development alive and motivates future updates

<div align="center">
<a href="https://buymeacoffee.com/zakisheriffw">
<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="60" width="217">
</a>
</div>

---

<p align="center">
Made by <strong>Zaki Sheriff</strong>
</p>

<p align="center">
<em>Because interfaces should feel as good as they look.</em>
</p>
