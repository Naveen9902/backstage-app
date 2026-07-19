export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// Helper to get userId from cookies
async function getUserId() {
  const cookieStore = await cookies();
  let userId = cookieStore.get('fanUserId')?.value;
  if (!userId) userId = cookieStore.get('managerUserId')?.value;
  if (!userId) userId = cookieStore.get('workerUserId')?.value;
  if (!userId) userId = cookieStore.get('adminUserId')?.value;
  if (!userId) userId = cookieStore.get('userId')?.value;
  return userId;
}

// Get messages for an event
export async function GET(req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const userId = await getUserId();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch top-level messages (parentId is null)
    const messages = await prisma.eventChatMessage.findMany({
      where: { eventId, parentId: null },
      include: {
        sender: {
          select: { name: true, avatarUrl: true, role: true }
        },
        likes: true,
        replies: {
          include: {
            sender: {
              select: { name: true, avatarUrl: true, role: true }
            },
            likes: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const enrichedMessages = messages.map(msg => ({
      ...msg,
      likesCount: msg.likes.length,
      isLikedByMe: msg.likes.some((l: any) => l.userId === userId),
      replies: msg.replies.map((reply: any) => ({
        ...reply,
        likesCount: reply.likes.length,
        isLikedByMe: reply.likes.some((l: any) => l.userId === userId),
      }))
    }));

    return NextResponse.json(enrichedMessages, { status: 200 });
  } catch (error: any) {
    console.error("GET COMMUNITY MESSAGES ERROR:", error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// Post a new message
export async function POST(req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const body = await req.json();
    
    if (!body.text || !body.text.trim()) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const message = await prisma.eventChatMessage.create({
      data: {
        eventId,
        senderId: userId,
        text: body.text.trim(),
        parentId: body.parentId || null
      },
      include: {
        sender: {
          select: { name: true, avatarUrl: true, role: true }
        },
        likes: true,
        replies: {
          include: {
            sender: {
              select: { name: true, avatarUrl: true, role: true }
            },
            likes: true
          }
        }
      }
    });

    const enrichedMessage = {
      ...message,
      likesCount: message.likes.length,
      isLikedByMe: message.likes.some((l: any) => l.userId === userId),
      replies: message.replies.map((reply: any) => ({
        ...reply,
        likesCount: reply.likes.length,
        isLikedByMe: reply.likes.some((l: any) => l.userId === userId),
      }))
    };

    return NextResponse.json(enrichedMessage, { status: 201 });
  } catch (error: any) {
    console.error("POST COMMUNITY MESSAGE ERROR:", error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
