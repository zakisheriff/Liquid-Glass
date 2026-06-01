import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const siteUrl = (process.env.VITE_SITE_URL || 'https://liquidglass.theatom.lk').replace(/\/$/, '');

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
      source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
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
              src: '/LG-Logo.png',
              sizes: '1080x1080',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        null,
        2,
      ),
    });

    this.emitFile({
      type: 'asset',
      fileName: 'browserconfig.xml',
      source: `<?xml version="1.0" encoding="utf-8"?>\n<browserconfig>\n  <msapplication>\n    <tile>\n      <square150x150logo src="/LG-Logo.png"/>\n      <TileColor>#f3f6fb</TileColor>\n    </tile>\n  </msapplication>\n</browserconfig>\n`,
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
