'use client';

import { Children, cloneElement, isValidElement, useRef, useState } from 'react';
import {
  GlassButton,
  GlassCard,
  GlassInput,
  GlassMenu,
  GlassSegmented,
  GlassSheet,
  GlassSlider,
  GlassSwitch,
  type GlassSliderProps,
} from '@zakisheriff/liquid-glass';
import { Cover } from './art';
import { Bookmark, Check, Compass, Ellipsis, Grid, Heart, HeartFill, MapIcon, Mic, Note, Person, Pin, Plus, Search, Share, Speaker, Star, Sun } from './icons';
import { AppDock } from './AppDock';
import { PreviewThemeContext, PreviewThemeToggle, usePreviewMode } from './PreviewTheme';
import { SheetFrame } from './SheetFrame';
import { PreviewMorphContext, usePreviewChange, usePreviewMorph } from './PreviewMorph';

function Tile({
  title,
  wide,
  dark,
  options,
  children,
}: {
  title: string;
  wide?: boolean;
  dark?: boolean;
  /** Live options shown under the title. */
  options?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [mode, setMode] = usePreviewMode();
  const { ref: stage, morph } = usePreviewMorph();
  return (
    <PreviewThemeContext.Provider value={mode}>
    <PreviewMorphContext.Provider value={morph}>
    <article data-theme={mode} className={['tile preview-scope', wide ? 'tile--wide' : '', dark ? 'tile--dark' : ''].join(' ')}>
      <header className="tile__copy">
        <h2 className="tile__title">{title}</h2>
        {options && <div className="tile__options">{options}</div>}
      </header>
      <div ref={stage} className="tile__stage">{Children.map(children, (child) => {
        if (!isValidElement<React.HTMLAttributes<HTMLDivElement> & { 'data-theme'?: string }>(child) || !child.props.className?.split(' ').includes('stage')) return child;
        return cloneElement(child, {
          className: `${child.props.className} preview-scope`,
          'data-theme': mode,
          children: <><PreviewThemeToggle label={title} mode={mode} onChange={setMode} />{child.props.children}</>,
        });
      })}</div>
    </article>
    </PreviewMorphContext.Provider>
    </PreviewThemeContext.Provider>
  );
}

/** A tile option, shown with the library's own segmented control. */
function Choice<T extends string | number>({ label, options, value, onChange }: {
  label: string;
  options: Array<T | { value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  const change = usePreviewChange();
  const items = options.map((option) => (typeof option === 'object' ? option : { value: option, label: String(option) }));
  return (
    <div className="choice">
      <span>{label}</span>
      <GlassSegmented
        size="sm"
        options={items.map((item) => item.label)}
        value={Math.max(0, items.findIndex((item) => item.value === value))}
        onChange={(index) => change(() => onChange(items[index].value))}
        aria-label={label}
      />
    </div>
  );
}

const TINTS = [
  { value: 'green', label: 'Green', color: undefined },
  { value: 'blue', label: 'Blue', color: '#0a84ff' },
  { value: 'orange', label: 'Orange', color: '#ff9f0a' },
  { value: 'pink', label: 'Pink', color: '#ff375f' },
] as const;
type Tint = (typeof TINTS)[number]['value'];
const tintColor = (tint: Tint) => TINTS.find((t) => t.value === tint)?.color;

function SwitchTile() {
  const [rows, setRows] = useState([true, false, true]);
  const [tint, setTint] = useState<Tint>('green');
  return (
    <Tile title="Switch" options={<Choice label="Tint" options={TINTS.map(({ value, label }) => ({ value, label }))} value={tint} onChange={setTint} />}>
      <div className="stage stage--sunset">
        <GlassCard className="stage__list" padding="6px 18px" radius="26px">
          {['Wi-Fi', 'Use Mobile Data', 'Live Activities'].map((label, i) => (
            <div key={label} className="setting">
              <span className="setting__label">{label}</span>
              <GlassSwitch
                aria-label={label}
                checked={rows[i]}
                tint={tintColor(tint)}
                onChange={(on) => setRows((r) => r.map((v, j) => (j === i ? on : v)))}
              />
            </div>
          ))}
        </GlassCard>
      </div>
    </Tile>
  );
}

const TAB_POOL = [
  { label: 'Explore', icon: <Compass /> },
  { label: 'Saved', icon: <Bookmark /> },
  { label: 'Library', icon: <Grid /> },
  { label: 'Music', icon: <Note /> },
  { label: 'Places', icon: <MapIcon /> },
  { label: 'Profile', icon: <Person /> },
];
const SEARCH_TAB = { label: 'Search', icon: <Search /> };

function TabTile() {
  const [tab, setTab] = useState(0);
  const [count, setCount] = useState(4);
  const [layout, setLayout] = useState<'bar' | 'split'>('bar');
  const [labels, setLabels] = useState<'show' | 'hide'>('show');
  const split = layout === 'split';
  // A bar ends with its Search tab; a split dock moves Search into its own circle.
  const items = split ? TAB_POOL.slice(0, count) : [...TAB_POOL.slice(0, count - 1), SEARCH_TAB];
  const selected = Math.min(tab, items.length - 1);
  const width = count * (labels === 'show' ? 86 : 70) + (split ? 72 : 0);
  return (
    <Tile
      title="Tab Bar"
      options={<>
        <Choice label="Tabs" options={[2, 3, 4, 5, 6]} value={count} onChange={setCount} />
        <Choice label="Layout" options={[{ value: 'bar', label: 'Bar' }, { value: 'split', label: 'Tabs + Button' }]} value={layout} onChange={setLayout} />
        <Choice label="Labels" options={[{ value: 'show', label: 'Icons + Labels' }, { value: 'hide', label: 'Icons Only' }]} value={labels} onChange={setLabels} />
      </>}
    >
      <div className="stage stage--gradient" style={{ '--gradient-hue': `${(selected * 64) % 360}deg` } as React.CSSProperties}>
        <div className="stage__gradient" aria-hidden="true" />
        <AppDock
          showLabels={labels === 'show'}
          tab={selected}
          onChange={setTab}
          items={items}
          trailing={split ? { label: 'Search', icon: <Search /> } : undefined}
          style={{ maxWidth: `min(${width}px, calc(100% - 28px))` }}
        />
      </div>
    </Tile>
  );
}

const RANGES = ['Day', 'Week', 'Month', 'Year', 'All'];

function SegmentTile() {
  const [value, setValue] = useState(0);
  const [size, setSize] = useState(1);
  const [count, setCount] = useState(4);
  const [scale, setScale] = useState<'md' | 'sm'>('md');
  return (
    <Tile
      title="Segmented"
      options={<>
        <Choice label="Segments" options={[2, 3, 4, 5]} value={count} onChange={setCount} />
        <Choice label="Size" options={[{ value: 'md', label: 'Regular' }, { value: 'sm', label: 'Small' }]} value={scale} onChange={setScale} />
      </>}
    >
      <div className="stage stage--type">
        <div className="stage__column">
          <GlassSegmented options={['Chat', 'Work']} value={value} onChange={setValue} size={scale} style={{ width: `${2 * (scale === 'sm' ? 64 : 72) + 8}px` }} aria-label="Mode" />
          <GlassSegmented options={RANGES.slice(0, count)} value={Math.min(size, count - 1)} onChange={setSize} size={scale} style={{ width: `${count * (scale === 'sm' ? 64 : 72) + 8}px` }} aria-label="Range" />
        </div>
      </div>
    </Tile>
  );
}

// Keep each controlled input's state local. Scrubbing one control must not
// rerender the other controls or rebuild the wallpaper behind their glass.
function PreviewSlider({ initialValue, onValue, ...props }: Omit<GlassSliderProps, 'value' | 'onChange'> & {
  initialValue: number;
  onValue: (value: number) => void;
}) {
  const [value, setValue] = useState(initialValue);
  return <GlassSlider {...props} value={value} onChange={(next) => {
    setValue(next);
    onValue(next);
  }} />;
}

function SliderTile() {
  const backdrop = useRef<HTMLDivElement>(null);
  const [tint, setTint] = useState<Tint>('blue');
  return (
    <Tile title="Slider" options={<Choice label="Tint" options={TINTS.map(({ value, label }) => ({ value, label }))} value={tint} onChange={setTint} />}>
      <div className="stage stage--aurora">
        <div ref={backdrop} className="stage__slider-backdrop" aria-hidden="true">
          <div className="stage__slider-art" />
          <div className="stage__slider-color" />
          <div className="stage__slider-shade" />
        </div>
        <GlassCard className="stage__mixer" padding="20px" radius="28px">
          <PreviewSlider initialValue={64} onValue={(v) => backdrop.current?.style.setProperty('--slider-shade', String((1 - v / 100) * 0.6))} showThumb={false} icon={<Sun size={18} />} label="Display" />
          <PreviewSlider initialValue={38} onValue={(v) => backdrop.current?.style.setProperty('--slider-color', String(v / 100 * 0.25))} showThumb={false} icon={<Speaker size={18} />} label="Sound" />
          <PreviewSlider initialValue={52} onValue={(v) => backdrop.current?.style.setProperty('--slider-pan', `${(v - 50) * 0.2}%`)} tint={tint === 'green' ? '#30d158' : tintColor(tint)} aria-label="Balance" />
        </GlassCard>
      </div>
    </Tile>
  );
}

function ButtonTile() {
  const [liked, setLiked] = useState(false);
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const icon = size === 'sm' ? 18 : size === 'md' ? 20 : 22;
  return (
    <Tile
      title="Buttons"
      options={<Choice label="Size" options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} value={size} onChange={setSize} />}
    >
      <div className="stage stage--stripes">
        <div className="stage__buttons">
          <div className="stage__row">
            <GlassButton size={size} icon={<Plus size={icon} />} aria-label="Add" />
            <GlassButton
              size={size}
              icon={liked ? <HeartFill size={icon} /> : <Heart size={icon} />}
              aria-label="Like"
              tint={liked ? '#ff375f' : undefined}
              onClick={() => setLiked((v) => !v)}
            />
            <GlassButton size={size} icon={<Share size={icon} />} aria-label="Share" />
          </div>
          <div className="stage__row">
            <GlassButton size={size}>Glass</GlassButton>
            <GlassButton size={size} variant="filled">Filled</GlassButton>
            <GlassButton size={size} variant="tinted">Tinted</GlassButton>
          </div>
          <div className="stage__row">
            <GlassButton size={size} variant="tinted-filled" tint="#af52de">
              Tinted filled
            </GlassButton>
            <GlassButton size={size} variant="clear">Clear</GlassButton>
          </div>
          <div className="stage__row">
            <GlassButton size={size} destructive>Destructive</GlassButton>
            <GlassButton size={size} variant="filled" destructive>
              Destructive filled
            </GlassButton>
          </div>
        </div>
      </div>
    </Tile>
  );
}

function SearchTile() {
  const [query, setQuery] = useState('');
  return (
    <Tile title="Search">
      <div className="stage stage--ocean">
        <div className="stage__search">
          <GlassInput
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            trailing={<Mic size={18} />}
            aria-label="Search preview"
          />
        </div>
      </div>
    </Tile>
  );
}

function SheetTile() {
  const [open, setOpen] = useState(false);
  const [notify, setNotify] = useState(true);
  const [rate, setRate] = useState(60);
  return (
    <Tile title="Sheet">
      <div className="stage stage--candy" style={{ backgroundPosition: `center ${rate}%`, backgroundSize: 'auto 160%' }}>
        <GlassButton size="lg" variant="filled" onClick={() => setOpen(true)}>
          Open Sheet
        </GlassButton>
      </div>
      <GlassSheet open={open} onClose={() => setOpen(false)} detents={['medium', 'large']} aria-label="Now playing">
        <SheetFrame footer={<GlassButton size="lg" onClick={() => setOpen(false)} style={{ width: '100%' }}>Done</GlassButton>}>
        <div className="sheet-demo">
          <Cover index={2} className="sheet-demo__art" />
          <h3>Bloom</h3>
          <p>Iris Vale</p>
          <GlassSlider value={rate} onChange={setRate} aria-label="Position" />
          <div className="setting">
            <span className="setting__label">Notify me</span>
            <GlassSwitch checked={notify} onChange={setNotify} aria-label="Notify me" />
          </div>
        </div>
        </SheetFrame>
      </GlassSheet>
    </Tile>
  );
}

const MENU_ITEMS = [
  { label: 'View as Gallery', icon: <Grid size={18} /> },
  { label: 'Select Notes', icon: <Check size={18} /> },
  { label: 'Pin Note', icon: <Pin size={18} /> },
  { label: 'Favourite', icon: <Star size={18} /> },
  { label: 'Share', icon: <Share size={18} /> },
];

const NOTES = [
  { title: 'Trip to Big Sur', text: 'Bixby Bridge at 5, dinner in Carmel', day: 'Sat' },
  { title: 'Groceries', text: 'Oat milk, limes, coffee beans', day: 'Fri' },
  { title: 'Design review', text: 'Soften the menu blur, check dark mode', day: 'Thu' },
  { title: 'Ideas', text: 'Glass widgets for the home screen', day: 'Mon' },
];

function MenuTile() {
  const [count, setCount] = useState(3);
  const [side, setSide] = useState<'end' | 'start'>('end');
  const [picked, setPicked] = useState(-1);
  // What the menu picks shows up in the notes below it.
  const choice = MENU_ITEMS[picked]?.label;
  return (
    <Tile
      title="Menu"
      options={<>
        <Choice label="Items" options={[2, 3, 4, 5]} value={count} onChange={setCount} />
        <Choice label="Button" options={[{ value: 'start', label: 'Left' }, { value: 'end', label: 'Right' }]} value={side} onChange={setSide} />
      </>}
    >
      <div className="stage stage--menu">
        <div>
          <div className="stage__toolbar" data-side={side}>
            <h3>Notes</h3>
            <GlassMenu
              icon={<Ellipsis size={20} />}
              aria-label="Note options"
              align={side}
              check={<Check size={16} />}
              items={MENU_ITEMS.slice(0, count).map((item, i) => ({ ...item, checked: i === picked, onSelect: () => setPicked(i) }))}
            />
          </div>
          <ul className="stage__notes" data-view={choice === 'View as Gallery' ? 'gallery' : 'list'}>
            {NOTES.map((note, i) => (
              <li key={note.title}>
                {choice === 'Select Notes' && <span className="stage__select" data-on={i === 0 ? '' : undefined} aria-hidden="true" />}
                <span className="stage__note">
                  <strong>{note.title}</strong>
                  <span>{note.text}</span>
                </span>
                <span className="stage__day">
                  {i === 0 && choice === 'Pin Note' && <Pin size={13} />}
                  {i === 0 && choice === 'Favourite' && <Star size={13} />}
                  {note.day}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Tile>
  );
}

export function Tiles() {
  return (
    <section className="tiles" id="components">
      <header className="section-head tiles__head">
        <h2>Components</h2>
      </header>
      <SwitchTile />
      <TabTile />
      <SegmentTile />
      <SliderTile />
      <ButtonTile />
      <SearchTile />
      <MenuTile />
      <SheetTile />
    </section>
  );
}
