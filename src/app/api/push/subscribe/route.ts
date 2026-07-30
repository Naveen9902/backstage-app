import { getAuthUserId } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const subscription = await req.json();
    const cookieStore = await cookies();
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { pushSubscription: JSON.stringify(subscription) }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Push Subscribe Error:", err);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
