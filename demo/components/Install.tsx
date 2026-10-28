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

export function Install() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <section className="install" id="install">
      <header className="section-head">
        <h2>Ready in one line.</h2>
      </header>
      <div className="install__command">
        <code>{COMMAND}</code>
        <GlassButton
          size="sm"
          icon={copied ? <Check size={16} /> : <Copy size={16} />}
          aria-label={copied ? 'Copied' : 'Copy install command'}
          onClick={copy}
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
    </section>
  );
}
