import { version } from '../../package.json';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://liquidglass.theatom.lk').replace(/\/$/, '');
export const SITE_TITLE = 'Liquid Glass for Web — React & Next.js Components';
export const SITE_DESCRIPTION = 'Apple-inspired liquid glass for the web. Try interactive React and Next.js buttons, switches, tab bars, sliders and search fields. Open source, MIT licensed.';
export const PACKAGE_VERSION = version;
export const UPDATED = '2026-10-28';
export const REPOSITORY = 'https://github.com/zakisheriff/Liquid-Glass';
export const NPM_URL = 'https://www.npmjs.com/package/@zakisheriff/liquid-glass';

export const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Person', '@id': `${SITE_URL}/#author`, name: 'Zaki Sheriff', url: 'https://github.com/zakisheriff' },
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'Liquid Glass for the Web', url: `${SITE_URL}/`, inLanguage: 'en', creator: { '@id': `${SITE_URL}/#author` } },
    {
      '@type': 'SoftwareApplication', '@id': `${SITE_URL}/#software`, name: '@zakisheriff/liquid-glass',
      alternateName: 'Liquid Glass for the Web', url: `${SITE_URL}/`, description: SITE_DESCRIPTION,
      applicationCategory: 'DeveloperApplication', operatingSystem: 'Web', softwareVersion: PACKAGE_VERSION,
      softwareRequirements: 'React 17 or later and React DOM 17 or later', installUrl: NPM_URL,
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
