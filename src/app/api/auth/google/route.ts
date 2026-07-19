import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  // Optional: pass the role they selected on the register page as state
  const role = url.searchParams.get('role') || 'WORKER';
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${url.origin}/api/auth/google/callback`;

  if (!clientId) {
    return NextResponse.json({ error: 'Google Client ID is not configured' }, { status: 500 });
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&access_type=offline&state=${role}`;

  return NextResponse.redirect(googleAuthUrl);
}
