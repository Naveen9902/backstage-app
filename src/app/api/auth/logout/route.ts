export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/auth';

export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;
  
  // Always clear cookies immediately
  cookieStore.delete('userId');
  cookieStore.delete('adminUserId');
  cookieStore.delete('managerUserId');
  cookieStore.delete('workerUserId');
  cookieStore.delete('fanUserId');
  cookieStore.delete('managerSessionToken');
  cookieStore.delete('sessionToken');
  cookieStore.delete('token');
  cookieStore.delete('auth_token');

  try {
    if (sessionToken) {
      await redis.del(`session:${sessionToken}`);
      
      // Also delete any postgres sessions just in case
      await prisma.session.deleteMany({
        where: { token: sessionToken }
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Return success anyway since the cookies were cleared
    return NextResponse.json({ success: true, warning: 'DB session cleanup failed' }, { status: 200 });
  }
}
