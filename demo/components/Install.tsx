'use client';

import { useState } from 'react';
import { GlassButton } from '@zakisheriff/liquid-glass';
import { Check, Copy } from './icons';

const COMMAND = 'npm i @zakisheriff/liquid-glass';

const SNIPPET = `import { useState } from 'react';
import { GlassSwitch } from '@zakisheriff/liquid-glass';
import '@zakisheriff/liquid-glass/styles.css';

export function Settings() {
  const [on, setOn] = useState(true);
  return <GlassSwitch checked={on} onChange={setOn} />;
}`;

const PROMPT = `Add Apple-style Liquid Glass to this React app using @zakisheriff/liquid-glass.

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
6. In Next.js the package is already marked "use client".

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
        <h2>Get started.</h2>
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
      <pre className="install__code">
        <code>{SNIPPET}</code>
      </pre>
      <div className="install__links">
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
