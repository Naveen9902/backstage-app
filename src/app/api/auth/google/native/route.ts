import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { idToken, role, clientId, action } = await req.json();
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

    // Find user
    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (action === 'login') {
      if (!user) {
        return NextResponse.json({ error: 'Account not found. Please register first.' }, { status: 404 });
      }
    } else {
      // action === 'register'
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
      } else {
        // User exists, but they are registering again (maybe switching roles)
        if (user.role !== roleState) {
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
    }

    // Set unified session token in Redis
    const sessionToken = crypto.randomUUID();
    
    try {
      await redis.set(`session:${sessionToken}`, user.id, { ex: 604800 });
    } catch (redisError) {
      console.error("Redis session set error during google native auth:", redisError);
    }

    // Persist session to database as fallback
    await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.id
      }
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none' as const,
      path: '/',
      maxAge: 604800, // 7 days
    };

    const cookieStore = await cookies();
    cookieStore.set({ name: 'sessionToken', value: sessionToken, ...cookieOptions });

    // Clear legacy cookies just in case
    cookieStore.delete('workerUserId');
    cookieStore.delete('managerUserId');
    cookieStore.delete('fanUserId');
    cookieStore.delete('adminUserId');
    cookieStore.delete('userId');
    cookieStore.delete('managerSessionToken');

    const redirectMap: Record<string, string> = {
      'WORKER': '/worker',
      'MANAGER': '/manager/dashboard',
      'USER': '/user',
      'ADMIN': '/admin'
    };

    return NextResponse.json({ 
      success: true, 
      redirectUrl: redirectMap[user.role] || '/',
      sessionToken
    });

  } catch (error) {
    console.error('Native Google Auth Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
