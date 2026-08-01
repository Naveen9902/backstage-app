export const dynamic = 'force-dynamic';
export const revalidate = 0;
import prisma from '@/lib/prisma';
import { redis } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const rawState = url.searchParams.get('state') || 'login_WORKER';
  const [action, roleStateStr] = rawState.includes('_') ? rawState.split('_') : ['login', rawState];
  const roleState = (roleStateStr as Role) || 'WORKER';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=NoCode`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/login?error=GoogleNotConfigured`);
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
    } else {
      // User exists, but they might be registering with a different role
      if (action === 'register' && user.role !== roleState) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: roleState }
        });
        
        if (roleState === 'WORKER') {
          const existingProfile = await prisma.workerProfile.findUnique({ where: { userId: user.id } });
          if (!existingProfile) {
            await prisma.workerProfile.create({ data: { userId: user.id, skills: '', experience: '' } });
          }
        } else if (roleState === 'MANAGER') {
          const existingProfile = await prisma.managerProfile.findUnique({ where: { userId: user.id } });
          if (!existingProfile) {
            await prisma.managerProfile.create({ data: { userId: user.id, company: '' } });
          }
        }
      }
    }

    // 4. Set unified session token in Redis
    const cookieStore = await cookies();
    const sessionToken = crypto.randomUUID();
    await redis.set(`session:${sessionToken}`, user.id, { ex: 604800 });
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none' as const,
      path: '/',
      maxAge: 604800, // 7 days
    };

    cookieStore.set({
      name: 'sessionToken',
      value: sessionToken,
      ...cookieOptions
    });

    // Clear old cookies just in case
    cookieStore.delete('workerUserId');
    cookieStore.delete('managerUserId');
    cookieStore.delete('fanUserId');
    cookieStore.delete('adminUserId');
    cookieStore.delete('userId');
    cookieStore.delete('managerSessionToken');

    // 5. Redirect to appropriate dashboard
    const redirectMap: Record<string, string> = {
      'WORKER': '/worker',
      'MANAGER': '/manager/dashboard',
      'USER': '/user',
      'ADMIN': '/admin'
    };

    return NextResponse.redirect(`${baseUrl}${redirectMap[user.role] || '/'}`);
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    return NextResponse.redirect(`${baseUrl}/login?error=OAuthFailed`);
  }
}
