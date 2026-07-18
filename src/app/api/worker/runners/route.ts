export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('workerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!workerProfile) {
      return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 });
    }

    // Get events where worker has an ACCEPTED application
    const acceptedApps = await prisma.application.findMany({
      where: {
        workerProfileId: workerProfile.id,
        status: 'ACCEPTED'
      },
      include: {
        staffingRequest: true
      }
    });

    const validEventIds = acceptedApps.map(app => app.staffingRequest.eventId);

    if (validEventIds.length === 0) {
      return NextResponse.json({ pending: [], myTasks: [] }, { status: 200 });
    }

    // Fetch pending tasks for these events, OR tasks already assigned to this worker
    const dispatches = await prisma.runnerDispatch.findMany({
      where: {
        eventId: { in: validEventIds },
        OR: [
          { status: 'Pending' },
          { runner: workerProfile.user.name } // Matches current worker
        ]
      },
      include: {
        event: {
          select: { title: true, location: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const pending = dispatches.filter(d => d.status === 'Pending');
    const myTasks = dispatches.filter(d => d.runner === workerProfile.user.name && d.status !== 'Pending');

    return NextResponse.json({ pending, myTasks }, { status: 200 });
  } catch (error) {
    console.error('GET WORKER RUNNERS ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch runner tasks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('workerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { dispatchId, action } = await req.json();

    if (!dispatchId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!workerProfile) return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 });

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
          runner: workerProfile.user.name
        }
      });
      return NextResponse.json(updated, { status: 200 });
    } 
    
    if (action === 'complete') {
      if (dispatch.runner !== workerProfile.user.name) {
        return NextResponse.json({ error: 'Unauthorized to complete this task' }, { status: 403 });
      }
      
      const updated = await prisma.runnerDispatch.update({
        where: { id: dispatchId },
        data: {
          status: 'Completed'
        }
      });
      return NextResponse.json(updated, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('ACTION RUNNER ERROR:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
