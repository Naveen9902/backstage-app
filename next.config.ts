import type { NextConfig } from "next";
import { withBetterStack } from "@logtail/next";

const isCapacitor = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  output: isCapacitor ? 'export' : undefined,
  typescript: {
    // Ignore TypeScript errors during production build
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: '60mb',
    },
  },
  images: {
    unoptimized: isCapacitor,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
  },
  allowedDevOrigins: ['192.168.1.6', '10.186.52.53', '10.124.86.53', 'localhost', 'early-cobras-stare.loca.lt', 'wet-tips-follow.loca.lt', '8a38ef68c87cd8.lhr.life'],
};

export default withBetterStack(nextConfig);
