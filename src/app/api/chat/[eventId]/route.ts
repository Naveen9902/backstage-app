export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  let userId = cookieStore.get('adminUserId')?.value;
  if (!userId) userId = cookieStore.get('managerUserId')?.value;
  if (!userId) userId = cookieStore.get('workerUserId')?.value;
  if (!userId) userId = cookieStore.get('userId')?.value;

  if (!userId) return null;
  return await prisma.user.findUnique({ where: { id: userId } });
}

export async function GET(req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Validate access: Manager who created it, or Worker who is accepted
    if (user.role === 'MANAGER') {
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event || event.managerId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (user.role === 'WORKER') {
      const profile = await prisma.workerProfile.findUnique({ where: { userId: user.id } });
      if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      
      const acceptedApp = await prisma.application.findFirst({
        where: {
          workerProfileId: profile.id,
          status: 'ACCEPTED',
          staffingRequest: {
            eventId: eventId
          }
        }
      });
      if (!acceptedApp) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.eventChatMessage.findMany({
      where: { eventId },
      include: {
        sender: {
          select: { name: true, avatarUrl: true, role: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const { text } = await req.json();
    const user = await getAuthenticatedUser();
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!text || !text.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 });

    // Validate access
    if (user.role === 'MANAGER') {
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event || event.managerId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (user.role === 'WORKER') {
      const profile = await prisma.workerProfile.findUnique({ where: { userId: user.id } });
      if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      
      const acceptedApp = await prisma.application.findFirst({
        where: {
          workerProfileId: profile.id,
          status: 'ACCEPTED',
          staffingRequest: {
            eventId: eventId
          }
        }
      });
      if (!acceptedApp) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const message = await prisma.eventChatMessage.create({
      data: {
        eventId,
        senderId: user.id,
        text: text.trim()
      },
      include: {
        sender: {
          select: { name: true, avatarUrl: true, role: true }
        }
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
