import { guidesMarkdown } from './guides';
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
  { name: 'GlassNav', description: 'A tab bar with a draggable glass selection and keyboard navigation. Icons with labels, or icons only.', props: 'items: { label, icon? }[], activeIndex, onChange, showLabels' },
  { name: 'GlassMenu', description: 'A pull-down menu that grows out of its glass button and folds back into it. Slide across the items to pick one.', props: 'icon, items: { label, icon?, checked?, destructive?, onSelect? }[], align, aria-label' },
  { name: 'GlassSegmented', description: 'Segmented choices with a glass lens that follows the pointer.', props: 'options, value, onChange, size' },
  { name: 'GlassSlider', description: 'A continuous slider with a lifted lens thumb, or a Control Center-style block.', props: 'value, min, max, step, onChange, showThumb, icon, label' },
  { name: 'GlassInput', description: 'Text and search inputs with an optional trailing accessory and clear button.', props: 'type, value, onChange, placeholder, trailing' },
  { name: 'GlassCard', description: 'A glass panel for grouping content and controls.', props: 'variant, padding, radius, children' },
  { name: 'GlassSheet', description: 'A bottom sheet with a spring entrance and drag-to-dismiss. With detents it opens at half height and expands to full screen. Pass a container element to keep it inside an app preview.', props: "open, onClose, detents: ['medium', 'large'], container, children" },
];

/** Measured on the full demo page (99 glass elements) in Chromium. */
export const PERFORMANCE = {
  js: '≈31 KB',
  css: '≈5.5 KB',
  points: [
    'No runtime dependencies. React and React DOM are the only peers.',
    'Refraction maps are computed once per glass size, cached and shared, then drawn by the browser. Nothing is recalculated while you scroll.',
    'Springs run on one shared animation frame loop and stop when they settle.',
    'Lens copies only copy and lay out content while a control is pressed, and stop entirely off screen.',
    'The demo page, with 99 glass elements, holds about 11 MB of JavaScript memory and renders at 60 fps.',
  ],
  tips: [
    'The GPU cost is in what moves under the glass. Keep large refracting panels over static or slow content.',
    'Use a few large glass surfaces rather than many small overlapping ones.',
    'Lower intensity, or use GlassCard variant="clear", on low-end devices.',
  ],
};

export const FAQS = [
  { question: 'Is liquid glass lightweight enough for a website?', answer: 'Yes. The whole library is about 31 KB of JavaScript and 5.5 KB of CSS gzipped, with no runtime dependencies. Refraction maps are computed once per size and cached, springs stop when they settle, and lens copies only do work while a control is pressed. The GPU does the drawing, so keep large refracting panels over content that is not constantly animating.' },
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
${guidesMarkdown(3)}

## Styling and interaction
Sliders use step="any" for continuous dragging by default. Set a numeric step for fixed increments. onChange receives the numeric value.
Set data-theme="light" or data-theme="dark" on an ancestor, or follow the system theme. Give icon-only controls an aria-label and fields a label. Tab bars and segmented controls support arrow keys, Home and End. Test contrast over your actual background.

## Performance
${PERFORMANCE.js} JavaScript and ${PERFORMANCE.css} CSS gzipped.
${PERFORMANCE.points.map(p => `- ${p}`).join('\n')}

Tips:
${PERFORMANCE.tips.map(p => `- ${p}`).join('\n')}

## Browser rendering
Chromium uses SVG backdrop displacement for bars, buttons and cards, and refracts a tinted live copy inside tab and segmented lenses. Safari and Firefox use translucent material, highlights and magnified live copies inside lenses (switch, slider, tab bar, segmented). Effects are not identical across browsers. The demo's large refraction lens uses WebGL.

## Questions
${FAQS.map(f => `### ${f.question}\n${f.answer}`).join('\n\n')}
`;

/** The llms.txt index (https://llmstxt.org): what this is, then where to read more. */
export const LLMS_TXT = `# Liquid Glass for the Web

> Apple-inspired liquid glass components for React and Next.js by Zaki Sheriff, published by The Atom. The npm package is @zakisheriff/liquid-glass (version ${PACKAGE_VERSION}). Open source under the MIT license, ${PERFORMANCE.js} of JavaScript and ${PERFORMANCE.css} of CSS gzipped, with no runtime dependencies.

Install with \`npm i @zakisheriff/liquid-glass\` and import \`@zakisheriff/liquid-glass/styles.css\` once. Components: ${COMPONENTS.map(c => c.name).join(', ')}. This is an independent web UI library, not an Apple product. Chromium refracts the live backdrop with SVG displacement; Safari and Firefox use translucent material and magnified live copies inside lenses. React and React DOM 17 or later are required.

## Documentation

- [Full documentation for language models](${SITE_URL}/llms-full.txt): Everything in one plain-text file: install, components, props, theming, performance, browser support and answers.
- [Documentation in Markdown](${SITE_URL}/docs.md): The guide as Markdown.
- [Readable documentation](${SITE_URL}/docs): The same guide in HTML.
- [Interactive component demo](${SITE_URL}/): Try buttons, switches, tab bars, segmented controls, sliders, search, menus and sheets.

## Source and package

- [Repository README](https://raw.githubusercontent.com/zakisheriff/Liquid-Glass/main/README.md): Usage examples and the full props reference.
- [npm package](${NPM_URL}): Published versions and installation.
- [Source code](${REPOSITORY}): Implementation, license and third-party notices.

## Optional

- [Author](https://github.com/zakisheriff): Zaki Sheriff.
- [Publisher](https://theatom.lk): The Atom.
`;

