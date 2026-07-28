export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST() {
  const cookieStore = await cookies();
  const managerSessionToken = cookieStore.get('managerSessionToken')?.value;
  
  // Always clear cookies immediately
  cookieStore.delete('userId');
  cookieStore.delete('adminUserId');
  cookieStore.delete('managerUserId');
  cookieStore.delete('workerUserId');
  cookieStore.delete('fanUserId');
  cookieStore.delete('managerSessionToken');
  cookieStore.delete('token');
  cookieStore.delete('auth_token');

  try {
    if (managerSessionToken) {
      await prisma.session.deleteMany({
        where: { token: managerSessionToken }
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Return success anyway since the cookies were cleared
    return NextResponse.json({ success: true, warning: 'DB session cleanup failed' }, { status: 200 });
  }
}
