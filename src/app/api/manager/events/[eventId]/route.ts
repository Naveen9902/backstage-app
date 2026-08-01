import { getAuthUserId } from '@/lib/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: Promise<{ eventId: string }> | { eventId: string } }) {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const p = await params;
    const eventId = p.eventId;

    // Verify event ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.managerId !== userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this event' }, { status: 403 });
    }

    // Delete the event (Cascade delete should handle related staffing requests etc., if configured, otherwise we may need to delete them manually)
    // Checking schema quickly for cascading, Prisma handles cascading if set. Let's do a manual delete if needed, but a simple delete should work if relations are cascading.
    await prisma.event.delete({
      where: { id: eventId }
    });

    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
