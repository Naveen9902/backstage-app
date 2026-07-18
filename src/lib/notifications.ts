import prisma from '@/lib/prisma';

export async function sendNotification(userId: string, message: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationsEnabled: true }
    });

    if (user?.notificationsEnabled) {
      await prisma.notification.create({
        data: {
          userId,
          message
        }
      });
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}
