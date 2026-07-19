export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        staffingRequests: true,
        fans: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event, { status: 200 });
  } catch (error: any) {
    console.error("GET USER EVENT ERROR:", error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}
