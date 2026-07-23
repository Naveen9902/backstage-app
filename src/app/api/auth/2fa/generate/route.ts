import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('adminUserId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const secret = generateSecret(20);
    const otpauth = generateURI({ label: user.email, issuer: 'Back Stage', secret, strategy: 'totp' });
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    // Save the secret temporarily
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret }
    });

    return NextResponse.json({ secret, qrCodeUrl });
  } catch (err: any) {
    console.error('2FA Generate Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
