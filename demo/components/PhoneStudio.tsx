'use client';

import { useState, type CSSProperties } from 'react';
import { GlassButton, GlassCard, GlassInput, GlassSheet, GlassSlider, GlassSwitch } from '@zakisheriff/liquid-glass';
import { Bookmark, Check, Drop, Sparkle, Sun } from './icons';

export type StudioPalette = { brightness: number; hue: number; vivid: boolean; name: string };

export const studioArtwork = ({ brightness, hue, vivid }: StudioPalette): CSSProperties => ({
  background: 'radial-gradient(ellipse at 5% 0%, #ffdc9b, transparent 65%), radial-gradient(ellipse at 95% 100%, #713bf0, transparent 70%), linear-gradient(140deg, #ff8a79, #d14baf 55%, #773be9)',
  filter: `brightness(${0.45 + brightness / 100 * 0.75}) hue-rotate(${hue - 28}deg) saturate(${vivid ? 1.2 : 0.45})`,
});

/** The real controls, composed into a small creative app. */
export function PhoneStudio({ container, palette, onChange, saved, onSave }: {
  container: HTMLElement | null;
  palette: StudioPalette;
  onChange: (palette: StudioPalette) => void;
  saved: boolean;
  onSave: () => void;
}) {
  const { brightness, hue, vivid, name } = palette;
  const [sheet, setSheet] = useState(false);
  const artwork = studioArtwork(palette);

  return (
    <div className="phone-studio">
      <header className="phone-studio__heading">
        <p>THE GLASS STUDIO</p>
        <h2>A little more liquid.</h2>
      </header>
      <section className="phone-studio__canvas" aria-label="Live palette editor">
        <div className="phone-studio__art" style={artwork} aria-hidden="true" />
        <div className="phone-studio__preview">
          <span className="phone-studio__live"><span /> LIVE PREVIEW</span>
          <GlassButton size="sm" className="phone-studio__save" icon={saved ? <Check size={16} /> : <Bookmark size={16} />} aria-label={saved ? 'Unsave studio palette' : 'Save studio palette'} aria-pressed={saved} onClick={onSave} />
          <h3>{name.trim() || 'Untitled palette'}</h3>
          <p>Light. Color. A touch of glass.</p>
        </div>
        <GlassCard className="phone-studio__controls" padding="14px 16px" radius="24px" variant="clear">
          <GlassSlider value={brightness} onChange={(brightness) => onChange({ ...palette, brightness })} showThumb={false} icon={<Sun size={17} />} label="Light" aria-label="Studio brightness" />
          <div className="phone-studio__control-label"><span>Color shift</span><span>{Math.round(hue)}°</span></div>
          <GlassSlider value={hue} onChange={(hue) => onChange({ ...palette, hue })} min={0} max={360} tint="#fff" aria-label="Studio color shift" />
          <div className="phone-studio__toggle"><span><Sparkle size={16} /> Vivid colors</span><GlassSwitch checked={vivid} onChange={(vivid) => onChange({ ...palette, vivid })} aria-label="Vivid colors" /></div>
        </GlassCard>
      </section>
      <div className="phone-studio__details">
        <GlassInput label="Make it yours" aria-label="Palette name" value={name} maxLength={32} onChange={(event) => onChange({ ...palette, name: event.target.value })} placeholder="Name your palette" icon={<Drop size={18} />} />
        <div className="phone-studio__actions">
          <GlassButton icon={saved ? <Check size={16} /> : <Bookmark size={16} />} aria-pressed={saved} onClick={onSave}>{saved ? 'Saved' : 'Save'}</GlassButton>
          <GlassButton variant="filled" icon={<Sparkle size={16} />} onClick={() => setSheet(true)}>Preview palette</GlassButton>
        </div>
        <p className="phone-studio__hint">Slide, switch, type, and tap. It all works.</p>
      </div>
      {container && <GlassSheet open={sheet} onClose={() => setSheet(false)} container={container} aria-label="Palette preview">
        <div className="phone-studio__sheet">
          <div className="phone-studio__swatch"><div className="phone-studio__art" style={artwork} /></div>
          <p>YOUR PALETTE</p>
          <h3>{name.trim() || 'Untitled palette'}</h3>
          <span>{Math.round(brightness)}% light · {Math.round(hue)}° color · {vivid ? 'Vivid' : 'Soft'}</span>
          <GlassButton variant="filled" icon={saved ? <Check size={17} /> : <Bookmark size={17} />} onClick={onSave}>{saved ? 'Saved to your palettes' : 'Save palette'}</GlassButton>
          <GlassButton onClick={() => setSheet(false)}>Keep creating</GlassButton>
        </div>
      </GlassSheet>}
    </div>
  );
}
