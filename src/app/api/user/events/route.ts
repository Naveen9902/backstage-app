export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // For fans/users, they can see all UPCOMING or ONGOING events
    const events = await prisma.event.findMany({
      where: { 
        status: {
          in: ['UPCOMING', 'ONGOING']
        }
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error: any) {
    console.error("GET USER EVENTS ERROR:", error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
