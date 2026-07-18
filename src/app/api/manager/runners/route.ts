export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dispatches = await prisma.runnerDispatch.findMany({
      where: { managerId: userId },
      include: {
        event: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(dispatches, { status: 200 });
  } catch (error) {
    console.error('GET RUNNERS ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch runner dispatches' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, task, urgency } = await req.json();

    if (!eventId || !task || !urgency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify event belongs to manager
    const event = await prisma.event.findFirst({
      where: { id: eventId, managerId: userId }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    if (event.status !== 'ONGOING') {
      return NextResponse.json({ error: 'Runner tasks can only be dispatched for live (ONGOING) events.' }, { status: 400 });
    }

    const dispatch = await prisma.runnerDispatch.create({
      data: {
        managerId: userId,
        eventId,
        task,
        urgency
      },
      include: {
        event: {
          select: { title: true }
        }
      }
    });

    return NextResponse.json(dispatch, { status: 201 });
  } catch (error) {
    console.error('CREATE RUNNER DISPATCH ERROR:', error);
    return NextResponse.json({ error: 'Failed to dispatch runner' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dispatchId, runnerName } = await req.json();

    if (!dispatchId || !runnerName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dispatch = await prisma.runnerDispatch.findUnique({ where: { id: dispatchId } });
    if (!dispatch || dispatch.managerId !== userId) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    if (dispatch.status !== 'Pending') {
      return NextResponse.json({ error: 'Task already assigned or completed' }, { status: 400 });
    }

    const updated = await prisma.runnerDispatch.update({
      where: { id: dispatchId },
      data: {
        status: 'In Progress',
        runner: runnerName
      },
      include: {
        event: { select: { title: true } }
      }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('ASSIGN RUNNER ERROR:', error);
    return NextResponse.json({ error: 'Failed to assign runner' }, { status: 500 });
  }
}

