import type { MetadataRoute } from 'next';
import { SITE_URL, UPDATED } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: UPDATED },
    { url: `${SITE_URL}/docs`, lastModified: UPDATED },
  ];
}
