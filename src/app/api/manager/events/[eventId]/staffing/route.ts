export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { eventId } = resolvedParams;

    // Verify event belongs to manager
    const event = await prisma.event.findFirst({
      where: { id: eventId, managerId: userId }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    const requests = await prisma.staffingRequest.findMany({
      where: { eventId },
      include: {
        applications: {
          include: {
            workerProfile: {
              include: {
                user: {
                  select: { id: true, name: true, avatarUrl: true }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch staffing requests' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { eventId } = resolvedParams;

    // Verify event belongs to manager
    const event = await prisma.event.findFirst({
      where: { id: eventId, managerId: userId }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    if (event.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Cannot add staffing requests to a completed event' }, { status: 400 });
    }

    const { roleName, quantity, payRate, tierTarget } = await req.json();

    const request = await prisma.staffingRequest.create({
      data: {
        eventId,
        roleName,
        quantity: parseInt(quantity, 10),
        payRate: parseFloat(payRate),
        tier: tierTarget || 'TIER_1'
      }
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create staffing request' }, { status: 500 });
  }
}
