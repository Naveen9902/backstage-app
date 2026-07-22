export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const liveEvents = await prisma.event.findMany({
      where: {
        status: 'ONGOING'
      },
      orderBy: {
        date: 'asc'
      },
      include: {
        manager: {
          include: {
            managerProfile: true,
          }
        },
        staffingRequests: true
      }
    });

    return NextResponse.json(liveEvents);
  } catch (error) {
    console.error('Failed to fetch live events:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
