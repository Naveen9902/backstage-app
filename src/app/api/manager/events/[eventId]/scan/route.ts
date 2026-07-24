import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const body = await req.json();
    const { applicationId } = body;

    const cookieStore = await cookies();
    const managerUserId = cookieStore.get('managerUserId')?.value || cookieStore.get('userId')?.value;

    if (!managerUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!applicationId) {
      return NextResponse.json({ error: 'Invalid QR Code' }, { status: 400 });
    }

    // 1. Verify the application exists and belongs to this event
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        workerProfile: {
          include: { user: true }
        },
        staffingRequest: {
          include: { event: true }
        }
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Pass is invalid or expired' }, { status: 404 });
    }

    if (application.staffingRequest.eventId !== eventId) {
      return NextResponse.json({ error: 'Pass belongs to a different event' }, { status: 400 });
    }

    // 2. Verify manager owns this event
    if (application.staffingRequest.event.managerId !== managerUserId) {
      return NextResponse.json({ error: 'You do not have permission to scan for this event' }, { status: 403 });
    }

    // 3. Verify application is ACCEPTED
    if (application.status !== 'ACCEPTED') {
      return NextResponse.json({ error: `Worker status is ${application.status}. They are not hired for this event.` }, { status: 400 });
    }

    // 4. Determine Clock-In vs Clock-Out
    if (!application.checkInTime) {
      // Clock In
      await prisma.application.update({
        where: { id: applicationId },
        data: { checkInTime: new Date() }
      });
      return NextResponse.json({
        success: true,
        action: 'CHECK_IN',
        workerName: application.workerProfile.user.name,
        roleName: application.staffingRequest.roleName
      });
    } else if (!application.checkOutTime) {
      // Clock Out
      const checkOutTime = new Date();
      await prisma.application.update({
        where: { id: applicationId },
        data: { checkOutTime }
      });

      // Calculate total hours
      const checkInTime = new Date(application.checkInTime);
      const diffMs = checkOutTime.getTime() - checkInTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      const hourlyRate = application.staffingRequest.payRate;
      const totalAmount = hourlyRate * diffHours;

      return NextResponse.json({
        success: true,
        action: 'CHECK_OUT',
        workerName: application.workerProfile.user.name,
        roleName: application.staffingRequest.roleName,
        totalHours: diffHours.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        applicationId: application.id
      });
    } else {
      return NextResponse.json({ error: 'Worker has already clocked out.' }, { status: 400 });
    }

  } catch (error) {
    console.error('QR SCAN ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
