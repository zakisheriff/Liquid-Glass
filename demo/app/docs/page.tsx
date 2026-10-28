import type { Metadata } from 'next';
import Link from 'next/link';
import { COMPONENTS, FAQS, QUICK_START } from '@/lib/docs';
import { NPM_URL, PACKAGE_VERSION, REPOSITORY, SITE_URL, UPDATED } from '@/lib/site';

const title = 'Liquid Glass React & Next.js Documentation';
const description = 'Install and use liquid glass in React and Next.js. Component APIs, continuous sliders, theming, keyboard controls and browser support for @zakisheriff/liquid-glass.';

export const metadata: Metadata = {
  title: 'React & Next.js Documentation', description,
  alternates: { canonical: '/docs', types: { 'text/markdown': '/docs.md' } },
  openGraph: { title, description, url: '/docs', type: 'article', authors: ['Zaki Sheriff'], images: [{ url: '/social-card.png', width: 1200, height: 630, alt: 'Liquid Glass for Web — React and Next.js components' }] },
  twitter: { card: 'summary_large_image', title, description, images: ['/social-card.png'] },
};

export default function Documentation() {
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'TechArticle', '@id': `${SITE_URL}/docs#guide`, headline: title, description, url: `${SITE_URL}/docs`, dateModified: UPDATED, inLanguage: 'en', author: { '@id': `${SITE_URL}/#author` }, about: { '@id': `${SITE_URL}/#software` }, isPartOf: { '@id': `${SITE_URL}/#website` } },
    { '@type': 'FAQPage', '@id': `${SITE_URL}/docs#questions`, mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) },
  ] };
  return <main className="docs">
    <link rel="alternate" type="text/markdown" href={`${SITE_URL}/docs.md`} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <nav className="docs__nav" aria-label="Documentation"><Link href="/">← Live demo</Link><a href={REPOSITORY}>GitHub</a><a href={NPM_URL}>npm · v{PACKAGE_VERSION}</a></nav>
    <header><h1>Liquid Glass for React and Next.js</h1><p>Apple-inspired glass for the web, with refraction and spring-based touch interactions. Built by <a href="https://github.com/zakisheriff">Zaki Sheriff</a>. Open source under the MIT license.</p></header>
    <nav className="docs__contents" aria-label="On this page"><a href="#quick-start">Quick start</a><a href="#api">Components</a><a href="#styling">Styling</a><a href="#browser-support">Browser support</a><a href="#questions">Questions</a></nav>
    <section id="quick-start"><h2>Add liquid glass to your app</h2><pre><code>npm i @zakisheriff/liquid-glass</code></pre><p>Requires React and React DOM 17 or later. Import the stylesheet once at the app root: <code>app/layout.tsx</code> for the Next.js App Router, or <code>pages/_app.tsx</code> for the Pages Router. Keep components that manage interactive state in a client component.</p><pre><code>{QUICK_START}</code></pre></section>
    <section id="api"><h2>Liquid glass components</h2><p>Each component works with React state. See the <a href={`${REPOSITORY}#props-reference`}>complete props reference</a> for additional options.</p><div className="docs__table"><table><thead><tr><th scope="col">Component</th><th scope="col">Use</th><th scope="col">Key props</th></tr></thead><tbody>{COMPONENTS.map(c => <tr key={c.name}><th scope="row"><code>{c.name}</code></th><td>{c.description}</td><td><code>{c.props}</code></td></tr>)}</tbody></table></div></section>
    <section id="styling"><h2>Theming and interaction</h2><p>Set <code>data-theme="light"</code> or <code>data-theme="dark"</code> on an ancestor, or follow the system theme. Place glass over gradients, images or scrolling content so its transparency and refraction are visible.</p><p>Sliders drag continuously with <code>step="any"</code> by default. Pass a numeric step, such as <code>{'step={5}'}</code>, to snap to fixed increments. The callback receives the full numeric value.</p><p>Give fields and icon-only controls accessible labels. Tab bars and segmented controls support arrow keys, Home and End. Check text contrast over your own backgrounds.</p></section>
    <section id="browser-support"><h2>Browser support</h2><p>Chromium can apply SVG displacement to the live backdrop. Safari and Firefox use translucent glass, highlights and mirrored content for supported thumbs. Effects vary by browser. The large refraction example in the demo uses WebGL.</p><p>This project recreates an Apple-inspired visual style for websites; it is independent of Apple Inc.</p></section>
    <section id="questions"><h2>Common questions</h2>{FAQS.map(f => <details key={f.question}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</section>
    <footer><p><Link href="/">Try the interactive demo</Link> · <a href="/docs.md">Markdown guide</a> · <a href="/llms.txt">llms.txt</a></p><p>Updated {UPDATED} · MIT license · Zaki Sheriff</p></footer>
  </main>;
}
