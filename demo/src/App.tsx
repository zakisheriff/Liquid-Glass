import React, { useState } from 'react';

import {
  GlassButton,
  GlassCard,
  GlassInput,
  GlassNav,
  GlassSheet,
  GlassSlider,
  LiquidGlassFilter,
} from '@zakisheriff/liquid-glass';

// Vector SVG Icons for iOS 26 Visual Excellence (Proper 20px sized nicely)
const SparklesIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z"/>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/>
  </svg>
);

const ButtonIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="2" y="6" width="20" height="12" rx="6" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const InputIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M7 10h10M7 14h6" />
  </svg>
);

const SlidersIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="2" y1="14" x2="6" y2="14" />
    <line x1="10" y1="8" x2="14" y2="8" />
    <line x1="18" y1="16" x2="22" y2="16" />
  </svg>
);

const LayersIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="m12 2 10 5-10 5-10-5Z"/>
    <path d="m2 17 10 5 10-5"/>
    <path d="m2 12 10 5 10-5"/>
  </svg>
);

const GlobeIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// Microscopic refracting details (aligned nicely to the left in black)
const MicroscopeIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', color: '#191919', verticalAlign: 'middle' }}>
    <path d="M6 18h8M3 22h18M14 22a7 7 0 1 0-14 0" />
    <path d="M12 14l3-3M9 17l4-4M17 12l2.5-2.5a2.12 2.12 0 0 0-3-3L14 9M16 4l2-2" />
  </svg>
);

const RaysIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', color: '#191919', verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const VolumeIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>
);

