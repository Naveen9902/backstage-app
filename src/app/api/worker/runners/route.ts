export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';

export async function GET() {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get('workerUserId')?.value;
    if (!userId) userId = cookieStore.get('managerUserId')?.value;
    if (!userId) userId = cookieStore.get('adminUserId')?.value;
    if (!userId) userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the events this worker is hired for
    const hiredApplications = await prisma.application.findMany({
      where: {
        workerProfile: { userId },
        status: 'ACCEPTED',
        staffingRequest: {
          event: { status: 'ONGOING' }
        }
      },
      include: {
        staffingRequest: { select: { eventId: true } }
      }
    });

    const hiredEventIds = hiredApplications.map(app => app.staffingRequest.eventId);

    const workerProfile = await prisma.workerProfile.findUnique({ where: { userId } });
    const isRunnerAvailable = workerProfile?.isRunnerAvailable || false;

    const dispatches = await prisma.runnerDispatch.findMany({
      where: {
        OR: [
          // Broadcast to hired staff for internal event tasks
          { status: 'Pending', runnerId: null, eventId: { in: hiredEventIds } },
          // Open broadcast for external errands available to ALL workers
          { status: 'Pending', runnerId: null, task: { startsWith: '[EXTERNAL/ERRAND]' } },
          { status: 'Pending', runnerId: null, price: { not: null } },
          // Directly assigned to this worker
          { runnerId: userId }
        ]
      },
      include: {
        event: {
          select: { title: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const pending = dispatches.filter(d => d.status === 'Pending');
    const myTasks = dispatches.filter(d => d.runnerId === userId && d.status !== 'Pending');

    return NextResponse.json({ 
      pending, 
      myTasks,
      isRunnerAvailable
    }, { status: 200 });
  } catch (error) {
    console.error('GET WORKER RUNNERS ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch runner tasks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get('workerUserId')?.value;
    if (!userId) userId = cookieStore.get('managerUserId')?.value;
    if (!userId) userId = cookieStore.get('adminUserId')?.value;
    if (!userId) userId = cookieStore.get('userId')?.value;

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { dispatchId, action } = await req.json();

    if (!dispatchId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dispatch = await prisma.runnerDispatch.findUnique({ where: { id: dispatchId } });
    if (!dispatch) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    if (action === 'accept') {
      if (dispatch.status !== 'Pending') {
        return NextResponse.json({ error: 'Task already accepted' }, { status: 400 });
      }
      
      const updated = await prisma.runnerDispatch.update({
        where: { id: dispatchId },
        data: {
          status: 'In Progress',
          runnerId: userId
        },
        include: {
          event: { select: { managerId: true } },
          runner: { select: { name: true } }
        }
      });
      await prisma.workerProfile.upsert({
        where: { userId },
        update: { isRunnerAvailable: true },
        create: {
          userId,
          skills: 'General Event Staff, Runner',
          experience: '1+ year event experience',
          isRunnerAvailable: true
        }
      });
      const mgrId = updated.managerId || updated.event?.managerId;
      if (mgrId) {
        await sendNotification(mgrId, `🏃 Runner ${updated.runner?.name || 'Worker'} has accepted and started task: "${updated.task}"`);
      }
      return NextResponse.json(updated, { status: 200 });
    } 
    
    if (action === 'complete') {
      if (dispatch.runnerId !== userId) {
        return NextResponse.json({ error: 'Unauthorized to complete this task' }, { status: 403 });
      }
      
      const updated = await prisma.runnerDispatch.update({
        where: { id: dispatchId },
        data: {
          status: 'Completed'
        },
        include: {
          runner: true,
          event: {
            include: { manager: true }
          }
        }
      });
      
      if (updated.event?.managerId) {
        await sendNotification(
          updated.event.managerId,
          `✅ Runner ${updated.runner?.name || 'Worker'} has completed the task: "${updated.task}"`
        );
      }

      return NextResponse.json(updated, { status: 200 });
    }

    if (action === 'confirm_payment') {
      if (dispatch.runnerId !== userId) {
        return NextResponse.json({ error: 'Unauthorized to confirm payment for this task' }, { status: 403 });
      }
      if (dispatch.paymentStatus !== 'SENT') {
        return NextResponse.json({ error: 'Payment has not been marked as sent by Manager yet' }, { status: 400 });
      }
      const updated = await prisma.runnerDispatch.update({
        where: { id: dispatchId },
        data: { paymentStatus: 'CONFIRMED' },
        include: {
          runner: true,
          event: true
        }
      });
      if (updated.event?.managerId) {
        await sendNotification(
          updated.event.managerId,
          `💰 Runner ${updated.runner?.name || 'Worker'} has confirmed receipt of ₹${updated.price || 0} for task: "${updated.task}"`
        );
      }
      return NextResponse.json(updated, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('ACTION RUNNER ERROR:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get('workerUserId')?.value;
    if (!userId) userId = cookieStore.get('managerUserId')?.value;
    if (!userId) userId = cookieStore.get('adminUserId')?.value;
    if (!userId) userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { isRunnerAvailable } = await req.json();

    const updatedProfile = await prisma.workerProfile.upsert({
      where: { userId },
      update: { isRunnerAvailable: Boolean(isRunnerAvailable) },
      create: {
        userId,
        skills: 'General Event Staff, Runner',
        experience: '1+ year event experience',
        isRunnerAvailable: Boolean(isRunnerAvailable)
      }
    });

    return NextResponse.json({ success: true, isRunnerAvailable: updatedProfile.isRunnerAvailable }, { status: 200 });
  } catch (error) {
    console.error('PATCH RUNNER STATUS ERROR:', error);
    return NextResponse.json({ error: 'Failed to update runner status' }, { status: 500 });
  }
}
