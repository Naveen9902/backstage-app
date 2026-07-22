export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    const events = await prisma.event.findMany({
      where: query ? {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
          { bands: { contains: query, mode: 'insensitive' } },
        ]
      } : {
        date: { gte: new Date() } // only upcoming if no query
      },
      orderBy: { date: 'asc' },
      take: 50
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
