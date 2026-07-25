export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const managerSessionToken = cookieStore.get('managerSessionToken')?.value;

    if (managerSessionToken) {
      await prisma.session.deleteMany({
        where: { token: managerSessionToken }
      });
    }

    cookieStore.delete('userId');
    cookieStore.delete('adminUserId');
    cookieStore.delete('managerUserId');
    cookieStore.delete('workerUserId');
    cookieStore.delete('fanUserId');
    cookieStore.delete('managerSessionToken');
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
