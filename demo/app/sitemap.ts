import type { MetadataRoute } from 'next';
import { SITE_URL, UPDATED } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: UPDATED, changeFrequency: 'weekly', priority: 1, images: [`${SITE_URL}/LG-Logo.png`] },
    { url: `${SITE_URL}/docs`, lastModified: UPDATED, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/docs.md`, lastModified: UPDATED, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/llms.txt`, lastModified: UPDATED, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/llms-full.txt`, lastModified: UPDATED, changeFrequency: 'weekly', priority: 0.5 },
  ];
}
