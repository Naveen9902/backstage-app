export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json([], { status: 200 });
    }

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
          { bands: { contains: query, mode: 'insensitive' } },
        ]
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
