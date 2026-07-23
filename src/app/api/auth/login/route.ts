export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.password !== password) { // In production, use bcrypt.compare
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.isTwoFactorEnabled) {
      const response = NextResponse.json({ requires2FA: true, userId: user.id }, { status: 200 });
      response.cookies.set('temp2faUserId', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 300 // 5 minutes
      });
      return response;
    }

    const response = NextResponse.json(user, { status: 200 });
    const cookieName = user.role === 'ADMIN' ? 'adminUserId' : user.role === 'MANAGER' ? 'managerUserId' : user.role === 'USER' ? 'fanUserId' : 'workerUserId';
    
    // Clear old cookies to prevent split-brain if user switches roles in another tab
    response.cookies.delete('adminUserId');
    response.cookies.delete('managerUserId');
    response.cookies.delete('workerUserId');
    response.cookies.delete('fanUserId');
    response.cookies.delete('userId');

    response.cookies.set(cookieName, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
