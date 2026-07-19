export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ eventId: string, messageId: string }> }) {
  try {
    const { eventId, messageId } = await params;
    
    const cookieStore = await cookies();
    let userId = cookieStore.get('fanUserId')?.value;
    if (!userId) userId = cookieStore.get('managerUserId')?.value;
    if (!userId) userId = cookieStore.get('workerUserId')?.value;
    if (!userId) userId = cookieStore.get('adminUserId')?.value;
    if (!userId) userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if like already exists
    const existingLike = await prisma.messageLike.findUnique({
      where: {
        messageId_userId: {
          messageId,
          userId
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.messageLike.delete({
        where: { id: existingLike.id }
      });
      return NextResponse.json({ liked: false }, { status: 200 });
    } else {
      // Like
      await prisma.messageLike.create({
        data: {
          messageId,
          userId
        }
      });
      return NextResponse.json({ liked: true }, { status: 200 });
    }
  } catch (error: any) {
    console.error("LIKE MESSAGE ERROR:", error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
