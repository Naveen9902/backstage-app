import { getAuthUserId } from '@/lib/auth';
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
    const userId = await getAuthUserId();

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
    const userId = await getAuthUserId();

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

    const { roleName, quantity, payRate, payType, tierTarget, questions } = await req.json();

    const targetTier = tierTarget || 'Tier 1';
    let finalQuestions: string[] = [];

    if (targetTier === 'Tier 2' || targetTier === 'Tier 3') {
      if (!Array.isArray(questions) || questions.length < 1) {
        return NextResponse.json({ error: `At least 1 custom question is mandatory for ${targetTier} roles.` }, { status: 400 });
      }
      finalQuestions = questions.filter(q => typeof q === 'string' && q.trim() !== '');
      if (finalQuestions.length < 1) {
         return NextResponse.json({ error: `At least 1 valid custom question is mandatory for ${targetTier} roles.` }, { status: 400 });
      }
    }

    const request = await prisma.staffingRequest.create({
      data: {
        eventId,
        roleName,
        quantity: parseInt(quantity, 10),
        payRate: parseFloat(payRate),
        payType: payType || 'HOURLY',
        tier: targetTier,
        questions: finalQuestions
      }
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create staffing request' }, { status: 500 });
  }
}
