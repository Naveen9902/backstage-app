import { getAuthUserId } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to 50 latest notifications
    });

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error('GET NOTIFICATIONS ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationIds } = await req.json();

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json({ error: 'Missing notificationIds' }, { status: 400 });
    }

    // Update notifications to read
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId // Ensure the user owns these notifications
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('UPDATE NOTIFICATIONS ERROR:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
