import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - allowedDevOrigins might not be in the NextConfig type yet depending on the exact version
  allowedDevOrigins: ['192.168.1.6', '10.186.52.53', '10.124.86.53', 'localhost', 'early-cobras-stare.loca.lt', 'wet-tips-follow.loca.lt', '8a38ef68c87cd8.lhr.life'],
  // @ts-ignore - ignoring type check for devIndicators as types fluctuate across Next.js 15/16 minors
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  /* config options here */
};

export default nextConfig;

// Trigger Next.js dev server hard restart to clear Prisma cache
