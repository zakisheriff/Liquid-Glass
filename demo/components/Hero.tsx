'use client';

import { useEffect, useRef, useState } from 'react';
import { GlassButton, GlassCard, GlassNav, GlassSegmented, GlassSlider, GlassSwitch } from '@zakisheriff/liquid-glass';
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
      else if (delta > 3) setMinimised(true);
      else if (delta < -3) setMinimised(false);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [feed]);
  return minimised;
}

function Device() {
  const [tab, setTab] = useState(0);
  const [segment, setSegment] = useState(0);
  const feed = useRef<HTMLDivElement>(null);
  const minimised = useMinimised(feed);
  return (
    <div className="device" aria-label="Interactive demo">
      <div className="device__screen">
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
          <div className="device__tabs">
            <GlassNav activeIndex={tab} onChange={setTab} items={TABS} />
          </div>
          <GlassButton
            size="lg"
            className="device__mini-tab"
            icon={TABS[tab].icon}
            aria-label={`${TABS[tab].label}, show tabs`}
            tabIndex={minimised ? 0 : -1}
            onClick={() => feed.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          />
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
        <p className="hero__subtitle">Now on the web.</p>
        <div className="hero__ctas">
          <GlassButton
            variant="filled"
            onClick={() => document.getElementById('install')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get started
          </GlassButton>
          <GlassButton onClick={() => window.open('https://github.com/zakisheriff/Liquid-Glass', '_blank')}>
            GitHub <ArrowUpRight size={16} />
          </GlassButton>
        </div>
      </div>
      <div className="hero__stage">
        <ControlCard />
        <Device />
        <MixerCard />
      </div>
      <p className="hero__hint">Press, hold and drag everything.</p>
    </section>
  );
}
