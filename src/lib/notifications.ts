import prisma from '@/lib/prisma';

export async function sendNotification(userId: string, message: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationsEnabled: true, pushSubscription: true }
    });

    if (user?.notificationsEnabled !== false) {
      await prisma.notification.create({
        data: {
          userId,
          message
        }
      });

      if (user?.pushSubscription) {
        try {
          const { sendPushNotification } = await import('@/lib/push');
          await sendPushNotification(user.pushSubscription, {
            title: 'BackStage Alert ⚡',
            body: message
          });
        } catch (pushErr) {
          console.error('Push notification failed:', pushErr);
        }
      }
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

