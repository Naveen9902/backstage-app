export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';

import { registerSchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    let validatedData;
    try {
      validatedData = registerSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: validationError.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { email, password, name, role, skill } = validatedData;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn('Registration failed: User already exists', { email });
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    if (role === 'WORKER') {
      await prisma.workerProfile.create({
        data: {
          userId: user.id,
          skills: skill || '',
          experience: '',
        }
      });
    } else if (role === 'MANAGER') {
      await prisma.managerProfile.create({
        data: {
          userId: user.id,
          managerName: name,
        }
      });
    }

    const sessionToken = crypto.randomUUID();
    // 7 days in seconds
    try {
      await redis.set(`session:${sessionToken}`, user.id, { ex: 604800 });
    } catch (redisError) {
      logger.error("Redis session set error during register", redisError, { userId: user.id });
    }

    // Persist session to database as fallback
    await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.id
      }
    });

    logger.info("User registered successfully", { userId: user.id, role: user.role });

    const response = NextResponse.json({ ...user, sessionToken }, { status: 201 });
    
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const, // Required for Capacitor
      path: '/',
      maxAge: 604800, // 7 days
    };

    response.cookies.set('sessionToken', sessionToken, cookieOptions);

    // Clear old insecure cookies just in case
    response.cookies.delete('adminUserId');
    response.cookies.delete('managerUserId');
    response.cookies.delete('workerUserId');
    response.cookies.delete('fanUserId');
    response.cookies.delete('userId');

    return response;
  } catch (error: any) {
    logger.error("REGISTER ERROR", error, { 
      email: req.clone().json().then((b:any)=>b.email).catch(()=>'unknown') 
    });
    return NextResponse.json({ error: 'Failed to create user', details: error.message }, { status: 500 });
  }
}
