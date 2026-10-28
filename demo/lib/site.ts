import { version } from '../../package.json';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://liquidglass.theatom.lk').replace(/\/$/, '');
export const SITE_TITLE = 'Liquid Glass for Web — React & Next.js Components';
export const SITE_DESCRIPTION = 'Apple-inspired liquid glass for the web. Real refracting React and Next.js buttons, switches, tab bars, sliders, menus and sheets. Lightweight, open source, MIT licensed.';
export const PACKAGE_VERSION = version;
export const UPDATED = '2026-10-28';
export const REPOSITORY = 'https://github.com/zakisheriff/Liquid-Glass';
export const NPM_URL = 'https://www.npmjs.com/package/@zakisheriff/liquid-glass';
export const SUPPORT_URL = 'https://buymeacoffee.com/theoneatom';
export const PUBLISHER_URL = 'https://theatom.lk';

/** The components, for search results and answer engines. */
export const COMPONENT_NAMES = ['GlassButton', 'GlassSwitch', 'GlassNav', 'GlassMenu', 'GlassSegmented', 'GlassSlider', 'GlassInput', 'GlassCard', 'GlassSheet'];

export const KEYWORDS = [
  'liquid glass',
  'liquid glass web',
  'liquid glass react',
  'liquid glass nextjs',
  'liquid glass css',
  'apple liquid glass',
  'iOS 26 liquid glass',
  'glassmorphism react',
  'glass ui components',
  'react ui components',
  'nextjs ui library',
  'refraction css',
  '@zakisheriff/liquid-glass',
];

export const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Person', '@id': `${SITE_URL}/#author`, name: 'Zaki Sheriff', url: 'https://github.com/zakisheriff', sameAs: ['https://github.com/zakisheriff', 'https://www.npmjs.com/~zakisheriff'], worksFor: { '@id': `${SITE_URL}/#publisher` } },
    { '@type': 'Organization', '@id': `${SITE_URL}/#publisher`, name: 'The Atom', url: PUBLISHER_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/LG-Logo.png`, width: 1080, height: 1080 } },
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'Liquid Glass for the Web', alternateName: 'Liquid Glass', url: `${SITE_URL}/`, description: SITE_DESCRIPTION, inLanguage: 'en', creator: { '@id': `${SITE_URL}/#author` }, publisher: { '@id': `${SITE_URL}/#publisher` } },
    {
      '@type': 'WebPage', '@id': `${SITE_URL}/#webpage`, url: `${SITE_URL}/`, name: SITE_TITLE, description: SITE_DESCRIPTION,
      inLanguage: 'en', isPartOf: { '@id': `${SITE_URL}/#website` }, about: { '@id': `${SITE_URL}/#software` },
      primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE_URL}/LG-Logo.png` }, dateModified: UPDATED,
    },
    {
      '@type': 'ItemList', '@id': `${SITE_URL}/#components`, name: 'Liquid Glass components',
      itemListElement: COMPONENT_NAMES.map((name, i) => ({ '@type': 'ListItem', position: i + 1, name, url: `${SITE_URL}/docs#api` })),
    },
    {
      '@type': 'SoftwareApplication', '@id': `${SITE_URL}/#software`, name: '@zakisheriff/liquid-glass',
      alternateName: 'Liquid Glass for the Web', url: `${SITE_URL}/`, description: SITE_DESCRIPTION,
      applicationCategory: 'DeveloperApplication', applicationSubCategory: 'UI component library', operatingSystem: 'Web',
      softwareVersion: PACKAGE_VERSION, dateModified: UPDATED, keywords: KEYWORDS.join(', '),
      softwareRequirements: 'React 17 or later and React DOM 17 or later', installUrl: NPM_URL, downloadUrl: NPM_URL,
      image: `${SITE_URL}/LG-Logo.png`, screenshot: `${SITE_URL}/social-card.png`,
      featureList: [
        'Snell\'s-law refraction through a curved glass bevel',
        'Lenses that magnify and bend content at the rim',
        'Spring physics: swell, stretch and jelly settle on touch',
        'Light and dark themes',
        'About 31 KB of JavaScript gzipped, no runtime dependencies',
        ...COMPONENT_NAMES,
      ],
      publisher: { '@id': `${SITE_URL}/#publisher` },
      license: 'https://opensource.org/licenses/MIT', isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', url: NPM_URL },
      author: { '@id': `${SITE_URL}/#author` }, sameAs: [REPOSITORY, NPM_URL],
    },
    {
      '@type': 'SoftwareSourceCode', '@id': `${SITE_URL}/#source`, name: '@zakisheriff/liquid-glass',
      codeRepository: REPOSITORY, programmingLanguage: ['TypeScript', 'JavaScript', 'CSS'],
      license: 'https://opensource.org/licenses/MIT', author: { '@id': `${SITE_URL}/#author` },
      targetProduct: { '@id': `${SITE_URL}/#software` },
    },
  ],
};
