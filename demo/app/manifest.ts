import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION } from '@/lib/site';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Liquid Glass for the Web',
    short_name: 'Liquid Glass',
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f5f7',
    theme_color: '#f5f5f7',
    categories: ['developer', 'design', 'productivity'],
    icons: [{ src: '/LG-Logo.png', sizes: '1080x1080', type: 'image/png', purpose: 'any' }],
  };
}
