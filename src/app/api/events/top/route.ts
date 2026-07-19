export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: {
          in: ['UPCOMING', 'ONGOING']
        }
      },
      take: 3,
      orderBy: {
        date: 'asc'
      },
      include: {
        manager: {
          include: {
            managerProfile: {
              select: { company: true }
            }
          }
        }
      }
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch top events:', error);
    return NextResponse.json({ error: 'Failed to fetch top events' }, { status: 500 });
  }
}
