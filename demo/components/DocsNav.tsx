'use client';

import { GlassButton } from '@zakisheriff/liquid-glass';
import { DocsThemeToggle } from './DocsThemeToggle';
import { ArrowLeft, GitHub, Npm } from './icons';

/** The docs page's pinned top links, as liquid glass buttons. */
export function DocsNav({ repository, npm }: { repository: string; npm: string }) {
  return (
    <nav className="docs__nav" aria-label="Documentation">
      <GlassButton size="sm" className="docs__back" icon={<ArrowLeft size={15} />} href="/">
        Live demo
      </GlassButton>
      <GlassButton size="sm" icon={<GitHub size={16} />} href={repository} target="_blank">
        GitHub
      </GlassButton>
      <GlassButton size="sm" icon={<Npm size={15} />} href={npm} target="_blank">
        npm
      </GlassButton>
      <DocsThemeToggle />
    </nav>
  );
}
