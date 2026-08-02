import { getAuthUserId } from '@/lib/auth';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const userId = await getAuthUserId();

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

    const url = new URL(req.url);
    const channel = url.searchParams.get('channel') || 'announcements';

    const messages = await prisma.eventChatMessage.findMany({
      where: { eventId, channel, parentId: null },
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

import { chatLimiter } from '@/lib/rateLimit';

export async function POST(req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const body = await req.json();
    const { text, imageUrl } = body;
    const channel = body.channel || 'announcements';
    const user = await getAuthenticatedUser();
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { success } = await chatLimiter.limit(user.id);
    if (!success) {
      return NextResponse.json({ error: 'Too many messages. Please wait.' }, { status: 429 });
    }

    if ((!text || !text.trim()) && !imageUrl) return NextResponse.json({ error: 'Empty message' }, { status: 400 });

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
        text: text ? text.trim() : "",
        imageUrl: imageUrl || null,
        channel,
        parentId: body.parentId || null
      },
      include: {
        sender: {
          select: { name: true, avatarUrl: true, role: true }
        }
      }
    });

    // Create Notification if it's a reply to someone else
    if (body.parentId) {
      try {
        const parentMsg = await prisma.eventChatMessage.findUnique({
          where: { id: body.parentId }
        });
        if (parentMsg && parentMsg.senderId !== user.id) {
          const event = await prisma.event.findUnique({ where: { id: eventId } });
          await prisma.notification.create({
            data: {
              userId: parentMsg.senderId,
              message: `${user.name} replied to your message in ${event?.title || 'the chat'}!`
            }
          });
        }
      } catch (err) {
        console.error("Failed to create reply notification", err);
      }
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
