'use client';

import { useRef, useState } from 'react';
import {
  GlassButton,
  GlassCard,
  GlassInput,
  GlassSegmented,
  GlassSheet,
  GlassSlider,
  GlassSwitch,
  type GlassSliderProps,
} from '@zakisheriff/liquid-glass';
import { COVERS, Cover } from './art';
import { Heart, HeartFill, Mic, Plus, Share, Speaker, Sun } from './icons';
import { AppDock } from './AppDock';

function Tile({
  title,
  wide,
  dark,
  children,
}: {
  title: string;
  wide?: boolean;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className={['tile', wide ? 'tile--wide' : '', dark ? 'tile--dark' : ''].join(' ')}>
      <header className="tile__copy">
        <h2 className="tile__title">{title}</h2>
      </header>
      <div className="tile__stage">{children}</div>
    </article>
  );
}

function SwitchTile() {
  const [rows, setRows] = useState([true, false, true]);
  return (
    <Tile title="Switch">
      <div className="stage stage--sunset">
        <GlassCard className="stage__list" padding="6px 18px" radius="26px">
          {['Bringing Devices Together', 'Use Mobile Data', 'Live Activities'].map((label, i) => (
            <div key={label} className="setting">
              <span className="setting__label">{label}</span>
              <GlassSwitch
                aria-label={label}
                checked={rows[i]}
                onChange={(on) => setRows((r) => r.map((v, j) => (j === i ? on : v)))}
              />
            </div>
          ))}
        </GlassCard>
      </div>
    </Tile>
  );
}

function TabTile() {
  const [tab, setTab] = useState(0);
  return (
    <Tile title="Tab bar">
      <div className="stage stage--gradient" style={{ '--gradient-hue': `${[0, 155, 275, 325][tab]}deg` } as React.CSSProperties}>
        <div className="stage__gradient" aria-hidden="true" />
        <AppDock tab={tab} onChange={setTab} />
      </div>
    </Tile>
  );
}

function SegmentTile() {
  const [value, setValue] = useState(0);
  const [size, setSize] = useState(1);
  return (
    <Tile title="Segmented">
      <div className="stage stage--type">
        <div className="stage__column">
          <GlassSegmented options={['Chat', 'Work']} value={value} onChange={setValue} aria-label="Mode" />
          <GlassSegmented options={['Day', 'Week', 'Month', 'Year']} value={size} onChange={setSize} aria-label="Range" />
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
  return (
    <Tile title="Slider">
      <div className="stage stage--aurora">
        <div ref={backdrop} className="stage__slider-backdrop" aria-hidden="true">
          <div className="stage__slider-art" />
          <div className="stage__slider-color" />
          <div className="stage__slider-shade" />
        </div>
        <GlassCard className="stage__mixer" padding="20px" radius="28px">
          <PreviewSlider initialValue={64} onValue={(v) => backdrop.current?.style.setProperty('--slider-shade', String((1 - v / 100) * 0.6))} showThumb={false} icon={<Sun size={18} />} label="Display" />
          <PreviewSlider initialValue={38} onValue={(v) => backdrop.current?.style.setProperty('--slider-color', String(v / 100 * 0.25))} showThumb={false} icon={<Speaker size={18} />} label="Sound" />
          <PreviewSlider initialValue={52} onValue={(v) => backdrop.current?.style.setProperty('--slider-pan', `${(v - 50) * 0.2}%`)} aria-label="Balance" />
        </GlassCard>
      </div>
    </Tile>
  );
}

function ButtonTile() {
  const [liked, setLiked] = useState(false);
  return (
    <Tile title="Buttons">
      <div className="stage stage--stripes">
        <div className="stage__buttons">
          <div className="stage__row">
            <GlassButton size="lg" icon={<Plus size={22} />} aria-label="Add" />
            <GlassButton
              size="lg"
              icon={liked ? <HeartFill size={22} /> : <Heart size={22} />}
              aria-label="Like"
              tint={liked ? '#ff375f' : undefined}
              onClick={() => setLiked((v) => !v)}
            />
            <GlassButton size="lg" icon={<Share size={22} />} aria-label="Share" />
          </div>
          <div className="stage__row">
            <GlassButton>Glass</GlassButton>
            <GlassButton variant="filled">Filled</GlassButton>
            <GlassButton variant="tinted">Tinted</GlassButton>
          </div>
          <div className="stage__row">
            <GlassButton variant="filled" tint="#af52de">
              Tinted filled
            </GlassButton>
            <GlassButton variant="clear">Clear</GlassButton>
          </div>
          <div className="stage__row">
            <GlassButton destructive>Destructive</GlassButton>
            <GlassButton variant="filled" destructive>
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
  const results = COVERS.filter((c) => c.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
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
            aria-label="Search covers"
          />
          <GlassCard className="stage__results" padding="6px" radius="24px">
            {results.length ? (
              results.map((c) => (
                <div key={c.title} className="result">
                  <Cover index={COVERS.indexOf(c)} className="result__art" />
                  <span>
                    <strong>{c.title}</strong>
                    <small>{c.by}</small>
                  </span>
                </div>
              ))
            ) : (
              <p className="result result--empty">No results</p>
            )}
          </GlassCard>
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
          Open sheet
        </GlassButton>
      </div>
      <GlassSheet open={open} onClose={() => setOpen(false)} aria-label="Now playing">
        <div className="sheet-demo">
          <Cover index={2} className="sheet-demo__art" />
          <h3>Bloom</h3>
          <p>Iris Vale</p>
          <GlassSlider value={rate} onChange={setRate} aria-label="Position" />
          <div className="setting">
            <span className="setting__label">Notify me</span>
            <GlassSwitch checked={notify} onChange={setNotify} aria-label="Notify me" />
          </div>
          <GlassButton size="lg" onClick={() => setOpen(false)} style={{ width: '100%' }}>
            Done
          </GlassButton>
        </div>
      </GlassSheet>
    </Tile>
  );
}

export function Tiles() {
  return (
    <section className="tiles" id="components">
      <SwitchTile />
      <TabTile />
      <SegmentTile />
      <SliderTile />
      <ButtonTile />
      <SearchTile />
      <SheetTile />
    </section>
  );
}
