import path from 'node:path';
import type { NextConfig } from 'next';

const root = path.resolve(__dirname, '..');

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
  // tsconfig resolves library imports to the pinned npm release.
  turbopack: { root },
  outputFileTracingRoot: root,
};

export default nextConfig;
