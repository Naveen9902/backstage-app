export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get('fanUserId')?.value;
    if (!userId) userId = cookieStore.get('managerUserId')?.value;
    if (!userId) userId = cookieStore.get('workerUserId')?.value;
    if (!userId) userId = cookieStore.get('adminUserId')?.value;
    if (!userId) userId = cookieStore.get('userId')?.value;

    if (!userId) {
      const fallbackEvents = await prisma.event.findMany({
        take: 30,
        include: {
          _count: { select: { fans: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(fallbackEvents, { status: 200 });
    }

    // Fetch events where this user is in the 'fans' relation
    let events = await prisma.event.findMany({
      where: {
        fans: {
          some: {
            id: userId
          }
        }
      },
      include: {
        _count: {
          select: { fans: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Fallback: If user hasn't joined any communities yet, return all available events
    if (events.length === 0) {
      events = await prisma.event.findMany({
        take: 30,
        include: {
          _count: {
            select: { fans: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    return NextResponse.json(events, { status: 200 });
  } catch (error: any) {
    console.error("GET COMMUNITY EVENTS ERROR:", error);
    return NextResponse.json({ error: 'Failed to fetch communities' }, { status: 500 });
  }
}
