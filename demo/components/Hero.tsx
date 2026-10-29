'use client';

import { GlassButton } from '@zakisheriff/liquid-glass';
import { SUPPORT_URL } from '@/lib/site';
import { Avatar, HomeFeed } from './HomeFeed';
import { MockApp } from './MockApp';
import { PreviewThemeContext, PreviewThemeControlsContext, usePreviewMode } from './PreviewTheme';
import { Heart } from './icons';

/** Just the Dynamic Island: no clock or status icons on the mockup. */
function Island() {
  return (
    <div className="status" aria-hidden="true">
      <span className="status__island" />
    </div>
  );
}

function Device() {
  const [mode, setMode] = usePreviewMode();
  return (
    <PreviewThemeContext.Provider value={mode}>
    <PreviewThemeControlsContext.Provider value={{ mode, onChange: setMode }}>
    <div className="hero__phones">
    {/* Decorative phones behind the live one, blurred like depth of field. */}
    {(['left', 'right'] as const).map((side) => (
      <div key={side} className={`device device--ghost device--ghost-${side} preview-scope`} data-theme={mode} aria-hidden="true" inert>
        <div className="device__screen">
          <Island />
          <div className="mock-app">
            <div className="device__feed"><HomeFeed /></div>
            <div className="device__top">
              <span className="device__brand">The Atom</span>
              <Avatar thumb={{ src: '/phone/ava.jpg', photo: true }} className="device__me" />
            </div>
          </div>
        </div>
      </div>
    ))}
    <div className="device preview-scope" data-theme={mode} aria-label="Interactive glass app">
      <span className="device__button device__button--action" aria-hidden="true" />
      <span className="device__button device__button--up" aria-hidden="true" />
      <span className="device__button device__button--down" aria-hidden="true" />
      <span className="device__button device__button--power" aria-hidden="true" />
      <div className="device__screen">
        <Island />
        <MockApp />
      </div>
    </div>
    </div>
    </PreviewThemeControlsContext.Provider>
    </PreviewThemeContext.Provider>
  );
}

export function Hero() {
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
        <Device />
      </div>
    </section>
  );
}
