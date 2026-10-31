import type { Metadata } from 'next';
import './studio.css';

/** A private workspace for screen recordings: not linked, not indexed. */
export const metadata: Metadata = {
  title: 'Studio',
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
