'use client';

import { useState, type ReactNode } from 'react';
import {
  GlassButton,
  GlassCard,
  GlassInput,
  GlassMenu,
  GlassNav,
  GlassSegmented,
  GlassSheet,
  GlassSlider,
  GlassSwitch,
} from '@zakisheriff/liquid-glass';
import { Bookmark, Check, Close, Compass, Copy, Ellipsis, Grid, Heart, Menu, Mic, Moon, Note, Plus, Search, Share, Star, Sun } from './icons';

const TABS = [
  { label: 'Home', icon: <Compass size={22} /> },
  { label: 'Saved', icon: <Bookmark size={22} /> },
  { label: 'Library', icon: <Grid size={22} /> },
  { label: 'Search', icon: <Search size={22} /> },
];

function Buttons() {
  return <>
    <GlassButton>Glass</GlassButton>
    <GlassButton variant="clear">Clear</GlassButton>
    <GlassButton variant="tinted">Tinted</GlassButton>
    <GlassButton variant="filled">Filled</GlassButton>
  </>;
}

function Clicks() {
  const [saving, setSaving] = useState(false);
  return (
    <GlassButton variant="filled" disabled={saving} onClick={() => { setSaving(true); window.setTimeout(() => setSaving(false), 1200); }}>
      {saving ? 'Saving…' : 'Save'}
    </GlassButton>
  );
}

function Switch({ tint, start = true }: { tint?: string; start?: boolean }) {
  const [on, setOn] = useState(start);
  return <GlassSwitch checked={on} onChange={setOn} tint={tint} aria-label="Example switch" />;
}

function SettingRow() {
  const [on, setOn] = useState(true);
  return (
    <GlassCard className="docs__preview-card" padding="6px 18px" radius="24px">
      <label className="setting"><span className="setting__label">Live Activities</span><GlassSwitch checked={on} onChange={setOn} /></label>
    </GlassCard>
  );
}

function Slider(props: { block?: boolean; ranged?: boolean }) {
  const [value, setValue] = useState(props.ranged ? 20 : props.block ? 64 : 40);
  if (props.block) return <GlassSlider showThumb={false} value={value} onChange={setValue} icon={<Sun size={18} />} label="Display" />;
  if (props.ranged) return <GlassSlider min={10} max={30} step={5} value={value} onChange={setValue} tint="#ff9f0a" aria-label="Temperature" />;
  return <GlassSlider value={value} onChange={setValue} aria-label="Volume" />;
}

function Segmented({ kind }: { kind: 'text' | 'icons' | 'compact' }) {
  const [value, setValue] = useState(0);
  if (kind === 'icons') {
    return <GlassSegmented options={[{ label: 'Light', icon: <Sun size={16} /> }, { label: 'Dark', icon: <Moon size={16} /> }]} value={value} onChange={setValue} aria-label="Appearance" />;
  }
  if (kind === 'compact') return <GlassSegmented size="sm" options={['Day', 'Week', 'Month']} value={value} onChange={setValue} aria-label="Range" />;
  return <GlassSegmented options={['Chat', 'Work', 'Study']} value={value} onChange={setValue} aria-label="Mode" />;
}

function Tabs({ labels = true, search = false }: { labels?: boolean; search?: boolean }) {
  const [tab, setTab] = useState(0);
  const items = search ? TABS.slice(0, 3) : TABS;
  return (
    <div className="docs__preview-row">
      <GlassNav activeIndex={tab} onChange={setTab} showLabels={labels} items={items} aria-label="Sections" />
      {search && <GlassButton icon={<Search size={22} />} aria-label="Search" size="lg" />}
    </div>
  );
}

function Menus({ kind }: { kind: 'actions' | 'choices' | 'placement' }) {
  const [sort, setSort] = useState('Date');
  if (kind === 'choices') {
    return <GlassMenu icon={<Menu size={18} />} aria-label="Sort by" items={['Date', 'Name', 'Size'].map((label) => ({ label, checked: label === sort, onSelect: () => setSort(label) }))} />;
  }
  const items = [
    { label: 'Share', icon: <Share size={17} /> },
    { label: 'Duplicate', icon: <Copy size={17} /> },
    { label: 'Favourite', icon: <Star size={17} /> },
    { label: 'Delete', icon: <Close size={17} />, destructive: true },
  ];
  if (kind === 'placement') return <GlassMenu icon={<Ellipsis size={18} />} aria-label="More" align="start" size="sm" width={260} items={items} />;
  return <GlassMenu icon={<Ellipsis size={18} />} aria-label="More" items={items} />;
}

