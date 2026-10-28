import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://liquidglass.theatom.lk').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Liquid Glass for the Web — React components by Zaki Sheriff',
  description:
    'Real refracting liquid glass for React: switches, tab bars, segmented controls, sliders, buttons, search fields and sheets that bend light like iOS 26.',
  keywords: [
    'liquid glass',
    'liquid glass web',
    'liquid glass react',
    'iOS 26 glass',
    'glassmorphism react',
    'react ui components',
    '@zakisheriff/liquid-glass',
  ],
  authors: [{ name: 'Zaki Sheriff', url: 'https://github.com/zakisheriff' }],
  alternates: { canonical: '/' },
  icons: { icon: '/LG-Logo.png', apple: '/LG-Logo.png' },
  openGraph: {
    type: 'website',
    siteName: 'Liquid Glass for the Web',
    title: 'Liquid Glass for the Web',
    description: 'Real refracting liquid glass components for React.',
    url: '/',
    images: [{ url: '/LG-Logo.png', width: 1080, height: 1080, alt: 'Liquid Glass logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Liquid Glass for the Web',
    description: 'Real refracting liquid glass components for React.',
    images: ['/LG-Logo.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// The site's own toggle wins over the OS: theme, colour-scheme and the
// browser toolbar tint (theme-color) all follow data-theme, never the system.
const themeScript = `(function(){var t='light';try{t=localStorage.getItem('lg-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}}catch(e){}var d=document.documentElement;d.dataset.theme=t;d.style.colorScheme=t;var m=document.getElementById('theme-color');if(m)m.setAttribute('content',t==='dark'?'#000000':'#f5f5f7')})()`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareSourceCode',
  name: '@zakisheriff/liquid-glass',
  description: 'Real refracting liquid glass UI components for React.',
  url: `${SITE_URL}/`,
  codeRepository: 'https://github.com/zakisheriff/Liquid-Glass',
  programmingLanguage: ['TypeScript', 'React', 'CSS'],
  license: 'https://opensource.org/licenses/MIT',
  author: { '@type': 'Person', name: 'Zaki Sheriff', url: 'https://github.com/zakisheriff' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta id="theme-color" name="theme-color" content="#f5f5f7" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
