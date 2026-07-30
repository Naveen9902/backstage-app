import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  pageExtensions: ['tsx'], // Ignores .ts files (like route.ts) so APIs are skipped during export!
};

export default nextConfig;
