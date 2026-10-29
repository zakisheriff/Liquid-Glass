/**
 * One guide per component: what it is, copy-paste examples for every
 * variant, and the full props table. The docs page, /docs.md and
 * llms-full.txt render this directly; `npm run readme` writes it into the
 * README's Components section, so the two never drift apart.
 *
 * Icons in the examples (`<PlusIcon />` and so on) stand for any React node,
 * such as an SVG icon component.
 */

export type Prop = { name: string; type: string; default?: string; description: string };
export type Example = { title: string; code: string };
export type Guide = {
  name: string;
  /** Anchor on the docs page and in the README. */
  id: string;
  title: string;
  summary: string;
  examples: Example[];
  props: Prop[];
  /** Extra props passed straight through to the underlying element. */
  passthrough?: string;
  notes?: string[];
};

const intensity: Prop = { name: 'intensity', type: 'number (1–10)', default: '5', description: 'Refraction strength, from subtle to heavy.' };

export const GUIDES: Guide[] = [
  {
    name: 'GlassButton',
    id: 'button',
    title: 'Button',
    summary: 'A pill, or a circle when it has an icon and no label. It swells under the finger, leans toward a drag and wobbles as it settles.',
    examples: [
      { title: 'Variants', code: `import { GlassButton } from '@zakisheriff/liquid-glass';

<GlassButton>Glass</GlassButton>
<GlassButton variant="clear">Clear</GlassButton>
<GlassButton variant="tinted">Tinted</GlassButton>
<GlassButton variant="filled">Filled</GlassButton>
<GlassButton variant="filled" tint="#af52de">Tinted filled</GlassButton>` },
      { title: 'Any colour', code: `<GlassButton variant="tinted" tint="#c2255c">Burgundy label</GlassButton>
<GlassButton variant="filled" tint="#af52de">Purple fill</GlassButton>` },
      { title: 'Destructive', code: `<GlassButton destructive>Delete</GlassButton>
<GlassButton variant="filled" destructive>Delete</GlassButton>` },
      { title: 'Icons', code: `{/* Icon with a label */}
<GlassButton icon={<PlusIcon />}>New note</GlassButton>

{/* Icon only: becomes a circle, so give it an accessible name */}
<GlassButton icon={<PlusIcon />} aria-label="Add" />` },
      { title: 'Sizes', code: `<GlassButton size="sm">Small</GlassButton>   {/* 36px */}
<GlassButton size="md">Medium</GlassButton>  {/* 44px, default */}
<GlassButton size="lg">Large</GlassButton>   {/* 52px */}` },
      { title: 'Handling clicks', code: `<GlassButton variant="filled" onClick={() => save()} disabled={saving}>
  Save
</GlassButton>` },
    ],
    props: [
      { name: 'variant', type: "'glass' | 'clear' | 'tinted' | 'filled'", default: "'glass'", description: 'Regular glass, see-through glass, glass with a coloured label, or a solid colour.' },
      { name: 'tint', type: 'string', default: 'accent blue', description: 'Any CSS colour. Colours the label for `tinted` and the fill for `filled`.' },
      { name: 'destructive', type: 'boolean', default: 'false', description: 'Red label, or a red fill with `filled`, for delete and other irreversible actions.' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height: 36, 44 or 52 px.' },
      { name: 'icon', type: 'ReactNode', description: 'Leading icon. With no children the button becomes a circle.' },
      { name: 'shimmer', type: 'boolean', default: 'true', description: 'Light bloom under the finger while pressed.' },
      { name: 'thickness', type: 'number (1–4)', default: '1', description: 'Rim bevel scale. Wider bevels bend more of the backdrop.' },
      intensity,
    ],
    passthrough: 'every `<button>` prop (`onClick`, `disabled`, `type`, `aria-*`, …)',
  },
  {
    name: 'GlassSwitch',
    id: 'switch',
    title: 'Toggle Switch',
    summary: 'An iOS toggle. On press the knob lifts into a clear lens that refracts the track. Tap it, or drag the knob with rubber-banding at the ends.',
    examples: [
      { title: 'Controlled', code: `import { useState } from 'react';
import { GlassSwitch } from '@zakisheriff/liquid-glass';

function WifiSetting() {
  const [on, setOn] = useState(true);
  return <GlassSwitch checked={on} onChange={setOn} aria-label="Wi-Fi" />;
}` },
      { title: 'Uncontrolled', code: `<GlassSwitch defaultChecked onChange={(on) => console.log(on)} aria-label="Bluetooth" />` },
      { title: 'Custom on colour', code: `<GlassSwitch checked={focus} onChange={setFocus} tint="#ff9f0a" aria-label="Focus" />` },
      { title: 'In a settings list, with a visible label', code: `<label className="setting">
  <span>Live Activities</span>
  <GlassSwitch checked={live} onChange={setLive} />
</label>` },
      { title: 'Disabled', code: `<GlassSwitch checked disabled aria-label="Managed by your organisation" />` },
    ],
    props: [
      { name: 'checked', type: 'boolean', description: 'On or off, when you control the state.' },
      { name: 'defaultChecked', type: 'boolean', description: 'Starting state, when the switch manages its own state.' },
      { name: 'onChange', type: '(checked: boolean) => void', description: 'Called with the new state after a tap or a drag.' },
      { name: 'tint', type: 'string', default: 'system green', description: 'On-state colour. Any CSS colour.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims the switch and ignores input.' },
      intensity,
    ],
    passthrough: 'other `<button>` props (`aria-label`, `id`, `className`, …)',
    notes: ['The switch is a `role="switch"` button: Space and Enter toggle it. Give it an `aria-label`, or wrap it in a `<label>` with visible text.'],
  },
  {
    name: 'GlassSlider',
    id: 'slider',
    title: 'Slider',
    summary: 'A thin iOS track whose thumb lifts into a lens that magnifies the rail, or a Control Center block that fills and stretches under the finger.',
    examples: [
      { title: 'Track with a lens thumb', code: `import { GlassSlider } from '@zakisheriff/liquid-glass';

const [volume, setVolume] = useState(40);
<GlassSlider value={volume} onChange={setVolume} aria-label="Volume" />` },
      { title: 'Control Center block', code: `<GlassSlider
  showThumb={false}
  value={brightness}
  onChange={setBrightness}
  icon={<SunIcon />}
  label="Display"
/>` },
      { title: 'Range, steps and colour', code: `{/* Snaps to 5 °C steps between 10 and 30 */}
<GlassSlider min={10} max={30} step={5} value={temp} onChange={setTemp} tint="#ff9f0a" aria-label="Temperature" />` },
    ],
    props: [
      { name: 'value', type: 'number', default: '0', description: 'Current value.' },
      { name: 'onChange', type: '(value: number) => void', description: 'Called while dragging, with the full-precision value.' },
      { name: 'min', type: 'number', default: '0', description: 'Lowest value.' },
      { name: 'max', type: 'number', default: '100', description: 'Highest value.' },
      { name: 'step', type: "number | 'any'", default: "'any'", description: 'Continuous by default. A number snaps to fixed increments.' },
      { name: 'showThumb', type: 'boolean', default: 'true', description: '`true`: thin track with a lens thumb. `false`: Control Center block.' },
      { name: 'icon', type: 'ReactNode', description: 'Icon inside the block slider.' },
      { name: 'label', type: 'string', description: 'Label inside the block slider. Its number is rounded for display.' },
      { name: 'tint', type: 'string', default: 'accent blue (white for blocks)', description: 'Fill colour.' },
      intensity,
    ],
    passthrough: 'other `<input type="range">` props (`aria-label`, `disabled`, `name`, …)',
    notes: ['Arrow keys, Page Up/Down, Home and End work as on a native range input.'],
  },
  {
    name: 'GlassSegmented',
    id: 'segmented',
    title: 'Segmented Control',
    summary: 'A row of choices. On press the whole control swells and the selection becomes a lens you can drag between segments.',
    examples: [
      { title: 'Text segments', code: `import { GlassSegmented } from '@zakisheriff/liquid-glass';

const [mode, setMode] = useState(0);
<GlassSegmented options={['Chat', 'Work', 'Study']} value={mode} onChange={setMode} aria-label="Mode" />` },
      { title: 'With icons', code: `<GlassSegmented
  options={[{ label: 'Light', icon: <SunIcon /> }, { label: 'Dark', icon: <MoonIcon /> }]}
  value={theme}
  onChange={setTheme}
  aria-label="Appearance"
/>` },
      { title: 'Compact', code: `<GlassSegmented size="sm" options={['Day', 'Week', 'Month']} value={range} onChange={setRange} />` },
    ],
    props: [
      { name: 'options', type: 'Array<string | { label, icon? }>', description: 'Segment labels, or label and icon pairs.' },
      { name: 'value', type: 'number', description: 'Index of the selected segment.' },
      { name: 'onChange', type: '(index: number) => void', description: 'Called with the index of the newly selected segment.' },
      { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Height: 28 or 36 px.' },
      intensity,
      { name: 'aria-label', type: 'string', description: 'Accessible name for the group.' },
      { name: 'className, style', type: '', description: 'Applied to the control.' },
    ],
    notes: ['Arrow keys, Home and End move the selection.'],
  },
  {
    name: 'GlassNav',
    id: 'tab-bar',
    title: 'Tab Bar',
    summary: 'A floating iOS 26 tab bar. The selection inflates into a lens you can drag across the tabs. Icons with labels, or icons only.',
    examples: [
      { title: 'Icons and Labels', code: `import { GlassNav } from '@zakisheriff/liquid-glass';

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
/>` },
      { title: 'Icons Only', code: `{/* Labels become each tab's accessible name */}
<GlassNav showLabels={false} activeIndex={tab} onChange={setTab} items={tabs} />` },
      { title: 'Tabs plus a separate search button', code: `<div style={{ display: 'flex', gap: 12 }}>
  <GlassNav activeIndex={tab} onChange={setTab} items={tabs} />
  <GlassButton icon={<SearchIcon />} aria-label="Search" size="lg" />
</div>` },
    ],
    props: [
      { name: 'items', type: 'Array<{ label: string; icon?: ReactNode }>', description: 'The tabs. Icons sit above labels.' },
      { name: 'activeIndex', type: 'number', default: '0', description: 'Index of the selected tab.' },
      { name: 'onChange', type: '(index: number) => void', description: 'Called when a tab is tapped, or when the lens is dragged onto one.' },
      { name: 'showLabels', type: 'boolean', default: 'true', description: '`false` shows icons only.' },
      intensity,
      { name: 'aria-label', type: 'string', description: 'Accessible name for the tab list.' },
      { name: 'className, style', type: '', description: 'Applied to the bar.' },
    ],
    notes: ['Arrow keys, Home and End move between tabs. Position the bar yourself, for example `position: fixed; bottom: 24px`.'],
  },
  {
    name: 'GlassMenu',
    id: 'menu',
    title: 'Menu',
    summary: 'A pull-down menu that grows out of its glass button and folds back into it with a jiggle. Slide a finger across the items to pick one.',
    examples: [
      { title: 'Actions', code: `import { GlassMenu } from '@zakisheriff/liquid-glass';

<GlassMenu
  icon={<EllipsisIcon />}
  aria-label="More"
  items={[
    { label: 'Share', icon: <ShareIcon />, onSelect: share },
    { label: 'Duplicate', icon: <CopyIcon />, onSelect: duplicate },
    { label: 'Delete', icon: <TrashIcon />, destructive: true, onSelect: remove },
  ]}
/>` },
      { title: 'Choices with a checkmark', code: `<GlassMenu
  icon={<SortIcon />}
  aria-label="Sort by"
  items={['Date', 'Name', 'Size'].map((sort) => ({
    label: sort,
    checked: sort === current,
    onSelect: () => setCurrent(sort),
  }))}
/>` },
      { title: 'Placement and size', code: `{/* Grows from the left edge of a small trigger, 260px wide */}
<GlassMenu icon={<EllipsisIcon />} aria-label="More" align="start" size="sm" width={260} items={items} />` },
    ],
    props: [
      { name: 'icon', type: 'ReactNode', description: 'Icon on the trigger button, such as an ellipsis.' },
      { name: 'items', type: 'Array<{ label, icon?, checked?, destructive?, disabled?, onSelect? }>', description: 'Menu rows. `checked` adds a trailing checkmark; `destructive` makes the label red.' },
      { name: 'aria-label', type: 'string', description: 'Accessible name for the trigger. Required.' },
      { name: 'align', type: "'start' | 'end'", default: "'end'", description: 'Edge of the trigger the menu grows from.' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Trigger size, as for GlassButton.' },
      { name: 'width', type: 'number', default: '230', description: 'Menu width in px.' },
      { name: 'check', type: 'ReactNode', description: 'Replaces the trailing checkmark icon.' },
      { name: 'className', type: 'string', description: 'Applied to the menu wrapper.' },
    ],
    notes: ['Escape or a tap outside closes the menu. Arrow keys move between items.'],
  },
  {
    name: 'GlassInput',
    id: 'input',
    title: 'Search and Text Field',
    summary: 'A glass text field with a leading icon, an optional trailing accessory and a clear button.',
    examples: [
      { title: 'Search', code: `import { GlassInput } from '@zakisheriff/liquid-glass';

const [query, setQuery] = useState('');
<GlassInput
  type="search"
  placeholder="Search"
  value={query}
  onChange={(event) => setQuery(event.target.value)}
  trailing={<MicIcon />}
  aria-label="Search"
/>` },
      { title: 'Text field with a label', code: `<GlassInput label="Name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />` },
      { title: 'Custom icon and clear behaviour', code: `<GlassInput
  icon={<MailIcon />}
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  onClear={() => setEmail('')}
  tint="#30d158"
/>` },
    ],
    props: [
      { name: 'type', type: 'string', default: "'text'", description: "Any input type. `'search'` adds a magnifier icon." },
      { name: 'value', type: 'string', description: 'Current text.' },
      { name: 'onChange', type: '(event) => void', description: 'Standard input change event.' },
      { name: 'placeholder', type: 'string', description: 'Hint shown while empty.' },
      { name: 'label', type: 'string', description: 'Small label above the field.' },
      { name: 'icon', type: 'ReactNode', description: 'Leading icon.' },
      { name: 'trailing', type: 'ReactNode', description: 'Trailing accessory, such as a microphone.' },
      { name: 'onClear', type: '() => void', description: 'Called by the clear button. Without it, clearing sends an empty `onChange`.' },
      { name: 'tint', type: 'string', description: 'Caret and focus glow colour.' },
      intensity,
    ],
    passthrough: 'every other `<input>` prop (`name`, `autoFocus`, `disabled`, …), and `ref` reaches the input',
  },
  {
    name: 'GlassCard',
    id: 'card',
    title: 'Card',
    summary: 'A refracting glass panel for grouping content and controls: frosted, or clear.',
    examples: [
      { title: 'Regular and clear', code: `import { GlassCard } from '@zakisheriff/liquid-glass';

<GlassCard>Frosted panel</GlassCard>
<GlassCard variant="clear">See-through panel</GlassCard>` },
      { title: 'Spacing, corners and tint', code: `<GlassCard padding="20px" radius="32px" tint="rgb(255 55 95 / 0.18)">
  <h3>Now playing</h3>
  <GlassSlider value={progress} onChange={seek} aria-label="Position" />
</GlassCard>` },
    ],
    props: [
      { name: 'variant', type: "'regular' | 'clear'", default: "'regular'", description: 'Frosted or see-through glass.' },
      { name: 'padding', type: 'string', default: "'24px'", description: 'Inner padding, any CSS length.' },
      { name: 'radius', type: 'string', default: "'28px'", description: 'Corner radius, any CSS length.' },
      { name: 'tint', type: 'string', description: 'CSS colour washed over the glass.' },
      { name: 'thickness', type: 'number (1–4)', default: '1', description: 'Rim bevel scale.' },
      intensity,
    ],
    passthrough: 'every `<div>` prop (`className`, `style`, `onClick`, …)',
  },
  {
    name: 'GlassSheet',
    id: 'sheet',
    title: 'Sheet',
    summary: 'A floating bottom sheet with a spring entrance. Drag or flick it down to dismiss. With detents it opens at half height and drags up to full screen.',
    examples: [
      { title: 'Fits its content', code: `import { GlassSheet, GlassButton } from '@zakisheriff/liquid-glass';

const [open, setOpen] = useState(false);
<GlassButton onClick={() => setOpen(true)}>Details</GlassButton>
<GlassSheet open={open} onClose={() => setOpen(false)} aria-label="Details">
  <p>Anything goes here.</p>
</GlassSheet>` },
      { title: 'Half height, then full screen', code: `<GlassSheet open={open} onClose={() => setOpen(false)} detents={['medium', 'large']} aria-label="Comments">
  {comments}
</GlassSheet>` },
      { title: 'Inside a container', code: `{/* Stays inside a positioned element (e.g. a phone mockup) without locking page scroll */}
const [frame, setFrame] = useState<HTMLDivElement | null>(null);
<div ref={setFrame} style={{ position: 'relative', height: 600, overflow: 'hidden' }}>
  <GlassSheet open={open} onClose={() => setOpen(false)} container={frame}>…</GlassSheet>
</div>` },
    ],
    props: [
      { name: 'open', type: 'boolean', description: 'Whether the sheet is shown.' },
      { name: 'onClose', type: '() => void', description: 'Called when the scrim is tapped, Escape is pressed or the sheet is swiped down.' },
      { name: 'detents', type: "Array<'medium' | 'large'>", description: "Resting heights. `['medium', 'large']` opens at half height. Unset: fits its content." },
      { name: 'container', type: 'HTMLElement | null', default: 'viewport', description: 'Positioned element to keep the sheet inside.' },
      { name: 'tint', type: 'string', description: 'CSS colour washed over the glass.' },
      { name: 'aria-label', type: 'string', description: 'Accessible name for the dialog.' },
      intensity,
    ],
  },
];

const cell = (text: string) => text.replace(/\|/g, '\\|');

/** The guides as Markdown, headed at `level` (2 for the README's ###). */
export function guidesMarkdown(level = 3) {
  const h = '#'.repeat(level);
  return GUIDES.map((g) => [
    `${h} ${g.title} · \`${g.name}\``,
    '',
    g.summary,
    '',
    ...g.examples.flatMap((e) => [`**${e.title}**`, '', '```tsx', e.code, '```', '']),
    '| Prop | Type | Default | Description |',
    '| --- | --- | --- | --- |',
    ...g.props.map((p) => `| \`${p.name}\` | ${p.type ? `\`${cell(p.type)}\`` : ''} | ${p.default ? `\`${cell(p.default)}\`` : ''} | ${cell(p.description)} |`),
    ...(g.passthrough ? ['', `Also accepts ${g.passthrough}.`] : []),
    ...(g.notes ?? []).flatMap((n) => ['', n]),
  ].join('\n')).join('\n\n');
}
