export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  console.log("HIT REGISTER ROUTE");
  try {
    const { email, password, name, role, skill } = await req.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password, // In a real app, hash this with bcrypt!
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
    }

    const response = NextResponse.json(user, { status: 201 });
    const roleMap: Record<string, string> = {
      'WORKER': 'workerUserId',
      'MANAGER': 'managerUserId',
      'USER': 'fanUserId',
      'ADMIN': 'adminUserId'
    };
    const cookieName = roleMap[role] || 'fanUserId';
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 100,
      expires: new Date(2100, 0, 1)
    };
    response.cookies.set(cookieName, user.id, cookieOptions);
    response.cookies.set('userId', user.id, cookieOptions);

    return response;
  } catch (error: any) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({ error: 'Failed to create user', details: error.message }, { status: 500 });
  }
}