export default function App() {
  // Global / Shared states
  const [intensity, setIntensity] = useState<number>(5);
  const [thickness, setThickness] = useState<number>(1);
  const [shimmer, setShimmer] = useState<boolean>(true);
  const [tint, setTint] = useState<string>('');

  // Nav state (All using proper 20px vector icons)
  const [activeTab, setActiveTab] = useState<number>(0);
  const navItems = [
    { label: 'Overview', icon: <SparklesIcon size={20} /> },
    { label: 'Buttons', icon: <ButtonIcon size={20} /> },
    { label: 'Inputs', icon: <InputIcon size={20} /> },
    { label: 'Sliders', icon: <SlidersIcon size={20} /> },
    { label: 'Cards', icon: <LayersIcon size={20} /> },
  ];

  // Slider states
  const [volume, setVolume] = useState<number>(46);

  // Input states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Button counts
  const [clickCount, setClickCount] = useState(0);

  // Tint preset options
  const tintPresets = [
    { name: 'Pure Glass', value: '' },
    { name: 'Apple Cyan', value: 'rgba(0, 242, 254, 0.15)' },
    { name: 'Neon Purple', value: 'rgba(127, 0, 255, 0.15)' },
    { name: 'Royal Gold', value: 'rgba(255, 190, 0, 0.15)' },
    { name: 'Sunset Pink', value: 'rgba(255, 42, 133, 0.15)' },
  ];

  return (
    <LiquidGlassFilter>
      <div 
        className="light-theme-playground light-theme" 
        style={{ 
          minHeight: '100vh', 
          transition: 'background 0.3s ease, color 0.3s ease',
          color: '#191919'
        }}
      >
        <div className="bg-canvas" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <main className="demo-main" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', position: 'relative', zIndex: 1 }}>
          {/* Header (Showing only Zaki Sheriff) */}
          <header className="demo-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: '14px', fontWeight: 600, color: '#191919', opacity: 0.75, letterSpacing: '0.15em', marginBottom: '12px' }}>
              <span>Zaki Sheriff</span>
            </div>
            <h1 className="demo-title" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '56px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #121214 30%, #4a4a4f 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              zakisheriff/liquidglass
            </h1>
            <p className="demo-subtitle" style={{ fontSize: '18px', color: 'rgba(0,0,0,0.65)', maxWidth: '600px', margin: '16px auto 0', lineHeight: 1.6, fontWeight: 300 }}>
              Bringing iOS 26's native liquid glass aesthetic to the web. Refraction, light caustics, and edge diffraction.
            </p>
            <div className="demo-hero-action" style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
              <GlassButton
                intensity={intensity}
                thickness={thickness}
                shimmer={shimmer}
                size="sm"
                onClick={() => window.open('https://github.com/zakisheriff/Liquid-Glass', '_blank')}
              >
                <GlobeIcon size={20} />
                Explore Zaki Sheriff
              </GlassButton>
            </div>
          </header>

          {/* Floating Nav */}
          <div className="demo-nav-wrap" style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <GlassNav items={navItems} activeIndex={activeTab} onChange={setActiveTab} intensity={intensity} />
          </div>

          {/* Main Grid: Left Controls, Right Preview */}
          <div className="demo-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
            
            {/* Controls Panel */}
            <GlassCard className="demo-controls-card" intensity={intensity} tint={tint} thickness={thickness} shimmer={shimmer} padding="30px" radius="36px">
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 700, marginTop: 0, marginBottom: '24px' }}>
                Refraction Engine
              </h2>
              
              {/* Slider 1: Intensity (Control Center block style) */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'rgba(0,0,0,0.65)', marginBottom: '8px' }}>
                  <span>Glass Thickness (SVG Displace)</span>
                  <span style={{ fontWeight: 600, color: '#191919' }}>Level {intensity}</span>
                </label>
                <GlassSlider
                  min={1}
                  max={10}
                  value={intensity}
                  onChange={setIntensity}
                  showThumb={false}
                  intensity={intensity}
                  thickness={thickness}
                  shimmer={shimmer}
                  tint={tint}
                  style={{ height: '32px' }}
                />
              </div>

              {/* Slider 2: Thickness (Control Center block style) */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'rgba(0,0,0,0.65)', marginBottom: '8px' }}>
                  <span>Bevel Border Width</span>
                  <span style={{ fontWeight: 600, color: '#191919' }}>{thickness}px</span>
                </label>
                <GlassSlider
                  min={1}
                  max={4}
                  value={thickness}
                  onChange={setThickness}
                  showThumb={false}
                  intensity={intensity}
                  thickness={thickness}
                  shimmer={shimmer}
                  tint={tint}
                  style={{ height: '32px' }}
                />
              </div>

              {/* Shimmer Toggle (Using Library Default GlassButton component - with layout dimensions fixed) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(0,0,0,0.75)' }}>Caustics Light Shimmer</span>
                  <span style={{ fontSize: '11px', color: 'rgba(0,0,0,0.5)', marginTop: '2px', maxWidth: '180px', lineHeight: 1.3 }}>
                    Simulates dynamic light reflections and refractions on the glass surface, creating an interactive shimmer that follows the mouse cursor.
                  </span>
                </div>
                <GlassButton 
                  size="sm" 
                  onClick={() => setShimmer(!shimmer)} 
                  variant={shimmer ? 'default' : 'ghost'}
                  style={{ 
                    '--glass-min-width': '80px', 
                    '--glass-height': '36px',
                    width: '80px',
                    height: '36px'
                  } as React.CSSProperties}
                >
                  {shimmer ? 'ON' : 'OFF'}
                </GlassButton>
              </div>

              {/* Default Button for Default settings */}
              <div style={{ marginTop: '20px', marginBottom: '24px' }}>
                <GlassButton
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIntensity(5);
                    setThickness(1);
                    setShimmer(true);
                    setTint('');
                  }}
                  style={{ 
                    '--glass-min-width': '100%',
                    '--glass-height': '36px',
                    width: '100%', 
                    height: '36px' 
                  } as React.CSSProperties}
                >
                  Restore Default Settings
                </GlassButton>
              </div>

              {/* Tint Presets */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: 'rgba(0,0,0,0.65)', marginBottom: '10px' }}>
                  Glass Tint Blend
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tintPresets.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTint(t.value)}
                      style={{
                        width: '100%',
                        padding: '10px 20px',
                        borderRadius: '999vw',
                        background: tint === t.value 
                          ? 'rgba(0,0,0,0.06)' 
                          : 'rgba(0,0,0,0.015)',
                        border: `1px solid ${tint === t.value 
                          ? 'rgba(0,0,0,0.12)' 
                          : 'rgba(0,0,0,0.05)'}`,
                        color: tint === t.value 
                          ? '#191919' 
                          : 'rgba(0,0,0,0.5)',
                        fontSize: '13px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {t.value !== '' && (
                        <span style={{ 
                          display: 'inline-block', 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '50%', 
                          background: t.value, 
                          border: '1px solid rgba(0,0,0,0.15)',
                          flexShrink: 0
                        }} />
                      )}
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Playground Preview area */}
            <div className="demo-preview" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Show view depending on active tab */}
              {activeTab === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {/* Philosophy Card */}
                  <GlassCard intensity={intensity} tint={tint} thickness={thickness} shimmer={shimmer} radius="36px">
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: 700, marginTop: 0, marginBottom: '12px' }}>
                      Overview & Philosophy
                    </h2>
                    <p style={{ lineHeight: 1.6, fontSize: '15px', color: 'rgba(0,0,0,0.75)', margin: 0 }}>
                      Unlike generic glassmorphic libraries which only apply opacity and blur, <strong>Liquid Glass</strong> maps physical light refraction through real-time SVG Displacement filters. It replicates the premium iOS 26 native liquid glass aesthetic.
                    </p>
                    <div className="demo-two-column" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
                      <div style={{ background: 'rgba(0,0,0,0.02)', padding: '18px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                          <MicroscopeIcon size={24} />
                        </div>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600 }}>SVG Refraction</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(0,0,0,0.55)', lineHeight: 1.45 }}>
                          Uses custom <code>feTurbulence</code> and <code>feDisplacementMap</code> filters that bend background lighting physically.
                        </p>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.02)', padding: '18px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                          <RaysIcon size={24} />
                        </div>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600 }}>Caustic Light</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(0,0,0,0.55)', lineHeight: 1.45 }}>
                          Conic-gradients linked to animated mouse angles simulate direct overhead spotlights on the lens.
                        </p>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Installation & Integration Card */}
                  <GlassCard intensity={intensity} tint={tint} thickness={thickness} shimmer={shimmer} radius="36px">
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: 700, marginTop: 0, marginBottom: '16px' }}>
                      Developer Guide
                    </h2>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>1. Download & Install</h3>
                    <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.65)', margin: '0 0 10px 0' }}>
                      Install the package via npm to add liquid glass components to your React project:
                    </p>
                    <pre style={{
                      background: 'rgba(0,0,0,0.03)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      color: '#191919',
                      overflowX: 'auto',
                      margin: '0 0 24px 0'
                    }}>
                      npm install @zakisheriff/liquid-glass
                    </pre>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>2. Basic Usage</h3>
                    <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.65)', margin: '0 0 10px 0' }}>
                      Wrap your application context in the filter provider and import the bundled stylesheet:
                    </p>
                    <pre style={{
                      background: 'rgba(0,0,0,0.03)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      color: '#191919',
                      overflowX: 'auto',
                      margin: '0 0 24px 0',
                      lineHeight: '1.4'
                    }}>
{`import { LiquidGlassFilter, GlassButton } from '@zakisheriff/liquid-glass';
import '@zakisheriff/liquid-glass/styles.css';

export default function App() {
  return (
    <LiquidGlassFilter>
      <div style={{ background: 'linear-gradient(to right, #ff7e5f, #feb47b)' }}>
        <GlassButton size="md">
          iOS 26 Liquid Button
        </GlassButton>
      </div>
    </LiquidGlassFilter>
  );
}`}
                    </pre>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>3. Component & Controls Reference</h3>
                    <ul style={{ fontSize: '14px', color: 'rgba(0,0,0,0.65)', paddingLeft: '20px', margin: '0 0 24px 0', lineHeight: '1.6' }}>
                      <li><strong>Glass Thickness (SVG Displace) Slider:</strong> Bends the background image using an SVG displacement map. Level 1 is subtle, and Level 10 creates deep fluid refractions.</li>
                      <li><strong>Bevel Border Width Slider:</strong> Adjusts the 3D edge diffraction bevel highlights. Higher widths provide stronger, more defined physical bevels.</li>
                      <li><strong>Caustics Light Shimmer Toggle:</strong> Turns on/off mouse-tracking light reflections that overlay the glass, simulating real overhead lens spots.</li>
                      <li><strong>Restore Default Settings Button:</strong> Resets all variables in the playground immediately to their default balanced iOS values.</li>
                      <li><strong>Glass Tint Blend buttons:</strong> Blends subtle color overlays into the glass base (Pure Glass is clear, while Apple Cyan, Neon Purple, etc., add translucent glows).</li>
                    </ul>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                      <GlassButton 
                        intensity={intensity} 
                        tint={tint} 
                        thickness={thickness} 
                        shimmer={shimmer} 
                        size="lg" 
                        onClick={() => setIsSheetOpen(true)}
                        style={{ width: '100%' }}
                      >
                        Open Drawer Component
                      </GlassButton>
                    </div>
                  </GlassCard>
                </div>
              )}

              {activeTab === 1 && (
                <GlassCard intensity={intensity} tint={tint} thickness={thickness} shimmer={shimmer} radius="36px">
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: 700, marginTop: 0, marginBottom: '24px' }}>
                    Glass Buttons Showcase
                  </h2>
                  
                  {/* Click counter demo */}
                  <div className="demo-counter-panel" style={{ textAlign: 'center', padding: '30px 40px', background: 'transparent', border: '1px solid rgba(0,0,0,0.04)', borderRadius: '999vw', marginBottom: '30px' }}>
                    <div style={{ fontSize: '13px', color: 'rgba(0,0,0,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Interaction Count</div>
                    <div style={{ fontSize: '48px', fontWeight: 800, color: '#191919', margin: '4px 0' }}>{clickCount}</div>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '12px' }}>
                      <GlassButton 
                        intensity={intensity} 
                        tint={tint} 
                        thickness={thickness} 
                        shimmer={shimmer} 
                        size="sm"
                        onClick={() => setClickCount(c => c + 1)}
                      >
                        Increment
                      </GlassButton>
                      <GlassButton 
                        intensity={intensity} 
                        tint={tint} 
                        thickness={thickness} 
                        shimmer={shimmer} 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setClickCount(0)}
                      >
                        Reset
                      </GlassButton>
                    </div>
                  </div>

                  {/* Size showcase */}
                  <h3 style={{ fontSize: '16px', color: 'rgba(0,0,0,0.55)', marginBottom: '12px' }}>Sizes</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '30px' }}>
                    <GlassButton intensity={intensity} tint={tint} thickness={thickness} shimmer={shimmer} size="sm">Small Button</GlassButton>
                    <GlassButton intensity={intensity} tint={tint} thickness={thickness} shimmer={shimmer} size="md">Medium Button</GlassButton>
                    <GlassButton intensity={intensity} tint={tint} thickness={thickness} shimmer={shimmer} size="lg">Large Button</GlassButton>
                  </div>

                  {/* Style showcase */}
                  <h3 style={{ fontSize: '16px', color: 'rgba(0,0,0,0.55)', marginBottom: '12px' }}>Style Variants</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <GlassButton intensity={intensity} tint={tint} thickness={thickness} shimmer={shimmer} variant="default">Default</GlassButton>
                    <GlassButton intensity={intensity} tint={tint} thickness={thickness} shimmer={shimmer} variant="ghost">Ghost</GlassButton>
                    <GlassButton intensity={intensity} tint={tint} thickness={thickness} shimmer={shimmer} variant="destructive">Destructive</GlassButton>
                    <GlassButton intensity={intensity} tint={tint} thickness={thickness} shimmer={shimmer} disabled>Disabled</GlassButton>
                  </div>
                </GlassCard>
              )}

              {activeTab === 2 && (
                <GlassCard intensity={intensity} tint={tint} thickness={thickness} shimmer={shimmer} radius="36px">
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: 700, marginTop: 0, marginBottom: '24px' }}>
                    Interactive Inputs
                  </h2>
                  <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '14px', marginBottom: '24px' }}>
                    Click into the fields to witness the edge-diffraction focus effect. The bezel glow transitions smoothly and pulses with a sub-frequency rotation.
                  </p>

                  <div className="demo-input-stack" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
                    <GlassInput
                      label="Developer Name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      intensity={intensity}
                      tint={tint}
                    />

                    <GlassInput
                      label="Organization Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      intensity={intensity}
                      tint={tint}
                    />

                    <div style={{ marginTop: '10px' }}>
                      <GlassButton 
                        intensity={intensity} 
                        tint={tint} 
                        thickness={thickness} 
                        shimmer={shimmer} 
                        onClick={() => alert(`Submitting: ${username} (${email})`)}
                        style={{ width: '100%' }}
                      >
                        Authenticate Access
                      </GlassButton>
                    </div>
                  </div>
                </GlassCard>
              )}

              {activeTab === 3 && (
                <GlassCard intensity={intensity} tint={tint} thickness={thickness} shimmer={shimmer} radius="36px">
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: 700, marginTop: 0, marginBottom: '24px' }}>
                    iOS 26 Custom Glass Sliders
                  </h2>
                  <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '14px', marginBottom: '30px' }}>
                    Replicating the iOS 26 control center glass sliders. Supports touch/mouse dragging, fluid custom active fills, and native accessibility.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Slider 1: Control Center Volume (Thick Block / No Thumb) */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(0,0,0,0.55)', marginBottom: '10px' }}>
                        <span>System Volume (iOS Control Center Block Slider)</span>
                        <span style={{ fontWeight: 600 }}>{volume}%</span>
                      </div>
                      <GlassSlider
                        value={volume}
                        min={0}
                        max={100}
                        onChange={setVolume}
                        showThumb={false}
                        icon={<VolumeIcon size={20} />}
                        label="Volume"
                        intensity={intensity}
                        tint={tint}
                        thickness={thickness}
                        shimmer={shimmer}
                      />
                    </div>
                  </div>
                </GlassCard>
              )}

              {activeTab === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <GlassCard intensity={intensity} tint={tint} thickness={thickness} shimmer={shimmer} radius="36px">
                    <h3 style={{ margin: '0 0 10px 0', fontFamily: 'Outfit, sans-serif', fontSize: '20px' }}>Default Card</h3>
                    <p style={{ margin: 0, color: 'rgba(0,0,0,0.65)', fontSize: '14px', lineHeight: 1.5 }}>
                      This card uses standard paddings and corner border-radius. It acts as an elite container that isolates its contents while remaining physically cohesive with whatever is behind it.
                    </p>
                  </GlassCard>

                  <div className="demo-two-column" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <GlassCard intensity={intensity} tint="rgba(0, 242, 254, 0.1)" thickness={thickness} shimmer={shimmer} radius="36px" padding="20px">
                      <h4 style={{ margin: '0 0 8px 0', color: '#00a3ad' }}>Subtle Cyan Tint</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'rgba(0,0,0,0.6)', lineHeight: 1.4 }}>
                        Perfect for info tiles, stats indicators, or system alert containers.
                      </p>
                    </GlassCard>

                    <GlassCard intensity={intensity} tint="rgba(255, 42, 133, 0.1)" thickness={thickness} shimmer={shimmer} radius="36px" padding="20px">
                      <h4 style={{ margin: '0 0 8px 0', color: '#d01c62' }}>Subtle Rose Tint</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'rgba(0,0,0,0.6)', lineHeight: 1.4 }}>
                        Commonly used for highlighting error conditions, warnings, or special premium selections.
                      </p>
                    </GlassCard>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>

        {/* Slide up sheet */}
        <GlassSheet open={isSheetOpen} onClose={() => setIsSheetOpen(false)} intensity={intensity} tint={tint}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '28px', fontWeight: 800, margin: '0 0 12px 0' }}>
              iOS 26 Control Drawer
            </h2>
            <p style={{ color: 'rgba(0,0,0,0.6)', maxWidth: '500px', margin: '0 auto 24px', lineHeight: 1.6 }}>
              This is a bottom drawer designed with absolute glass fidelity. The page backing is locked while the drawer floats dynamically in front of the blurry canvas blobs.
            </p>
            <div className="demo-sheet-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <GlassButton intensity={intensity} tint={tint} thickness={thickness} shimmer={shimmer} onClick={() => alert('Confirmed!')}>
                Action Confirmed
              </GlassButton>
              <GlassButton intensity={intensity} tint={tint} thickness={thickness} shimmer={shimmer} variant="ghost" onClick={() => setIsSheetOpen(false)}>
                Close Panel
              </GlassButton>
            </div>
          </div>
        </GlassSheet>
      </div>
    </LiquidGlassFilter>
  );
}
