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

    const dispatches = await prisma.runnerDispatch.findMany({
      where: {
        OR: [
          // Broadcast to hired staff
          { status: 'Pending', runnerId: null, eventId: { in: hiredEventIds } },
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
      myTasks
    }, { status: 200 });
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
        }
      });
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
