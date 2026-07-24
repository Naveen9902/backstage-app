import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(request: Request, context: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await context.params;
    const body = await request.json();
    const { workerProfileId, staffingRequestId } = body;
    
    const cookieStore = await cookies();
    let userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event || event.managerId !== userId) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    // Check if application already exists
    const existing = await prisma.application.findFirst({
      where: {
        workerProfileId: workerProfileId,
        staffingRequestId: staffingRequestId
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Worker already invited or applied' }, { status: 400 });
    }

    const invite = await prisma.application.create({
      data: {
        workerProfileId: workerProfileId,
        staffingRequestId: staffingRequestId,
        status: 'INVITED' // Use INVITED as string status
      }
    });

    return NextResponse.json({ success: true, application: invite });
  } catch (error: any) {
    console.error('Error sending invite:', error);
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 });
  }
}
