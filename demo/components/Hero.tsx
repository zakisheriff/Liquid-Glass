'use client';

import { useEffect, useState } from 'react';
import { GlassButton, GlassCard, GlassSlider, GlassSwitch } from '@zakisheriff/liquid-glass';
import { SUPPORT_URL } from '@/lib/site';
import { MockApp } from './MockApp';
import { PreviewThemeContext, PreviewThemeControlsContext, usePreviewMode } from './PreviewTheme';
import { Battery, Bolt, Cellular, Heart, Plane, Speaker, Sun, Wifi } from './icons';

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
        <Cellular size={18} />
        <Wifi size={18} />
        <Battery size={27} />
      </span>
    </div>
  );
}

function Device({ display }: { display: number }) {
  const [mode, setMode] = usePreviewMode();
  return (
    <PreviewThemeContext.Provider value={mode}>
    <PreviewThemeControlsContext.Provider value={{ mode, onChange: setMode }}>
    <div className="device preview-scope" data-theme={mode} aria-label="Interactive glass app">
      <span className="device__button device__button--action" aria-hidden="true" />
      <span className="device__button device__button--up" aria-hidden="true" />
      <span className="device__button device__button--down" aria-hidden="true" />
      <span className="device__button device__button--power" aria-hidden="true" />
      <div className="device__screen" style={{ filter: `brightness(${0.35 + display / 72 * 0.65})` }}>
        <StatusBar />
        <MockApp />
      </div>
    </div>
    </PreviewThemeControlsContext.Provider>
    </PreviewThemeContext.Provider>
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

function MixerCard({ display, onDisplay }: { display: number; onDisplay: (value: number) => void }) {
  const [volume, setVolume] = useState(48);
  const [scrub, setScrub] = useState(34);
  return (
    <GlassCard className="hero__float hero__float--right" padding="18px" radius="30px">
      <div className="mixer">
        <GlassSlider showThumb={false} value={display} onChange={onDisplay} icon={<Sun size={18} />} label="Display" />
        <GlassSlider showThumb={false} value={volume} onChange={setVolume} icon={<Speaker size={18} />} label="Sound" />
        <GlassSlider value={scrub} onChange={setScrub} aria-label="Playback position" />
      </div>
    </GlassCard>
  );
}

export function Hero() {
  const [display, setDisplay] = useState(72);
  return (
    <section className="hero" id="top">
      <div className="hero__copy">
        <h1 className="hero__title">
          <span id="hero-title" className="hero__title-text">
            Liquid Glass
          </span>
        </h1>
        <div className="hero__ctas">
          <GlassButton
            variant="filled"
            onClick={() => document.getElementById('install')?.scrollIntoView()}
          >
            Get started
          </GlassButton>
          <GlassButton onClick={() => window.open('https://github.com/zakisheriff/Liquid-Glass', '_blank')}>
            GitHub
          </GlassButton>
          <GlassButton onClick={() => window.open('https://www.npmjs.com/package/@zakisheriff/liquid-glass', '_blank')}>
            npm
          </GlassButton>
          <GlassButton variant="filled" tint="#ff375f" icon={<Heart size={18} />} aria-label="Support on Buy Me a Coffee" onClick={() => window.open(SUPPORT_URL, '_blank', 'noopener,noreferrer')}>
            Support
          </GlassButton>
        </div>
      </div>
      <div className="hero__stage">
        <ControlCard />
        <Device display={display} />
        <MixerCard display={display} onDisplay={setDisplay} />
      </div>
    </section>
  );
}
