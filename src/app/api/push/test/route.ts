import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push';
import { sendNotification } from '@/lib/notifications';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('workerUserId')?.value || cookieStore.get('adminUserId')?.value || cookieStore.get('fanUserId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await sendNotification(userId, "⚡ Test Notification: This is a live top-banner alert from BackStage!");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.pushSubscription) {
      return NextResponse.json({ success: true, message: 'In-app notification triggered (no push subscription)' });
    }

    const result = await sendPushNotification(user.pushSubscription, {
      title: "Test Notification",
      body: "This is a test notification from Back Stage!"
    });

    return NextResponse.json({ success: true, pushResult: result });
  } catch (err) {
    console.error("Test Push Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

