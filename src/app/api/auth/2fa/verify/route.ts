import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifySync } from 'otplib';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('adminUserId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: '2FA not initialized' }, { status: 400 });
    }

    const isValid = verifySync({ token, secret: user.twoFactorSecret, strategy: 'totp' });

    if (isValid) {
      await prisma.user.update({
        where: { id: userId },
        data: { isTwoFactorEnabled: true }
      });
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('2FA Verify Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
