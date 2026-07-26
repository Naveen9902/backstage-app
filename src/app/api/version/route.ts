import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    version: '2.1.1',
    build: 20260727,
    mandatory: true,
    title: 'Critical Fix Update Ready! 🚀',
    description: 'This update fixes the issue where the Profile page would continuously crash when attempting to load push notification settings. Please apply this live update to clear your cache and resolve the issue.',
    downloadUrl: 'https://back-stage-theta.vercel.app/app-debug.apk',
    releasedAt: new Date().toISOString()
  });
}
