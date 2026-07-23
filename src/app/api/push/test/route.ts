import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('workerUserId')?.value || cookieStore.get('adminUserId')?.value || cookieStore.get('fanUserId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.pushSubscription) {
      return NextResponse.json({ error: 'No push subscription found' }, { status: 404 });
    }

    const success = await sendPushNotification(user.pushSubscription, {
      title: "Test Notification",
      body: "This is a test notification from Back Stage!"
    });

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to send push' }, { status: 500 });
    }
  } catch (err) {
    console.error("Test Push Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
