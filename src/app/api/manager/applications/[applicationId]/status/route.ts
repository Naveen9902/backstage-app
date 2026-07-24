export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { applicationId } = resolvedParams;
    const { status } = await req.json();

    if (!['ACCEPTED', 'REJECTED', 'PAID'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify application belongs to an event managed by this user
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        staffingRequest: {
          event: {
            managerId: userId
          }
        }
      },
      include: {
        workerProfile: {
          select: { userId: true }
        },
        staffingRequest: {
          select: { 
            roleName: true,
            event: { select: { title: true, date: true } }
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found or unauthorized' }, { status: 404 });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status }
    });

    if (status === 'ACCEPTED' && application.staffingRequest.event.date) {
      const acceptedDate = application.staffingRequest.event.date;
      const startOfDay = new Date(acceptedDate);
      startOfDay.setUTCHours(0,0,0,0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCHours(23,59,59,999);

      const pendingApps = await prisma.application.findMany({
        where: {
          workerProfileId: application.workerProfileId,
          status: 'PENDING',
          id: { not: applicationId },
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
      
      if (pendingApps.length > 0) {
        await prisma.application.updateMany({
          where: {
            id: { in: pendingApps.map(a => a.id) }
          },
          data: { status: 'REJECTED' }
        });
      }
    }

    await sendNotification(
      application.workerProfile.userId,
      `Your application for '${application.staffingRequest.roleName}' at ${application.staffingRequest.event.title} was ${status}.`
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 });
  }
}
