import type { Metadata } from 'next';
import Link from 'next/link';
import { FAQS, PERFORMANCE, QUICK_START } from '@/lib/docs';
import { GUIDES } from '@/lib/guides';
import { DemoVideo } from '@/components/DemoVideo';
import { DocsPreview } from '@/components/DocsPreview';
import { CodeBlock } from '@/components/CodeBlock';
import { DocsNav } from '@/components/DocsNav';
import { ThemeProvider } from '@/components/theme';
import { NPM_URL, REPOSITORY, SITE_URL, UPDATED } from '@/lib/site';

const title = 'Liquid Glass React & Next.js Documentation';
const description = 'Install and use liquid glass in React and Next.js. Component APIs, continuous sliders, theming, keyboard controls and browser support for @zakisheriff/liquid-glass.';

export const metadata: Metadata = {
  title: 'React & Next.js Documentation', description,
  alternates: { canonical: '/docs', types: { 'text/markdown': '/docs.md' } },
  openGraph: { title, description, url: '/docs', type: 'article', authors: ['Zaki Sheriff'], images: [{ url: '/LG-Logo.png', width: 1080, height: 1080, alt: 'Liquid Glass app logo' }] },
  twitter: { card: 'summary', title, description, images: ['/LG-Logo.png'] },
};

