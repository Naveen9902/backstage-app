import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const roleState = (url.searchParams.get('state') as Role) || 'WORKER';

  if (!code) {
    return NextResponse.redirect(`${url.origin}/login?error=NoCode`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${url.origin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${url.origin}/login?error=GoogleNotConfigured`);
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      console.error('Google token error:', tokenData);
      return NextResponse.redirect(`${url.origin}/login?error=GoogleTokenError`);
    }

    // 2. Fetch user profile from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileResponse.json();
    if (!profile.email) {
      return NextResponse.redirect(`${url.origin}/login?error=GoogleProfileError`);
    }

    // 3. Find or create user
    let user = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      // Create new user using the role from state
      // Since it's OAuth, we don't have a password. We generate a random one.
      const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8) + Date.now(), 10);
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name || 'Google User',
          avatarUrl: profile.picture,
          password: hashedPassword,
          role: roleState,
        },
      });

      // Create profile based on role
      if (roleState === 'WORKER') {
        await prisma.workerProfile.create({
          data: {
            userId: user.id,
            skills: '',
            experience: '',
          },
        });
      } else if (roleState === 'MANAGER') {
        await prisma.managerProfile.create({
          data: {
            userId: user.id,
            company: '',
          },
        });
      }
    }

    // 4. Set cookies exactly like /api/auth/login
    const cookieStore = await cookies();
    
    // Clear old cookies just in case
    cookieStore.delete('workerUserId');
    cookieStore.delete('managerUserId');
    cookieStore.delete('fanUserId');
    cookieStore.delete('adminUserId');

    const roleMap: Record<string, string> = {
      'WORKER': 'workerUserId',
      'MANAGER': 'managerUserId',
      'USER': 'fanUserId',
      'ADMIN': 'adminUserId'
    };

    const cookieName = roleMap[user.role] || 'userId';
    
    cookieStore.set({
      name: cookieName,
      value: user.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    // 5. Redirect to appropriate dashboard
    const redirectMap: Record<string, string> = {
      'WORKER': '/worker',
      'MANAGER': '/manager/dashboard',
      'USER': '/user',
      'ADMIN': '/admin'
    };

    return NextResponse.redirect(`${url.origin}${redirectMap[user.role] || '/'}`);
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    return NextResponse.redirect(`${url.origin}/login?error=OAuthFailed`);
  }
}
