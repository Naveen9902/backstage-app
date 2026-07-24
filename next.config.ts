import type { NextConfig } from "next";
import { withBetterStack } from "@logtail/next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignore TypeScript errors during production build
    ignoreBuildErrors: true,
  },
  images: {
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
  // @ts-expect-error - Custom property
  allowedDevOrigins: ['192.168.1.6', '10.186.52.53', '10.124.86.53', 'localhost', 'early-cobras-stare.loca.lt', 'wet-tips-follow.loca.lt', '8a38ef68c87cd8.lhr.life'],
};

export default withBetterStack(nextConfig);
