export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifySync } from 'otplib';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    const cookieStore = await cookies();
    const tempUserId = cookieStore.get('temp2faUserId')?.value;

    if (!tempUserId) {
      return NextResponse.json({ error: '2FA session expired. Please log in again.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: tempUserId },
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: 'User not found or 2FA not enabled' }, { status: 400 });
    }

    const isValid = verifySync({ token, secret: user.twoFactorSecret, strategy: 'totp' });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 401 });
    }

    // Login successful
    const response = NextResponse.json(user, { status: 200 });
    const cookieName = user.role === 'ADMIN' ? 'adminUserId' : user.role === 'MANAGER' ? 'managerUserId' : user.role === 'USER' ? 'fanUserId' : 'workerUserId';
    
    // Clear old cookies
    response.cookies.delete('adminUserId');
    response.cookies.delete('managerUserId');
    response.cookies.delete('workerUserId');
    response.cookies.delete('fanUserId');
    response.cookies.delete('userId');
    response.cookies.delete('temp2faUserId'); // Clear the temp token

    response.cookies.set(cookieName, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return response;
  } catch (error) {
    console.error("2FA LOGIN ERROR:", error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
