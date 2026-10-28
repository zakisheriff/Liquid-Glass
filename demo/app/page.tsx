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
          <p className="footer__brand">Liquid Glass</p>
          <nav className="footer__links" aria-label="Footer">
            <a href="#components">Components</a>
            <a href="#refraction">Refraction</a>
            <a href="#install">Install</a>
            <a href="https://www.npmjs.com/package/@zakisheriff/liquid-glass" target="_blank" rel="noreferrer">
              npm
            </a>
            <a href="https://github.com/zakisheriff/Liquid-Glass" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
          <p className="footer__credit">
            Built by{' '}
            <a href="https://github.com/zakisheriff" target="_blank" rel="noreferrer">
              Zaki Sheriff
            </a>{' '}
            ·{' '}
            <a href="https://theatom.lk" target="_blank" rel="noreferrer">
              The Atom
            </a>
          </p>
          <p className="footer__legal">
            MIT License · © {new Date().getFullYear()} Zaki Sheriff · Not affiliated with Apple Inc.
          </p>
        </div>
      </footer>
    </ThemeProvider>
  );
}
