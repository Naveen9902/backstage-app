export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    
    // Get the current user
    const cookieStore = await cookies();
    let userId = cookieStore.get('fanUserId')?.value;
    if (!userId) userId = cookieStore.get('managerUserId')?.value;
    if (!userId) userId = cookieStore.get('workerUserId')?.value;
    if (!userId) userId = cookieStore.get('adminUserId')?.value;
    if (!userId) userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add user to the event's fans (community)
    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        fans: {
          connect: { id: userId }
        }
      },
      include: {
        fans: {
          select: { id: true }
        }
      }
    });

    return NextResponse.json({ success: true, fansCount: event.fans.length }, { status: 200 });
  } catch (error: any) {
    console.error("JOIN COMMUNITY ERROR:", error);
    return NextResponse.json({ error: 'Failed to join community' }, { status: 500 });
  }
}
