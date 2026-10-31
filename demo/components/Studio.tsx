'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GlassButton, GlassCard, GlassInput, GlassMenu, GlassNav, GlassSegmented, GlassSlider, GlassSwitch } from '@zakisheriff/liquid-glass';
import { Bookmark, Check, Compass, Ellipsis, Heart, HeartFill, Person, Pin, Play, Plus, Search, Share, Star, Suitcase, Sun } from './icons';

/**
 * A blank workspace for screen recordings. Add components, drag them where you
 * want them, then hide the tools (H) so only your layout is on screen.
 */

type Kind = 'switch' | 'tabbar' | 'segmented' | 'slider' | 'button' | 'search' | 'card' | 'menu';
type Cfg = Record<string, string | number | boolean>;
interface Item {
  id: string;
  kind: Kind;
  /** Offset in px from the centre of the canvas. */
  x: number;
  y: number;
  cfg: Cfg;
}
type Theme = 'light' | 'dark';

const num = (v: string | number | boolean) => Number(v);
const str = (v: string | number | boolean) => String(v);

const KINDS: Array<{ kind: Kind; label: string }> = [
  { kind: 'switch', label: 'Switch' },
  { kind: 'tabbar', label: 'Tab bar' },
  { kind: 'segmented', label: 'Segmented' },
  { kind: 'slider', label: 'Slider' },
  { kind: 'button', label: 'Button' },
  { kind: 'search', label: 'Search field' },
  { kind: 'card', label: 'Card' },
  { kind: 'menu', label: 'Menu' },
];

const DEFAULTS: Record<Kind, Cfg> = {
  switch: { on: true, tint: '#34c759', strength: 5 },
  tabbar: { count: 4, labels: true, tab: 0, strength: 5 },
  segmented: { count: 3, small: false, index: 0, strength: 5 },
  slider: { thumb: true, value: 60, strength: 5 },
  button: { label: 'Continue', variant: 'glass', size: 'md', tint: '#0a84ff', icon: 'none', strength: 5 },
  search: { placeholder: 'Search', value: '', strength: 5 },
  card: { title: 'Made of glass', text: 'Cards, controls and sheets, all using the same material.', strength: 5 },
  menu: { picked: -1 },
};

const TABS = [
  { label: 'Explore', icon: <Compass /> },
  { label: 'Saved', icon: <Bookmark /> },
  { label: 'Favorites', icon: <HeartFill /> },
  { label: 'Trips', icon: <Suitcase /> },
  { label: 'Profile', icon: <Person /> },
];
const SEGMENTS = ['Design', 'Code', 'Preview', 'Docs'];
const MENU = [
  { label: 'Pin', icon: <Pin size={18} /> },
  { label: 'Favourite', icon: <Star size={18} /> },
  { label: 'Share', icon: <Share size={18} /> },
  { label: 'Like', icon: <Heart size={18} /> },
];
const ICONS: Record<string, React.ReactNode> = {
  none: null,
  heart: <Heart size={20} />,
  plus: <Plus size={20} />,
  share: <Share size={20} />,
  play: <Play size={20} />,
  search: <Search size={20} />,
  star: <Star size={20} />,
};
const TINTS = ['#34c759', '#0a84ff', '#ff9f0a', '#ff375f', '#ff453a', '#bf5af2'];
const WALLPAPERS = ['coral', 'violet', 'amber', 'rose', 'mint', 'indigo'];
const VARIANTS = [
  { value: 'glass', label: 'Glass' },
  { value: 'clear', label: 'Clear' },
  { value: 'tinted', label: 'Tinted' },
  { value: 'tinted-filled', label: 'Tinted filled' },
  { value: 'filled', label: 'Filled' },
  { value: 'destructive', label: 'Destructive' },
];

type ButtonVariant = React.ComponentProps<typeof GlassButton>['variant'];

