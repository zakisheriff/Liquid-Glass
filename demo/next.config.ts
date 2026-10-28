import path from 'node:path';
import type { NextConfig } from 'next';

const root = path.resolve(__dirname, '..');

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
  // The site renders the library straight from ../src.
  turbopack: { root },
  outputFileTracingRoot: root,
};

export default nextConfig;