function Inputs({ kind }: { kind: 'search' | 'label' | 'icon' }) {
  const [text, setText] = useState(kind === 'icon' ? 'hello@example.com' : '');
  if (kind === 'label') return <GlassInput label="Name" placeholder="Your name" value={text} onChange={(event) => setText(event.target.value)} />;
  if (kind === 'icon') {
    return <GlassInput icon={<Heart size={17} />} type="email" placeholder="Email" value={text} onChange={(event) => setText(event.target.value)} onClear={() => setText('')} tint="#30d158" aria-label="Email" />;
  }
  return <GlassInput type="search" placeholder="Search" value={text} onChange={(event) => setText(event.target.value)} trailing={<Mic size={17} />} aria-label="Search" />;
}

function Sheet({ detents, label }: { detents?: boolean; label: string }) {
  const [open, setOpen] = useState(false);
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setFrame} className="docs__preview-frame">
      <GlassButton variant="filled" onClick={() => setOpen(true)}>{label}</GlassButton>
      <GlassSheet open={open} onClose={() => setOpen(false)} container={frame} detents={detents ? ['medium', 'large'] : undefined} aria-label={label}>
        <div className="docs__preview-sheet">
          <strong>{label}</strong>
          <p>{detents ? 'Drag up for full height, down to close.' : 'Swipe down or tap outside to close.'}</p>
          <GlassButton onClick={() => setOpen(false)}>Done</GlassButton>
        </div>
      </GlassSheet>
    </div>
  );
}

/** Live versions of each docs example, keyed by guide id and example title. */
const PREVIEWS: Record<string, () => ReactNode> = {
  'button:Variants': () => <Buttons />,
  'button:Any colour': () => <>
    <GlassButton variant="tinted" tint="#ff9f0a">Orange label</GlassButton>
    <GlassButton variant="filled" tint="#af52de">Purple fill</GlassButton>
  </>,
  'button:Destructive': () => <>
    <GlassButton destructive>Delete</GlassButton>
    <GlassButton variant="filled" destructive>Delete</GlassButton>
  </>,
  'button:Icons': () => <>
    <GlassButton icon={<Plus size={18} />}>New note</GlassButton>
    <GlassButton icon={<Plus size={18} />} aria-label="Add" />
  </>,
  'button:Sizes': () => <>
    <GlassButton size="sm">Small</GlassButton>
    <GlassButton size="md">Medium</GlassButton>
    <GlassButton size="lg">Large</GlassButton>
  </>,
  'button:Handling clicks': () => <Clicks />,
  'switch:Controlled': () => <Switch />,
  'switch:Uncontrolled': () => <GlassSwitch defaultChecked aria-label="Bluetooth" />,
  'switch:Custom on colour': () => <Switch tint="#ff9f0a" />,
  'switch:In a settings list, with a visible label': () => <SettingRow />,
  'switch:Disabled': () => <GlassSwitch checked disabled aria-label="Managed by your organisation" />,
  'slider:Track with a lens thumb': () => <Slider />,
  'slider:Control Center block': () => <Slider block />,
  'slider:Range, steps and colour': () => <Slider ranged />,
  'segmented:Text segments': () => <Segmented kind="text" />,
  'segmented:With icons': () => <Segmented kind="icons" />,
  'segmented:Compact': () => <Segmented kind="compact" />,
  'tab-bar:Icons and labels': () => <Tabs />,
  'tab-bar:Icons only': () => <Tabs labels={false} />,
  'tab-bar:Tabs plus a separate search button': () => <Tabs search />,
  'menu:Actions': () => <Menus kind="actions" />,
  'menu:Choices with a checkmark': () => <Menus kind="choices" />,
  'menu:Placement and size': () => <Menus kind="placement" />,
  'input:Search': () => <Inputs kind="search" />,
  'input:Text field with a label': () => <Inputs kind="label" />,
  'input:Custom icon and clear behaviour': () => <Inputs kind="icon" />,
  'card:Regular and clear': () => <>
    <GlassCard className="docs__preview-card">Frosted panel</GlassCard>
    <GlassCard className="docs__preview-card" variant="clear">See-through panel</GlassCard>
  </>,
  'card:Spacing, corners and tint': () => (
    <GlassCard className="docs__preview-card" padding="20px" radius="32px" tint="rgb(255 55 95 / 0.18)">
      <strong>Now playing</strong>
      <Slider />
      <span className="docs__preview-meta"><Note size={14} /> Sunset mix <Check size={14} /></span>
    </GlassCard>
  ),
  'sheet:Fits its content': () => <Sheet label="Details" />,
  'sheet:Half height, then full screen': () => <Sheet detents label="Comments" />,
  'sheet:Inside a container': () => <Sheet label="Inside this box" />,
};

/** The example running live over a wallpaper, above its code. */
export function DocsPreview({ guide, example }: { guide: string; example: string }) {
  const render = PREVIEWS[`${guide}:${example}`];
  if (!render) return null;
  const tall = guide === 'sheet' || guide === 'menu';
  return (
    <div className="docs__preview" data-tall={tall ? '' : undefined} aria-label={`Live example: ${example}`}>
      {render()}
    </div>
  );
}
