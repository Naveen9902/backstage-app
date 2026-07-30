export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password, name, role, skill } = await req.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
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
    await redis.set(`session:${sessionToken}`, user.id, { ex: 604800 });

    const response = NextResponse.json(user, { status: 201 });
    
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
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({ error: 'Failed to create user', details: error.message }, { status: 500 });
  }
}
