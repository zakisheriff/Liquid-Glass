'use client';

import { useRouter } from 'next/navigation';
import { GlassButton } from '@zakisheriff/liquid-glass';
import { DocsThemeToggle } from './DocsThemeToggle';
import { ArrowLeft, GitHub, Npm } from './icons';

/** The docs page's pinned top links, as liquid glass buttons. */
export function DocsNav({ repository, npm }: { repository: string; npm: string }) {
  const router = useRouter();
  return (
    <nav className="docs__nav" aria-label="Documentation">
      <GlassButton size="sm" className="docs__back" icon={<ArrowLeft size={15} />} onClick={() => router.push('/')}>
        Live demo
      </GlassButton>
      <GlassButton size="sm" icon={<GitHub size={16} />} onClick={() => { window.location.href = repository; }}>
        GitHub
      </GlassButton>
      <GlassButton size="sm" icon={<Npm size={15} />} onClick={() => { window.location.href = npm; }}>
        npm
      </GlassButton>
      <DocsThemeToggle />
    </nav>
  );
}
