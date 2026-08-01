import { getAuthUserId } from '@/lib/auth';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dispatches = await prisma.runnerDispatch.findMany({
      where: { managerId: userId },
      include: {
        event: { select: { title: true, status: true, id: true } },
        runner: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const hiredApplications = await prisma.application.findMany({
      where: {
        status: 'ACCEPTED',
        checkInTime: { not: null },
        checkOutTime: null,
        staffingRequest: {
          event: {
            managerId: userId,
            status: 'ONGOING'
          }
        }
      },
      include: {
        workerProfile: {
          include: { user: { select: { id: true, name: true } } }
        },
        staffingRequest: {
          include: { event: { select: { title: true, id: true } } }
        }
      }
    });

    const hiredStaff = hiredApplications.map(app => ({
      userId: app.workerProfile.user.id,
      name: app.workerProfile.user.name,
      roleName: app.staffingRequest.roleName,
      eventName: app.staffingRequest.event.title,
      eventId: app.staffingRequest.event.id,
      skills: app.workerProfile.skills
    }));

    const hiredUserIds = hiredStaff.map(s => s.userId);

    const nearbyWorkerProfiles = await prisma.workerProfile.findMany({
      where: {
        isVerified: true,
        userId: { notIn: hiredUserIds }
      },
      include: {
        user: { select: { id: true, name: true } }
      },
      take: 5
    });

    const nearbyRunners = nearbyWorkerProfiles.map(wp => ({
      userId: wp.user.id,
      name: wp.user.name,
      skills: wp.skills,
      distance: (Math.random() * 3 + 0.5).toFixed(1) + ' km away'
    }));

    return NextResponse.json({ dispatches, hiredStaff, nearbyRunners }, { status: 200 });
  } catch (error) {
    console.error('GET RUNNERS ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch runner dispatches' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, task, urgency, runnerId, price } = await req.json();

    if (!task || !urgency) {
      return NextResponse.json({ error: 'Missing required fields (task and urgency are required)' }, { status: 400 });
    }

    let targetEventId = eventId;
    if (!targetEventId) {
      let defaultEvent = await prisma.event.findFirst({
        where: { managerId: userId, title: 'General Venue & External Errands' }
      });
      if (!defaultEvent) {
        defaultEvent = await prisma.event.create({
          data: {
            title: 'General Venue & External Errands',
            category: 'Operations',
            location: 'Venue / On-Ground',
            date: new Date().toISOString().split('T')[0],
            time: '00:00',
            description: 'General venue operations, setup, and open broadcast errands.',
            status: 'ONGOING',
            managerId: userId
          }
        });
      }
      targetEventId = defaultEvent.id;
    } else {
      const event = await prisma.event.findFirst({
        where: { id: targetEventId, managerId: userId }
      });
      if (!event) {
        return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
      }
    }

    const targetRunnerId = (runnerId && runnerId !== 'ALL' && runnerId !== 'BROADCAST') ? runnerId : null;

    const dispatch = await prisma.runnerDispatch.create({
      data: {
        managerId: userId,
        eventId: targetEventId,
        task,
        urgency,
        price: price !== undefined && price !== null && price !== '' ? parseFloat(price) : null,
        runnerId: targetRunnerId
      },
      include: {
        event: { select: { title: true } },
        runner: { select: { name: true } }
      }
    });

    if (targetRunnerId) {
      await sendNotification(targetRunnerId, `⚡ You have been assigned a new runner task: "${task}" (₹${price || 0}). Check your Runner board!`);
    } else {
      // Notify nearby workers about open errand broadcast
      const nearbyWorkers = await prisma.workerProfile.findMany({
        where: { isVerified: true },
        select: { userId: true },
        take: 10
      });
      for (const w of nearbyWorkers) {
        if (w.userId !== userId) {
          await sendNotification(w.userId, `⚡ Open Errand Broadcasted: "${task}" (₹${price || 0}). First worker to grab it claims guaranteed pay!`);
        }
      }
    }

    return NextResponse.json(dispatch, { status: 201 });
  } catch (error) {
    console.error('CREATE RUNNER DISPATCH ERROR:', error);
    return NextResponse.json({ error: 'Failed to dispatch runner' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dispatchId, runnerId, action } = await req.json();

    if (!dispatchId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dispatch = await prisma.runnerDispatch.findUnique({ where: { id: dispatchId } });
    if (!dispatch || dispatch.managerId !== userId) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    if (action === 'pay') {
      if (dispatch.status !== 'Completed') {
        return NextResponse.json({ error: 'Task must be completed before sending payment' }, { status: 400 });
      }
      const updated = await prisma.runnerDispatch.update({
        where: { id: dispatchId },
        data: { paymentStatus: 'SENT' },
        include: {
          event: { select: { title: true } },
          runner: { select: { name: true } }
        }
      });
      
      if (dispatch.runnerId) {
        await sendNotification(
          dispatch.runnerId,
          `💰 Manager has sent payment of ₹${dispatch.price || 0} for task: "${dispatch.task}". Please confirm receipt in your Runner board.`
        );
      }
      return NextResponse.json(updated, { status: 200 });
    }

    if (!runnerId) {
      return NextResponse.json({ error: 'Missing runnerId for assignment' }, { status: 400 });
    }

    if (dispatch.status !== 'Pending') {
      return NextResponse.json({ error: 'Task already assigned or completed' }, { status: 400 });
    }

    const updated = await prisma.runnerDispatch.update({
      where: { id: dispatchId },
      data: {
        status: 'Pending',
        runnerId: runnerId
      },
      include: {
        event: { select: { title: true } },
        runner: { select: { name: true } }
      }
    });

    await sendNotification(runnerId, `⚡ You have been assigned to runner task: "${dispatch.task}". Please accept it in your Runner board!`);

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('ASSIGN RUNNER ERROR:', error);
    return NextResponse.json({ error: 'Failed to assign runner' }, { status: 500 });
  }
}

