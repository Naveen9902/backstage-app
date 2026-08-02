export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/auth';

import { loginSchema } from '@/lib/validations';
import { z } from 'zod';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    let validatedData;
    try {
      validatedData = loginSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: validationError.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.warn('Login failed: Invalid credentials (user not found)', { email });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    let isMatch = user.password === password;
    if (!isMatch) {
      const bcrypt = require('bcryptjs');
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch (e) {
        // Not a bcrypt hash
      }
    }

    if (!isMatch) {
      logger.warn('Login failed: Invalid credentials (password mismatch)', { email, userId: user.id });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.isTwoFactorEnabled) {
      const response = NextResponse.json({ requires2FA: true, userId: user.id }, { status: 200 });
      response.cookies.set('temp2faUserId', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        path: '/',
        maxAge: 300 // 5 minutes
      });
      return response;
    }

    if (user.role === 'MANAGER') {
      const managerProfile = await prisma.managerProfile.findUnique({ where: { userId: user.id } });
      const tier = managerProfile?.subscriptionTier || 'FREE';
      const sessionLimit = tier === 'ENTERPRISE' ? 5 : 1;

      const activeSessionsCount = await prisma.session.count({ where: { userId: user.id } });

      if (activeSessionsCount >= sessionLimit) {
        return NextResponse.json({ error: 'Active sessions limit reached. Please log out from other devices.' }, { status: 401 });
      }

      await prisma.session.create({
        data: {
          userId: user.id,
          token: crypto.randomUUID() // keep for postgres limits
        }
      });
    }

    const sessionToken = crypto.randomUUID();
    
    try {
      await redis.set(`session:${sessionToken}`, user.id, { ex: 604800 });
    } catch (redisError) {
      logger.error("Redis session set error during login", redisError, { userId: user.id });
    }

    // Persist session to database as fallback
    await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.id
      }
    });

    logger.info("User logged in successfully", { userId: user.id, role: user.role });

    const response = NextResponse.json({ ...user, sessionToken }, { status: 200 });
    
    // Clear old insecure cookies
    response.cookies.delete('adminUserId');
    response.cookies.delete('managerUserId');
    response.cookies.delete('workerUserId');
    response.cookies.delete('fanUserId');
    response.cookies.delete('userId');
    response.cookies.delete('managerSessionToken');

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const, // Required for Capacitor
      path: '/',
      maxAge: 604800, // 7 days
    };

    response.cookies.set('sessionToken', sessionToken, cookieOptions);

    return response;
  } catch (error: any) {
    logger.error("LOGIN ERROR", error, { 
      email: req.clone().json().then((b:any)=>b.email).catch(()=>'unknown') 
    });
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
