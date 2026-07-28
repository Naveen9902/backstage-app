import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { idToken, role, clientId } = await req.json();
    if (!idToken || !clientId) {
      return NextResponse.json({ error: 'Missing token or client ID' }, { status: 400 });
    }

    const client = new OAuth2Client(clientId);

    // Verify the Google Native idToken
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const roleState = (role as Role) || 'USER';

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8) + Date.now(), 10);
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || 'Google User',
          avatarUrl: payload.picture,
          password: hashedPassword,
          role: roleState,
        },
      });

      // Create profile based on role
      if (roleState === 'WORKER') {
        await prisma.workerProfile.create({
          data: { userId: user.id, skills: '', experience: '' },
        });
      } else if (roleState === 'MANAGER') {
        await prisma.managerProfile.create({
          data: { userId: user.id, company: '' },
        });
      }
    }

    // Set Cookies securely
    const cookieStore = await cookies();
    cookieStore.delete('workerUserId');
    cookieStore.delete('managerUserId');
    cookieStore.delete('fanUserId');
    cookieStore.delete('adminUserId');
    cookieStore.delete('userId');

    const roleMap: Record<string, string> = {
      'WORKER': 'workerUserId',
      'MANAGER': 'managerUserId',
      'USER': 'fanUserId',
      'ADMIN': 'adminUserId'
    };

    const cookieName = roleMap[user.role] || 'fanUserId';
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 100,
      expires: new Date(2100, 0, 1)
    };

    cookieStore.set({ name: cookieName, value: user.id, ...cookieOptions });
    cookieStore.set({ name: 'userId', value: user.id, ...cookieOptions });

    const redirectMap: Record<string, string> = {
      'WORKER': '/worker',
      'MANAGER': '/manager/dashboard',
      'USER': '/user',
      'ADMIN': '/admin'
    };

    return NextResponse.json({ 
      success: true, 
      redirectUrl: redirectMap[user.role] || '/' 
    });

  } catch (error) {
    console.error('Native Google Auth Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
