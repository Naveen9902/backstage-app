export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workerProfileId = searchParams.get('workerProfileId');

    if (!workerProfileId) {
      return NextResponse.json({ error: 'Missing workerProfileId' }, { status: 400 });
    }

    const applications = await prisma.application.findMany({
      where: { workerProfileId },
      include: {
        staffingRequest: {
          include: {
            event: true
          }
        }
      }
    });

    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { workerProfileId, staffingRequestId } = await req.json();

    if (!workerProfileId || !staffingRequestId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if application already exists
    const existing = await prisma.application.findFirst({
      where: { workerProfileId, staffingRequestId }
    });

    if (existing) {
      return NextResponse.json({ error: 'Already applied for this job' }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        workerProfileId,
        staffingRequestId,
        status: 'PENDING'
      },
      include: {
        staffingRequest: {
          include: {
            event: true
          }
        }
      }
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}
