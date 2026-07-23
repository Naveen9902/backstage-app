import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type } = body;

    if (type === 'MOCK_ONBOARDING') {
      const { workerId } = body;
      
      // Assign a fake stripeAccountId to the worker profile
      await prisma.workerProfile.update({
        where: { id: workerId },
        data: { stripeAccountId: `acct_mock_${Math.random().toString(36).substring(2, 9)}` }
      });
      
      return NextResponse.json({ success: true });
    }

    if (type === 'MOCK_CHECKOUT') {
      const { applicationId, amountTotal } = body;

      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          workerProfile: true,
          staffingRequest: {
            include: { event: true }
          }
        }
      });

      if (!application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }

      // Update application status to ACCEPTED
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: 'ACCEPTED' }
      });

      // Create PaymentTransaction record
      const workerAmount = application.staffingRequest.payRate;
      const platformFee = amountTotal - workerAmount;

      await prisma.paymentTransaction.create({
        data: {
          applicationId,
          managerId: application.staffingRequest.event.managerId,
          workerId: application.workerProfile.userId,
          amountTotal,
          platformFee,
          workerPayout: workerAmount,
          stripePaymentIntentId: `pi_mock_${Math.random().toString(36).substring(2, 9)}`,
          status: 'HELD' 
        }
      });

      // Notify the worker
      await sendNotification(
        application.workerProfile.userId,
        `Congratulations! Your application for '${application.staffingRequest.roleName}' was accepted and paid for. Check your tasks!`
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid mock type' }, { status: 400 });

  } catch (error) {
    console.error('MOCK STRIPE ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
