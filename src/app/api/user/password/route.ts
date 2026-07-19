export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value || cookieStore.get('managerUserId')?.value || cookieStore.get('workerUserId')?.value || cookieStore.get('adminUserId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both current and new passwords are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.password !== currentPassword) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('UPDATE PASSWORD ERROR:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
