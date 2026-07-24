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

    if (!workerProfile.isVerified) {
      return NextResponse.json({ error: 'You must be approved by an Admin before applying for jobs' }, { status: 403 });
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

    const targetStaffingRequest = await prisma.staffingRequest.findUnique({
      where: { id: staffingRequestId },
      include: { event: true }
    });

    if (!targetStaffingRequest || !targetStaffingRequest.event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const startOfDay = new Date(targetStaffingRequest.event.date);
    startOfDay.setUTCHours(0,0,0,0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23,59,59,999);

    const conflictingApp = await prisma.application.findFirst({
      where: {
        workerProfileId: workerProfile.id,
        status: 'ACCEPTED',
        staffingRequest: {
          event: {
            date: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        }
      }
    });

    if (conflictingApp) {
      return NextResponse.json({ error: 'You are already hired for an event on this date' }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        workerProfileId: workerProfile.id,
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

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

    await sendNotification(userId, `You have successfully applied for the role.`);
    
    // Notify Manager
    if (application.staffingRequest?.event?.managerId) {
      await sendNotification(
        application.staffingRequest.event.managerId, 
        `${user?.name || 'A worker'} has applied for ${application.staffingRequest.roleName} at ${application.staffingRequest.event.title}.`
      );
    }

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("APPLY ERROR:", error);
    return NextResponse.json({ error: 'Failed to apply' }, { status: 500 });
  }
}
