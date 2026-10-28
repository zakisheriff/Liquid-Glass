'use client';

import { useState, type CSSProperties } from 'react';
import { GlassButton, GlassCard, GlassInput, GlassSheet, GlassSlider, GlassSwitch } from '@zakisheriff/liquid-glass';
import { Bookmark, Check, Drop, Sun } from './icons';

export type StudioPalette = { brightness: number; hue: number; vivid: boolean; name: string };

const studioColor = ({ brightness, hue, vivid }: StudioPalette) => `hsl(${hue} ${vivid ? 24 : 4}% ${20 + brightness * 0.35}%)`;

export const studioArtwork = (palette: StudioPalette): CSSProperties => ({ backgroundColor: studioColor(palette) });

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
        <h2>Try it now.</h2>
      </header>
      <section className="phone-studio__canvas" style={{ '--studio-art': studioColor(palette) } as CSSProperties} aria-label="Palette editor">
        <div className="phone-studio__art" style={artwork} aria-hidden="true" />
        <div className="phone-studio__preview">
          <GlassButton size="sm" className="phone-studio__save" icon={saved ? <Check size={16} /> : <Bookmark size={16} />} aria-label={saved ? 'Unsave studio palette' : 'Save studio palette'} aria-pressed={saved} onClick={onSave} />
          <h3>{name.trim() || 'Untitled palette'}</h3>
        </div>
        <GlassCard className="phone-studio__controls" padding="14px 16px" radius="24px" variant="clear">
          <GlassSlider value={brightness} onChange={(brightness) => onChange({ ...palette, brightness })} showThumb={false} icon={<Sun size={17} />} label="Light" aria-label="Studio brightness" />
          <div className="phone-studio__control-label"><span>Color shift</span><span>{Math.round(hue)}°</span></div>
          <GlassSlider value={hue} onChange={(hue) => onChange({ ...palette, hue })} min={0} max={360} tint="#fff" aria-label="Studio color shift" />
          <div className="phone-studio__toggle"><span>Vivid colors</span><GlassSwitch checked={vivid} onChange={(vivid) => onChange({ ...palette, vivid })} aria-label="Vivid colors" /></div>
        </GlassCard>
      </section>
      <div className="phone-studio__details">
        <GlassInput label="Make it yours" aria-label="Palette name" value={name} maxLength={32} onChange={(event) => onChange({ ...palette, name: event.target.value })} placeholder="Name your palette" icon={<Drop size={18} />} />
        <div className="phone-studio__actions">
          <GlassButton icon={saved ? <Check size={16} /> : <Bookmark size={16} />} aria-pressed={saved} onClick={onSave}>{saved ? 'Saved' : 'Save'}</GlassButton>
          <GlassButton variant="filled" onClick={() => setSheet(true)}>Preview palette</GlassButton>
        </div>
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
