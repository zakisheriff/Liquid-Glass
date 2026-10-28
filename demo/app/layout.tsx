import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL, structuredData } from '@/lib/site';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: '%s | Liquid Glass for Web' },
  description: SITE_DESCRIPTION,
  applicationName: 'Liquid Glass for the Web',
  category: 'Developer tools',
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
  creator: 'Zaki Sheriff',
  alternates: { canonical: '/' },
  robots: {
    index: process.env.VERCEL_ENV !== 'preview', follow: true,
    googleBot: { index: process.env.VERCEL_ENV !== 'preview', follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : undefined,
  },
  icons: { icon: '/LG-Logo.png', apple: '/LG-Logo.png' },
  openGraph: {
    type: 'website',
    siteName: 'Liquid Glass for the Web',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: '/',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta id="theme-color" name="theme-color" content="#f5f5f7" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="describedby" href={`${SITE_URL}/llms.txt`} type="text/plain" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