function Body({ item, patch }: { item: Item; patch: (cfg: Cfg) => void }) {
  const c = item.cfg;
  const intensity = num(c.strength);
  switch (item.kind) {
    case 'switch':
      return <GlassSwitch checked={!!c.on} onChange={(on) => patch({ on })} tint={str(c.tint)} intensity={intensity} aria-label="Switch" />;
    case 'tabbar': {
      const tabs = TABS.slice(0, num(c.count));
      return <GlassNav items={tabs} activeIndex={Math.min(num(c.tab), tabs.length - 1)} onChange={(tab) => patch({ tab })} showLabels={!!c.labels} intensity={intensity} aria-label="Tabs" />;
    }
    case 'segmented': {
      const options = SEGMENTS.slice(0, num(c.count));
      return <GlassSegmented options={options} value={Math.min(num(c.index), options.length - 1)} onChange={(index) => patch({ index })} size={c.small ? 'sm' : 'md'} intensity={intensity} aria-label="Segments" />;
    }
    case 'slider':
      return (
        <div style={{ width: 280 }}>
          <GlassSlider value={num(c.value)} min={0} max={100} onChange={(value) => patch({ value })} showThumb={!!c.thumb} icon={<Sun size={18} />} label="Display" intensity={intensity} aria-label="Slider" />
        </div>
      );
    case 'button':
      return (
        <GlassButton variant={str(c.variant) as ButtonVariant} size={str(c.size) as 'sm' | 'md' | 'lg'} tint={str(c.tint)} icon={ICONS[str(c.icon)]} intensity={intensity}>
          {str(c.label) || undefined}
        </GlassButton>
      );
    case 'search':
      return (
        <div style={{ width: 280 }}>
          <GlassInput type="search" placeholder={str(c.placeholder)} value={str(c.value)} onChange={(e) => patch({ value: e.target.value })} intensity={intensity} aria-label="Search" />
        </div>
      );
    case 'card':
      return (
        <GlassCard style={{ width: 280 }} padding="20px" intensity={intensity}>
          <strong style={{ display: 'block', marginBottom: 6, fontSize: 17 }}>{str(c.title)}</strong>
          <span style={{ color: 'var(--lg-fg-muted)' }}>{str(c.text)}</span>
        </GlassCard>
      );
    case 'menu': {
      const picked = num(c.picked);
      return (
        <GlassMenu
          icon={<Ellipsis size={20} />}
          aria-label="Menu"
          align="start"
          check={<Check size={16} />}
          items={MENU.map((m, i) => ({ ...m, checked: i === picked, onSelect: () => patch({ picked: i }) }))}
        />
      );
    }
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="studio__field">
      <span>{label}</span>
      {children}
    </div>
  );
}

