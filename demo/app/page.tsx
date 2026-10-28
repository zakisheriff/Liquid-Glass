import { ThemeProvider } from '@/components/theme';
import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';
import { Tiles } from '@/components/Tiles';
import { LensDemo } from '@/components/LensDemo';
import { Install } from '@/components/Install';

export default function Page() {
  return (
    <ThemeProvider>
      <Nav />
      <main>
        <Hero />
        <Tiles />
        <LensDemo />
        <Install />
      </main>
      <footer className="footer">
        <div className="footer__inner">
          <p>
            Built by{' '}
            <a href="https://github.com/zakisheriff" target="_blank" rel="noreferrer">
              Zaki Sheriff
            </a>{' '}
            · The Atom
          </p>
          <p className="footer__legal">
            MIT License · Copyright © {new Date().getFullYear()} Zaki Sheriff. Not affiliated with Apple Inc.
          </p>
        </div>
      </footer>
    </ThemeProvider>
  );
}
