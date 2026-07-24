import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

const globalAny = global as any;

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone number and code are required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get('workerUserId')?.value || cookieStore.get('userId')?.value || cookieStore.get('managerUserId')?.value;

    let storedCode = null;
    let userObj = null;

    if (userId) {
      userObj = await prisma.user.findUnique({ where: { id: userId } });
      if (userObj && userObj.resetOtp && userObj.resetOtpExpiry && userObj.resetOtpExpiry > new Date()) {
        storedCode = userObj.resetOtp;
      }
    } else {
      const mockData = globalAny.mockOtpStore?.[phone];
      if (mockData && mockData.expires > Date.now()) {
        storedCode = mockData.code;
      }
    }

    if (!storedCode) {
      return NextResponse.json({ error: 'OTP expired or not found' }, { status: 400 });
    }

    if (String(storedCode).trim() !== String(code).trim()) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    // Success! Delete the code so it can't be reused
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { resetOtp: null, resetOtpExpiry: null }
      });
    } else {
      delete globalAny.mockOtpStore[phone];
    }

    return NextResponse.json({ success: true, message: 'Phone verified successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