function Seg<T extends string | number | boolean>({ options, value, onChange }: { options: Array<{ value: T; label: string }>; value: T; onChange: (v: T) => void }) {
  return (
    <div className="studio__seg">
      {options.map((o) => (
        <button key={String(o.value)} type="button" data-on={o.value === value || undefined} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Swatches({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="studio__swatches">
      {TINTS.map((t) => (
        <button key={t} type="button" aria-label={t} style={{ background: t }} data-on={t === value || undefined} onClick={() => onChange(t)} />
      ))}
    </div>
  );
}

function Inspector({ item, patch }: { item: Item; patch: (cfg: Cfg) => void }) {
  const c = item.cfg;
  const set = (key: string) => (v: string | number | boolean) => patch({ [key]: v });
  return (
    <>
      {item.kind === 'switch' && (
        <>
          <Field label="Colour"><Swatches value={str(c.tint)} onChange={set('tint')} /></Field>
          <Field label="State"><Seg options={[{ value: true, label: 'On' }, { value: false, label: 'Off' }]} value={!!c.on} onChange={set('on')} /></Field>
        </>
      )}
      {item.kind === 'tabbar' && (
        <>
          <Field label="Tabs"><Seg options={[2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))} value={num(c.count)} onChange={set('count')} /></Field>
          <Field label="Labels"><Seg options={[{ value: true, label: 'Show' }, { value: false, label: 'Hide' }]} value={!!c.labels} onChange={set('labels')} /></Field>
        </>
      )}
      {item.kind === 'segmented' && (
        <>
          <Field label="Segments"><Seg options={[2, 3, 4].map((n) => ({ value: n, label: String(n) }))} value={num(c.count)} onChange={set('count')} /></Field>
          <Field label="Size"><Seg options={[{ value: false, label: 'Regular' }, { value: true, label: 'Small' }]} value={!!c.small} onChange={set('small')} /></Field>
        </>
      )}
      {item.kind === 'slider' && (
        <Field label="Style"><Seg options={[{ value: true, label: 'Thumb' }, { value: false, label: 'Block' }]} value={!!c.thumb} onChange={set('thumb')} /></Field>
      )}
      {item.kind === 'button' && (
        <>
          <Field label="Label"><input className="studio__input" value={str(c.label)} onChange={(e) => patch({ label: e.target.value })} /></Field>
          <Field label="Style">
            <select className="studio__input" value={str(c.variant)} onChange={(e) => patch({ variant: e.target.value })}>
              {VARIANTS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </Field>
          <Field label="Size"><Seg options={[{ value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }]} value={str(c.size)} onChange={set('size')} /></Field>
          <Field label="Colour"><Swatches value={str(c.tint)} onChange={set('tint')} /></Field>
          <Field label="Icon">
            <select className="studio__input" value={str(c.icon)} onChange={(e) => patch({ icon: e.target.value })}>
              {Object.keys(ICONS).map((k) => <option key={k} value={k}>{k[0].toUpperCase() + k.slice(1)}</option>)}
            </select>
          </Field>
        </>
      )}
      {item.kind === 'search' && (
        <Field label="Placeholder"><input className="studio__input" value={str(c.placeholder)} onChange={(e) => patch({ placeholder: e.target.value })} /></Field>
      )}
      {item.kind === 'card' && (
        <>
          <Field label="Title"><input className="studio__input" value={str(c.title)} onChange={(e) => patch({ title: e.target.value })} /></Field>
          <Field label="Text"><input className="studio__input" value={str(c.text)} onChange={(e) => patch({ text: e.target.value })} /></Field>
        </>
      )}
      {item.kind !== 'menu' && (
        <Field label={`Glass strength ${num(c.strength)}`}>
          <input className="studio__range" type="range" min={1} max={10} step={1} value={num(c.strength)} onChange={(e) => patch({ strength: Number(e.target.value) })} />
        </Field>
      )}
    </>
  );
}

const STORAGE = 'lg-studio';
let counter = 0;
const newId = () => `i${Date.now().toString(36)}${(counter++).toString(36)}`;

export function Studio() {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [bg, setBg] = useState('plain');
  const [custom, setCustom] = useState('#f2eff0');
  // Lays the whole canvas out larger, so it is drawn at full resolution and a
  // recording needs no zooming in afterwards (which can only stretch pixels
  // that were never there). CSS `zoom`, not a transform: Safari draws filtered
  // layers at 1x and stretches them under a transform, which softens lenses.
  const [zoom, setZoom] = useState(1);
  const [panel, setPanel] = useState(true);
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  const [guides, setGuides] = useState({ v: false, h: false });
  const drag = useRef<{ id: string; px: number; py: number; x: number; y: number } | null>(null);

  // Items shield themselves from the pointer only while editing the layout.
  const editing = panel && !live;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) ?? 'null');
      if (saved) {
        if (Array.isArray(saved.items)) setItems(saved.items);
        if (saved.theme === 'light' || saved.theme === 'dark') setTheme(saved.theme);
        if (typeof saved.bg === 'string') setBg(saved.bg);
        if (typeof saved.custom === 'string') setCustom(saved.custom);
        if (typeof saved.zoom === 'number' && saved.zoom >= 1 && saved.zoom <= 6) setZoom(saved.zoom);
      }
    } catch {
      /* start empty */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify({ items, theme, bg, custom, zoom }));
    } catch {
      /* storage unavailable */
    }
  }, [ready, items, theme, bg, custom, zoom]);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, []);

  const patch = useCallback((id: string, cfg: Cfg) => setItems((all) => all.map((it) => (it.id === id ? { ...it, cfg: { ...it.cfg, ...cfg } } : it))), []);
  const moveTo = useCallback((id: string, x: number, y: number) => setItems((all) => all.map((it) => (it.id === id ? { ...it, x, y } : it))), []);

  const add = (kind: Kind) => {
    // The first lands in the middle; each next one goes below the last, wrapping
    // to a new column, so nothing is ever dropped on top of another.
    const last = items[items.length - 1];
    let x = 0;
    let y = 0;
    if (last) {
      x = last.x;
      y = last.y + 96;
      if (y > 280) {
        x = last.x + 340;
        y = -240;
      }
    }
    const item: Item = { id: newId(), kind, x, y, cfg: { ...DEFAULTS[kind] } };
    setItems((all) => [...all, item]);
    setSelected(item.id);
  };
  const remove = useCallback((id: string) => {
    setItems((all) => all.filter((it) => it.id !== id));
    setSelected((s) => (s === id ? null : s));
  }, []);
  const duplicate = useCallback(
    (id: string) => {
      const from = items.find((it) => it.id === id);
      if (!from) return;
      const copy: Item = { ...from, id: newId(), x: from.x + 24, y: from.y + 24, cfg: { ...from.cfg } };
      setItems((all) => [...all, copy]);
      setSelected(copy.id);
    },
    [items],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey) {
        if (e.key.toLowerCase() === 'd' && selected && editing) {
          e.preventDefault();
          duplicate(selected);
        }
        return;
      }
      if (e.key === 'h' || e.key === 'H') setPanel((p) => !p);
      else if (e.key === 'Escape') {
        if (!panel) setPanel(true);
        else setSelected(null);
      } else if (editing && selected) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          remove(selected);
        } else if (e.key.startsWith('Arrow')) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const it = items.find((i) => i.id === selected);
          if (!it) return;
          moveTo(it.id, it.x + (e.key === 'ArrowRight' ? step : e.key === 'ArrowLeft' ? -step : 0), it.y + (e.key === 'ArrowDown' ? step : e.key === 'ArrowUp' ? -step : 0));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, editing, panel, items, duplicate, remove, moveTo]);

  const onShieldDown = (e: React.PointerEvent<HTMLDivElement>, item: Item) => {
    if (e.button !== 0) return;
    setSelected(item.id);
    drag.current = { id: item.id, px: e.clientX, py: e.clientY, x: item.x, y: item.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onShieldMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    // Pointer travel is in screen px; positions are in the canvas's own px.
    let x = d.x + (e.clientX - d.px) / zoom;
    let y = d.y + (e.clientY - d.py) / zoom;
    // Snap to the centre lines of the canvas.
    const v = Math.abs(x) < 6 / zoom;
    const h = Math.abs(y) < 6 / zoom;
    if (v) x = 0;
    if (h) y = 0;
    setGuides({ v, h });
    moveTo(d.id, Math.round(x), Math.round(y));
  };
  const onShieldUp = () => {
    drag.current = null;
    setGuides({ v: false, h: false });
  };

  const background =
    bg === 'plain' ? (theme === 'dark' ? '#000' : '#f2eff0') : bg === 'custom' ? custom : `#000 url(/wallpapers/${bg}.svg) center / cover no-repeat`;
  const current = items.find((it) => it.id === selected) ?? null;

  return (
    <div className="studio" data-theme={theme} style={{ background, '--studio-zoom': zoom } as React.CSSProperties}>
      <div className="studio__canvas" style={zoom === 1 ? undefined : ({ zoom } as React.CSSProperties)} onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}>
        {items.map((item) => (
          // Keyed by theme: a theme change rebuilds the glass from scratch, so no
          // layer can keep painting the old appearance.
          <div key={`${item.id}-${theme}`} className="studio__item" style={{ left: `calc(50% + ${item.x}px)`, top: `calc(50% + ${item.y}px)` }}>
            <div className="studio__body">
              <Body item={item} patch={(cfg) => patch(item.id, cfg)} />
              {editing && (
                <div
                  className="studio__shield"
                  data-selected={item.id === selected || undefined}
                  onPointerDown={(e) => onShieldDown(e, item)}
                  onPointerMove={onShieldMove}
                  onPointerUp={onShieldUp}
                  onPointerCancel={onShieldUp}
                />
              )}
            </div>
          </div>
        ))}
        {editing && guides.v && <div className="studio__guide studio__guide--v" />}
        {editing && guides.h && <div className="studio__guide studio__guide--h" />}
      </div>
      {panel && ready && items.length === 0 && <p className="studio__empty">Add a component from the panel</p>}

      {!panel && (
        <button type="button" className="studio__peek" onClick={() => setPanel(true)} aria-label="Show tools">
          <span>Show tools</span>
        </button>
      )}

      {panel && (
        <aside className="studio__panel" aria-label="Studio tools">
          <header className="studio__head">
            <strong>Studio</strong>
            <Seg options={[{ value: false, label: 'Edit' }, { value: true, label: 'Live' }]} value={live} onChange={setLive} />
          </header>
          <button type="button" className="studio__primary" onClick={() => setPanel(false)}>
            Hide tools to record <kbd>H</kbd>
          </button>

          <Field label="Appearance">
            <Seg options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} value={theme} onChange={(t) => setTheme(t as Theme)} />
          </Field>
          <Field label="Background">
            <div className="studio__swatches studio__swatches--bg">
              <button type="button" aria-label="Plain" className="studio__plain" data-on={bg === 'plain' || undefined} onClick={() => setBg('plain')} />
              {WALLPAPERS.map((w) => (
                <button key={w} type="button" aria-label={w} style={{ background: `url(/wallpapers/${w}.svg) center / cover` }} data-on={bg === w || undefined} onClick={() => setBg(w)} />
              ))}
              <label className="studio__colour" data-on={bg === 'custom' || undefined} aria-label="Custom colour">
                <input type="color" value={custom} onChange={(e) => { setCustom(e.target.value); setBg('custom'); }} />
              </label>
            </div>
          </Field>

          <Field label="Zoom">
            <Seg options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: `${n}x` }))} value={zoom} onChange={setZoom} />
          </Field>

          <Field label="Add">
            <div className="studio__grid">
              {KINDS.map((k) => (
                <button key={k.kind} type="button" onClick={() => add(k.kind)}>{k.label}</button>
              ))}
            </div>
          </Field>

          {current && (
            <section className="studio__inspector">
              <div className="studio__inspector-head">
                <strong>{KINDS.find((k) => k.kind === current.kind)?.label}</strong>
                <span>
                  <button type="button" onClick={() => duplicate(current.id)}>Duplicate</button>
                  <button type="button" onClick={() => remove(current.id)}>Delete</button>
                </span>
              </div>
              <Inspector item={current} patch={(cfg) => patch(current.id, cfg)} />
            </section>
          )}

          <footer className="studio__hint">
            Drag a component to move it. Arrow keys nudge it, Delete removes it. Edit locks components so they can be placed; Live lets you use them. Press H to hide or show these tools. Zoom draws everything larger and sharper, so record big instead of cropping in later.
            {items.length > 0 && (
              <button type="button" onClick={() => { setItems([]); setSelected(null); }}>Clear canvas</button>
            )}
          </footer>
        </aside>
      )}
    </div>
  );
}
