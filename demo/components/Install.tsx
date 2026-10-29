'use client';

import { useState } from 'react';
import { GlassButton } from '@zakisheriff/liquid-glass';
import { CodeBlock } from './CodeBlock';
import { Check, Copy } from './icons';

const COMMAND = 'npm i @zakisheriff/liquid-glass';

const SNIPPET = `'use client';

import { useState } from 'react';
import { GlassButton, GlassCard, GlassSlider, GlassSwitch } from '@zakisheriff/liquid-glass';
import '@zakisheriff/liquid-glass/styles.css';

// A quick-settings panel. Glass needs something behind it to bend,
// so it sits on a gradient; swap in any image.
export default function QuickSettings() {
  const [wifi, setWifi] = useState(true);
  const [volume, setVolume] = useState(60);

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #5b8cff, #c86dd7)' }}>
      <GlassCard padding="20px" radius="28px" style={{ display: 'grid', gap: 18, width: 320 }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Wi-Fi
          <GlassSwitch checked={wifi} onChange={setWifi} />
        </label>
        <GlassSlider value={volume} onChange={setVolume} aria-label="Volume" />
        <GlassButton variant="filled" onClick={() => console.log({ wifi, volume })}>
          Save
        </GlassButton>
      </GlassCard>
    </main>
  );
}`;

const PROMPT = `Add Apple-style Liquid Glass to this React / Next.js app using @zakisheriff/liquid-glass.

1. Install it: npm i @zakisheriff/liquid-glass
2. Import the stylesheet once at the app root: import '@zakisheriff/liquid-glass/styles.css'
3. Replace existing UI with the glass components where they fit:
   - Buttons → GlassButton (variant: glass | clear | tinted | filled, plus destructive, tint, size, icon)
   - Toggles → GlassSwitch (checked, onChange)
   - Bottom / tab navigation → GlassNav (items: { label, icon }[], activeIndex, onChange)
   - Tabs / filters → GlassSegmented (options, value, onChange)
   - Range inputs → GlassSlider (value, onChange; showThumb={false} for Control Center blocks)
   - Search / text fields → GlassInput (type="search" for a search field)
   - Panels → GlassCard · Bottom sheets / modals → GlassSheet (open, onClose)
4. Glass needs something behind it to bend: place bars and controls over images, gradients or scrolling content, not flat white.
5. Theme: follow the system, or set data-theme="light" | "dark" on <html>.
6. In Next.js, add 'use client' to components that own interactive state. Import the stylesheet from app/layout.tsx (App Router) or pages/_app.tsx (Pages Router).

Docs: https://github.com/zakisheriff/Liquid-Glass#readme`;

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((k) => (k === key ? null : k)), 1600);
    } catch {
      /* clipboard blocked */
    }
  };
  return { copied, copy };
}

export function Install() {
  const { copied, copy } = useCopy();

  return (
    <section className="install" id="install">
      <header className="section-head">
        <h2>Get Started.</h2>
      </header>
      <div className="install__command">
        <code>{COMMAND}</code>
        <GlassButton
          size="sm"
          icon={copied === 'cmd' ? <Check size={16} /> : <Copy size={16} />}
          aria-label={copied === 'cmd' ? 'Copied' : 'Copy install command'}
          onClick={() => copy('cmd', COMMAND)}
        />
      </div>
      <CodeBlock className="install__snippet" code={SNIPPET} label="example component" />
      <div className="install__links">
        <a className="install__docs" href="/docs">Documentation →</a>
        <GlassButton onClick={() => window.open('https://www.npmjs.com/package/@zakisheriff/liquid-glass', '_blank')}>
          npm
        </GlassButton>
        <GlassButton onClick={() => window.open('https://github.com/zakisheriff/Liquid-Glass', '_blank')}>GitHub</GlassButton>
      </div>

      <div className="agent">
        <header className="section-head">
          <h2>Prompt your AI agent.</h2>
        </header>
        <div className="agent__card">
          <div className="agent__bar">
            <span className="agent__label">Claude Code · Codex · Cursor · Copilot</span>
            <GlassButton
              size="sm"
              variant={copied === 'prompt' ? 'tinted' : 'filled'}
              icon={copied === 'prompt' ? <Check size={16} /> : <Copy size={16} />}
              onClick={() => copy('prompt', PROMPT)}
            >
              {copied === 'prompt' ? 'Copied' : 'Copy prompt'}
            </GlassButton>
          </div>
          <pre className="agent__prompt">
            <code>{PROMPT}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
