import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const siteUrl = (process.env.VITE_SITE_URL || 'https://liquid-glass.zakisheriff.com').replace(/\/$/, '');

const seoAssets = () => ({
  name: 'liquid-glass-seo-assets',
  transformIndexHtml: {
    order: 'pre' as const,
    handler(html: string) {
      return html.replace(/%SITE_URL%/g, siteUrl);
    },
  },
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'robots.txt',
      source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
    });

    this.emitFile({
      type: 'asset',
      fileName: 'sitemap.xml',
      source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://www.npmjs.com/package/@zakisheriff/liquid-glass</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n  <url>\n    <loc>https://github.com/zakisheriff/Liquid-Glass</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>\n`,
    });

    this.emitFile({
      type: 'asset',
      fileName: 'site.webmanifest',
      source: JSON.stringify(
        {
          name: 'Liquid Glass for Web',
          short_name: 'Liquid Glass',
          description: 'React UI components for iOS-style liquid glass effects on the web.',
          start_url: '/',
          display: 'standalone',
          background_color: '#f3f6fb',
          theme_color: '#f3f6fb',
          icons: [
            {
              src: '/favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        null,
        2,
      ),
    });
  },
});

export default defineConfig({
  plugins: [react(), seoAssets()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});
