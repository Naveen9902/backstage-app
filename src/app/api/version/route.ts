import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    version: '2.1.0',
    build: 20260726,
    mandatory: false,
    title: 'New Live Update Available! 🎉',
    description: 'We have updated the Back Stage app with full-screen community chat, instant search, event details modal, and lifetime mobile login.',
    downloadUrl: 'https://back-stage-theta.vercel.app/app-debug.apk',
    releasedAt: new Date().toISOString()
  });
}
