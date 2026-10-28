'use client';

import { useEffect, useRef, useState } from 'react';
import { GlassButton, GlassCard, GlassNav, GlassSegmented, GlassSlider, GlassSwitch, useRefraction } from '@zakisheriff/liquid-glass';
import { COVERS, Cover } from './art';
import { ArrowUpRight, Bolt, Ellipsis, Grid, Home, Menu, Note, Plane, Play, Search, Speaker, Sun, Wifi } from './icons';

const TABS = [
  { label: 'Home', icon: <Home /> },
  { label: 'Browse', icon: <Grid /> },
  { label: 'Library', icon: <Note /> },
];

/** iOS 26 Music: scrolling down tucks the player into a minimised tab bar. */
function useMinimised(feed: React.RefObject<HTMLDivElement | null>) {
  const [minimised, setMinimised] = useState(false);
  useEffect(() => {
    const el = feed.current;
    if (!el) return;
    let last = el.scrollTop;
    const onScroll = () => {
      const y = el.scrollTop;
      const delta = y - last;
      last = y;
      if (y < 24) setMinimised(false);
      else if (Math.abs(delta) > 40) return; // programmatic jumps
      else if (delta > 3) setMinimised(true);
      else if (delta < -3) setMinimised(false);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [feed]);
  return [minimised, setMinimised] as const;
}

function useClock() {
  const [time, setTime] = useState('9:41');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(`${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function StatusBar() {
  const time = useClock();
  return (
    <div className="status" aria-hidden="true">
      <span className="status__time">{time}</span>
      <span className="status__island" />
      <span className="status__icons">
        <svg width="18" height="12" viewBox="0 0 18 12">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.8} y={9 - i * 3} width="3.2" height={3 + i * 3} rx="1" fill="currentColor" />
          ))}
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12">
          <path d="M1.4 4.5a10.1 10.1 0 0 1 14.2 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4.1 7.2a6.3 6.3 0 0 1 8.8 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8.5 11.6 6.2 9.3a3.3 3.3 0 0 1 4.6 0z" fill="currentColor" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13">
          <rect x="0.5" y="0.5" width="22" height="12" rx="3.8" fill="none" stroke="currentColor" strokeOpacity="0.4" />
          <rect x="2.2" y="2.2" width="16" height="8.6" rx="2.4" fill="currentColor" />
          <path d="M24.2 4.3v4.4c.9-.3 1.5-1.2 1.5-2.2s-.6-1.9-1.5-2.2z" fill="currentColor" fillOpacity="0.45" />
        </svg>
      </span>
    </div>
  );
}

function Device() {
  const [tab, setTab] = useState(0);
  const [segment, setSegment] = useState(0);
  const feed = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const [minimised, setMinimised] = useMinimised(feed);
  useRefraction(shell, { kind: 'surface' });
  return (
    <div className="device" aria-label="Interactive demo">
      <span className="device__button device__button--action" aria-hidden="true" />
      <span className="device__button device__button--up" aria-hidden="true" />
      <span className="device__button device__button--down" aria-hidden="true" />
      <span className="device__button device__button--power" aria-hidden="true" />
      <div className="device__screen">
        <StatusBar />
        <div ref={feed} className="device__feed">
          <h3 className="device__heading">{segment === 0 ? 'For You' : 'Library'}</h3>
          <Cover index={segment === 0 ? 0 : 4} className="device__feature" />
          <div className="device__grid">
            {COVERS.map((_, i) => (
              <figure key={i} className="device__item">
                <Cover index={i + segment * 3} />
                <figcaption>
                  <strong>{COVERS[(i + segment * 3) % COVERS.length].title}</strong>
                  <span>{COVERS[(i + segment * 3) % COVERS.length].by}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="device__top">
          <GlassButton size="md" icon={<Menu size={20} />} aria-label="Menu" />
          <GlassSegmented options={['For You', 'Library']} value={segment} onChange={setSegment} aria-label="Feed" />
          <GlassButton size="md" icon={<Ellipsis size={20} />} aria-label="More" />
        </div>

        <div className="device__bottom" data-minimised={minimised ? '' : undefined}>
          {/* One glass shell: it shrinks around the selected tab instead of swapping elements. */}
          <div
            ref={shell}
            className="lg-glass device__tabs"
            onClickCapture={(event) => {
              if (!minimised) return;
              event.preventDefault();
              event.stopPropagation();
              setMinimised(false);
            }}
          >
            <GlassNav activeIndex={tab} onChange={setTab} items={TABS} />
          </div>
          <GlassButton className="device__player" size="lg">
            <Cover index={0} className="device__player-art" />
            <span className="device__player-text">
              <strong>Afterglow</strong>
              <span>Nova Lane</span>
            </span>
            <Play size={20} />
          </GlassButton>
          <GlassButton size="lg" icon={<Search size={22} />} aria-label="Search" className="device__search" />
        </div>
      </div>
    </div>
  );
}

function ControlCard() {
  const [wifi, setWifi] = useState(true);
  const [plane, setPlane] = useState(false);
  const [saver, setSaver] = useState(true);
  return (
    <GlassCard className="hero__float hero__float--left" padding="10px 18px" radius="30px">
      {[
        { icon: <Plane size={18} />, label: 'Airplane', on: plane, set: setPlane, color: '#ff9f0a' },
        { icon: <Wifi size={18} />, label: 'Wi‑Fi', on: wifi, set: setWifi, color: '#0a84ff' },
        { icon: <Bolt size={18} />, label: 'Low Power', on: saver, set: setSaver, color: '#ffd60a' },
      ].map((row) => (
        <div key={row.label} className="setting">
          <span className="setting__icon" style={{ background: row.color }}>
            {row.icon}
          </span>
          <span className="setting__label">{row.label}</span>
          <GlassSwitch checked={row.on} onChange={row.set} aria-label={row.label} />
        </div>
      ))}
    </GlassCard>
  );
}

function MixerCard() {
  const [bright, setBright] = useState(72);
  const [volume, setVolume] = useState(48);
  const [scrub, setScrub] = useState(34);
  return (
    <GlassCard className="hero__float hero__float--right" padding="18px" radius="30px">
      <div className="mixer">
        <GlassSlider showThumb={false} value={bright} onChange={setBright} icon={<Sun size={18} />} label="Display" />
        <GlassSlider showThumb={false} value={volume} onChange={setVolume} icon={<Speaker size={18} />} label="Sound" />
        <GlassSlider value={scrub} onChange={setScrub} aria-label="Playback position" />
      </div>
    </GlassCard>
  );
}

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__backdrop" aria-hidden="true">
        <span className="blob blob--a" />
        <span className="blob blob--b" />
        <span className="blob blob--c" />
      </div>
      <div className="hero__copy">
        <h1 className="hero__title">Liquid Glass.</h1>
        <div className="hero__ctas">
          <GlassButton
            variant="filled"
            onClick={() => document.getElementById('install')?.scrollIntoView()}
          >
            Get started
          </GlassButton>
          <GlassButton onClick={() => window.open('https://github.com/zakisheriff/Liquid-Glass', '_blank')}>
            GitHub <ArrowUpRight size={16} />
          </GlassButton>
          <GlassButton onClick={() => window.open('https://www.npmjs.com/package/@zakisheriff/liquid-glass', '_blank')}>
            npm <ArrowUpRight size={16} />
          </GlassButton>
        </div>
      </div>
      <div className="hero__stage">
        <ControlCard />
        <Device />
        <MixerCard />
      </div>
    </section>
  );
}
