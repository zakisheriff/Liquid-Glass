'use client';

import { useEffect, useRef, useState } from 'react';
import { GlassButton } from '@zakisheriff/liquid-glass';
import { highlight } from './highlight';
import { Check, Copy } from './icons';

/** A code sample with a copy button in its top-right corner. */
export function CodeBlock({ code, className, label = 'code' }: { code: string; className?: string; label?: string }) {
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
    <div className={['code-block', className].filter(Boolean).join(' ')}>
      <pre><code>{highlight(code)}</code></pre>
      <GlassButton
        className="code-block__copy"
        size="sm"
        icon={copied ? <Check size={15} /> : <Copy size={15} />}
        aria-label={copied ? 'Copied' : `Copy ${label}`}
        onClick={copy}
      />
    </div>
  );
}
