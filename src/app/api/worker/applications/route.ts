import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('workerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: {
        workerProfile: {
          userId: userId
        }
      },
      include: {
        staffingRequest: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                date: true,
                startTime: true,
                status: true,
                location: true,
                managerId: true,
                manager: {
                  select: {
                    managerProfile: {
                      select: { company: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    console.error('GET APPLICATIONS ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('workerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { staffingRequestId } = await req.json();

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId }
    });

    if (!workerProfile) {
      return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 });
    }

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: {
        workerProfileId: workerProfile.id,
        staffingRequestId
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Already applied' }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        workerProfileId: workerProfile.id,
        staffingRequestId,
        status: 'PENDING'
      }
    });

    await sendNotification(userId, `You have successfully applied for the role.`);

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("APPLY ERROR:", error);
    return NextResponse.json({ error: 'Failed to apply' }, { status: 500 });
  }
}
