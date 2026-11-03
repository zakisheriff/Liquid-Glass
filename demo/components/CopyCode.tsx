'use client';

import { useEffect, useRef, useState } from 'react';
import { GlassButton } from '@zakisheriff/liquid-glass';
import { Check, Copy } from './icons';

/** A "Copy code" button for a demo's JSX as currently configured. */
export function CopyCode({ code, label = 'code' }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <GlassButton
      className="copy-code"
      size="sm"
      icon={copied ? <Check size={15} /> : <Copy size={15} />}
      aria-label={copied ? 'Copied' : `Copy ${label}`}
      title="Copies the React code for this preview, with the options you picked"
      onClick={copy}
    >
      {copied ? 'Copied' : 'Copy code'}
    </GlassButton>
  );
}