export default function Documentation() {
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'TechArticle', '@id': `${SITE_URL}/docs#guide`, headline: title, description, url: `${SITE_URL}/docs`, dateModified: UPDATED, inLanguage: 'en', author: { '@id': `${SITE_URL}/#author` }, about: { '@id': `${SITE_URL}/#software` }, isPartOf: { '@id': `${SITE_URL}/#website` } },
    { '@type': 'FAQPage', '@id': `${SITE_URL}/docs#questions`, mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) },
    { '@type': 'BreadcrumbList', '@id': `${SITE_URL}/docs#breadcrumbs`, itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Liquid Glass', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Documentation', item: `${SITE_URL}/docs` },
    ] },
    { '@type': 'HowTo', '@id': `${SITE_URL}/docs#quick-start`, name: 'Add liquid glass to a React or Next.js app', totalTime: 'PT2M', tool: [{ '@type': 'HowToTool', name: 'npm' }], step: [
      { '@type': 'HowToStep', position: 1, name: 'Install the package', text: 'Run npm i @zakisheriff/liquid-glass.', url: `${SITE_URL}/docs#quick-start` },
      { '@type': 'HowToStep', position: 2, name: 'Import the stylesheet once', text: "Import '@zakisheriff/liquid-glass/styles.css' in app/layout.tsx (App Router) or pages/_app.tsx (Pages Router).", url: `${SITE_URL}/docs#quick-start` },
      { '@type': 'HowToStep', position: 3, name: 'Use a component', text: "Import a component such as GlassSwitch in a client component ('use client') and render it with React state.", url: `${SITE_URL}/docs#api` },
    ] },
  ] };
  return <ThemeProvider><main className="docs">
    <link rel="alternate" type="text/markdown" href={`${SITE_URL}/docs.md`} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <DocsNav repository={REPOSITORY} npm={NPM_URL} />
    <header><h1>Liquid Glass for React and Next.js</h1><p>Apple-inspired glass for the web, with refraction and spring-based touch interactions. Built by <a href="https://github.com/zakisheriff" style={{ whiteSpace: 'nowrap' }}>Zaki Sheriff</a>. Open source under the MIT license.</p></header>
    <nav className="docs__contents" aria-label="On this page"><a href="#demo">Demo</a><a href="#quick-start">Quick start</a><a href="#api">Components</a><a href="#styling">Styling</a><a href="#performance">Performance</a><a href="#browser-support">Browser support</a><a href="#questions">Questions</a></nav>
    <section id="demo"><h2>Demo Video</h2><DemoVideo /><p>Every control in the recording is a component from this library. Try them yourself in the <Link href="/">live demo</Link>.</p></section>
    <section id="quick-start"><h2>Add liquid glass to your app</h2><CodeBlock code="npm i @zakisheriff/liquid-glass" label="install command" /><p>Requires React and React DOM 17 or later. Import the stylesheet once at the app root: <code>app/layout.tsx</code> for the Next.js App Router, or <code>pages/_app.tsx</code> for the Pages Router. Keep components that manage interactive state in a client component.</p><CodeBlock code={QUICK_START} label="quick start code" /></section>
    <section id="api"><h2>Liquid glass components</h2><p>Every example assumes <code>useState</code> from React and the stylesheet imported once. Icons such as <code>{'<PlusIcon />'}</code> stand for any React node, like an SVG icon component.</p><nav className="docs__components" aria-label="Components">{GUIDES.map(g => <a key={g.id} href={`#${g.id}`}>{g.title}</a>)}</nav></section>
    {GUIDES.map(g => <section key={g.id} id={g.id} className="docs__guide">
      <h2>{g.title} <code>{g.name}</code></h2>
      <p>{g.summary}</p>
      {g.examples.map(e => <div key={e.title}><h3>{e.title}</h3><DocsPreview guide={g.id} example={e.title} /><CodeBlock className="docs__code" code={e.code} label={`${e.title} code`} /></div>)}
      <h3>Props</h3>
      <div className="docs__table"><table><thead><tr><th scope="col">Prop</th><th scope="col">Type</th><th scope="col">Default</th><th scope="col">Description</th></tr></thead><tbody>{g.props.map(p => <tr key={p.name}><th scope="row"><code>{p.name}</code></th><td>{p.type && <code>{p.type}</code>}</td><td>{p.default && <code>{p.default}</code>}</td><td>{p.description.split('`').map((part, i) => i % 2 ? <code key={i}>{part}</code> : part)}</td></tr>)}</tbody></table></div>
      {g.passthrough && <p>Also accepts {g.passthrough.split('`').map((part, i) => i % 2 ? <code key={i}>{part}</code> : part)}.</p>}
      {g.notes?.map(n => <p key={n}>{n.split('`').map((part, i) => i % 2 ? <code key={i}>{part}</code> : part)}</p>)}
    </section>)}
    <section id="styling"><h2>Theming and interaction</h2><p>Set <code>data-theme="light"</code> or <code>data-theme="dark"</code> on an ancestor, or follow the system theme. Place glass over gradients, images or scrolling content so its transparency and refraction are visible.</p><p>Sliders drag continuously with <code>step="any"</code> by default. Pass a numeric step, such as <code>{'step={5}'}</code>, to snap to fixed increments. The callback receives the full numeric value.</p><p>Give fields and icon-only controls accessible labels. Tab bars and segmented controls support arrow keys, Home and End. Check text contrast over your own backgrounds.</p></section>
    <section id="performance"><h2>Lightweight by design</h2><p>The whole library is {PERFORMANCE.js} of JavaScript and {PERFORMANCE.css} of CSS gzipped.</p><ul>{PERFORMANCE.points.map(p => <li key={p}>{p}</li>)}</ul><h3>Keeping it fast</h3><ul>{PERFORMANCE.tips.map(p => <li key={p}>{p}</li>)}</ul></section>
    <section id="browser-support"><h2>Browser support</h2><p>Chromium applies SVG displacement to the live backdrop for bars, buttons and cards, and refracts a tinted live copy inside tab and segmented lenses. Safari and Firefox use translucent glass, highlights and magnified live copies inside lenses (switch, slider, tab bar and segmented control). Effects vary by browser. The large refraction example in the demo uses WebGL.</p><p>This project recreates an Apple-inspired visual style for websites; it is independent of Apple Inc.</p></section>
    <section id="questions"><h2>Common questions</h2>{FAQS.map(f => <details key={f.question}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</section>
    <footer><p><Link href="/">Try the interactive demo</Link> · <a href="/docs.md">Markdown guide</a> · <a href="/llms.txt">llms.txt</a></p><p>Updated {UPDATED} · MIT license · Zaki Sheriff</p></footer>
  </main></ThemeProvider>;
}
