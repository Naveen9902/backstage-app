import { getAuthUserId } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, targetId, reason, description } = await req.json();

    if (!eventId || !targetId || !reason || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dispute = await prisma.dispute.create({
      data: {
        eventId,
        reporterId: userId,
        targetId,
        reason,
        description,
        status: 'OPEN'
      }
    });

    await sendNotification(targetId, `⚠️ An issue report / dispute was filed against you regarding event/task.`);

    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    for (const adm of admins) {
      await sendNotification(adm.id, `⚠️ New Dispute Filed: "${reason}" (ID: #${dispute.id.slice(0, 8)})`);
    }

    return NextResponse.json(dispute, { status: 201 });
  } catch (error) {
    console.error('CREATE DISPUTE ERROR:', error);
    return NextResponse.json({ error: 'Failed to create dispute' }, { status: 500 });
  }
}
