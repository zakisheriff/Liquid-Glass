import { NPM_URL, PACKAGE_VERSION, REPOSITORY, SITE_URL } from './site';

export const QUICK_START = `'use client';

import { useState } from 'react';
import { GlassSwitch } from '@zakisheriff/liquid-glass';
import '@zakisheriff/liquid-glass/styles.css';

export default function Settings() {
  const [enabled, setEnabled] = useState(true);
  return <GlassSwitch checked={enabled} onChange={setEnabled} aria-label="Notifications" />;
}`;

export const COMPONENTS = [
  { name: 'GlassButton', description: 'Glass, clear, tinted and filled buttons, including icon-only and destructive variants.', props: 'variant, size, icon, tint, destructive, onClick' },
  { name: 'GlassSwitch', description: 'A toggle with a glass thumb that lifts on press and supports dragging.', props: 'checked, defaultChecked, onChange, tint, disabled' },
  { name: 'GlassNav', description: 'A tab bar with a draggable glass selection and keyboard navigation.', props: 'items: { label, icon? }[], activeIndex, onChange' },
  { name: 'GlassSegmented', description: 'Segmented choices with a glass lens that follows the pointer.', props: 'options, value, onChange, size' },
  { name: 'GlassSlider', description: 'A continuous slider with a lifted lens thumb, or a Control Center-style block.', props: 'value, min, max, step, onChange, showThumb, icon, label' },
  { name: 'GlassInput', description: 'Text and search inputs with an optional trailing accessory and clear button.', props: 'type, value, onChange, placeholder, trailing' },
  { name: 'GlassCard', description: 'A glass panel for grouping content and controls.', props: 'variant, padding, radius, children' },
  { name: 'GlassSheet', description: 'A floating bottom sheet with a spring entrance and drag-to-dismiss interaction.', props: 'open, onClose, children' },
];

export const FAQS = [
  { question: 'What is Liquid Glass for the Web?', answer: '@zakisheriff/liquid-glass is an open-source React component library by Zaki Sheriff. It brings an Apple-inspired liquid glass appearance to web apps, with refraction, translucent surfaces and spring-based touch interactions. It is an independent project, not an Apple product.' },
  { question: 'How do I add liquid glass to a React or Next.js app?', answer: "Run npm i @zakisheriff/liquid-glass, import @zakisheriff/liquid-glass/styles.css once, then import the components you need. In Next.js, import the stylesheet in app/layout.tsx or pages/_app.tsx and add 'use client' to components that manage state. React and React DOM 17 or later are required." },
  { question: 'Does liquid glass work in Safari, Firefox and Chrome?', answer: 'The optical effect varies by browser. Chromium can apply SVG displacement to the live backdrop. Safari and Firefox use translucent glass, highlights and mirrored content for supported thumbs. The demo also includes a WebGL refraction example. Place glass over gradients, images or content to make the effect visible.' },
  { question: 'Is the React liquid glass library free to use?', answer: 'Yes. The component library is MIT licensed and can be used in personal and commercial projects under that license. See the repository license and third-party notices for details.' },
];

export const DOC_MARKDOWN = `# Liquid Glass for the Web

> Apple-inspired liquid glass components for React and Next.js by Zaki Sheriff. Package: @zakisheriff/liquid-glass. MIT licensed. Version ${PACKAGE_VERSION}.

## Official links
- Demo: ${SITE_URL}/
- Documentation: ${SITE_URL}/docs
- Source: ${REPOSITORY}
- npm: ${NPM_URL}

## Install
\`\`\`bash
npm i @zakisheriff/liquid-glass
\`\`\`

## React and Next.js quick start
\`\`\`tsx
${QUICK_START}
\`\`\`

Import the stylesheet once at the app root. In the Next.js App Router use app/layout.tsx; in the Pages Router use pages/_app.tsx. The library requires React and React DOM >=17. Keep interactive state in a client component.

## Components
${COMPONENTS.map(c => `### ${c.name}\n${c.description}\nKey props: ${c.props}.`).join('\n\n')}

## Styling and interaction
Sliders use step="any" for continuous dragging by default. Set a numeric step for fixed increments. onChange receives the numeric value.
Set data-theme="light" or data-theme="dark" on an ancestor, or follow the system theme. Give icon-only controls an aria-label and fields a label. Tab bars and segmented controls support arrow keys, Home and End. Test contrast over your actual background.

## Browser rendering
Chromium uses SVG backdrop displacement. Safari and Firefox use translucent material, highlights and mirrored content on supported thumbs. Effects are not identical across browsers. The demo's large refraction lens uses WebGL.

## Questions
${FAQS.map(f => `### ${f.question}\n${f.answer}`).join('\n\n')}
`;
