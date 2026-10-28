'use client';

import { useState, type CSSProperties } from 'react';
import { GlassButton, GlassCard, GlassInput, GlassSegmented, GlassSheet, GlassSlider, GlassSwitch } from '@zakisheriff/liquid-glass';
import { Bookmark, Check, Copy, Drop, Sun } from './icons';

export type StudioPalette = { brightness: number; hue: number; vivid: boolean; name: string };

const tone = ({ brightness, hue, vivid }: StudioPalette) => ({ h: Math.round(hue) % 360, s: vivid ? 24 : 4, l: Math.round(20 + brightness * 0.35) });
const studioColor = (palette: StudioPalette) => {
  const { h, s, l } = tone(palette);
  return `hsl(${h} ${s}% ${l}%)`;
};

/** The palette's colour written out as HEX, RGB or HSL. */
function colorCode(palette: StudioPalette, format: number) {
  const { h, s, l } = tone(palette);
  if (format === 2) return `hsl(${h}, ${s}%, ${l}%)`;
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  const [r, g, b] = [channel(0), channel(8), channel(4)];
  if (format === 1) return `rgb(${r}, ${g}, ${b})`;
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

const RECENT = [
  { name: 'Ocean', hue: 205, brightness: 62 },
  { name: 'Mint', hue: 160, brightness: 70 },
  { name: 'Dusk', hue: 255, brightness: 40 },
  { name: 'Sand', hue: 38, brightness: 80 },
  { name: 'Rose', hue: 340, brightness: 66 },
];

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
  const [format, setFormat] = useState(0);
  const [copied, setCopied] = useState(false);
  const code = colorCode(palette, format);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked */
    }
  };
  const artwork = studioArtwork(palette);

  return (
    <div className="phone-studio">
      <header className="phone-studio__heading">
        <h2>The Atom</h2>
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
        <section className="phone-studio__recent" aria-label="Recent palettes">
          <h4>Recent</h4>
          <div className="phone-studio__swatches">
            {RECENT.map((recent) => (
              <button
                key={recent.name}
                type="button"
                className="phone-studio__swatch-chip"
                style={{ backgroundColor: studioColor({ ...palette, hue: recent.hue, brightness: recent.brightness }) }}
                aria-label={`Use ${recent.name}`}
                aria-pressed={palette.name === recent.name}
                onClick={() => onChange({ ...palette, name: recent.name, hue: recent.hue, brightness: recent.brightness })}
              >
                <span>{recent.name}</span>
              </button>
            ))}
          </div>
        </section>
        <GlassCard className="phone-studio__code" padding="12px" radius="24px">
          <GlassSegmented size="sm" options={['HEX', 'RGB', 'HSL']} value={format} onChange={setFormat} aria-label="Colour format" />
          <div className="phone-studio__code-row">
            <span className="phone-studio__code-dot" style={{ backgroundColor: studioColor(palette) }} aria-hidden="true" />
            <code>{code}</code>
            <GlassButton size="sm" icon={copied ? <Check size={16} /> : <Copy size={16} />} aria-label={copied ? 'Copied' : 'Copy colour code'} onClick={copy} />
          </div>
        </GlassCard>
      </div>
      {container && <GlassSheet open={sheet} onClose={() => setSheet(false)} container={container} detents={['medium', 'large']} aria-label="Palette preview">
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
