import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { sendNotification } from '@/lib/notifications';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const applicationId = session.metadata?.applicationId;

        if (applicationId) {
          // Fetch application to get manager and worker IDs
          const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
              workerProfile: true,
              staffingRequest: {
                include: { event: true }
              }
            }
          });

          if (application) {
            // Update application status to ACCEPTED
            await prisma.application.update({
              where: { id: applicationId },
              data: { status: 'ACCEPTED' }
            });

            // Create PaymentTransaction record
            const paymentIntentId = session.payment_intent as string;
            
            // Retrieve payment intent to get exact fee details if needed, 
            // but we can also calculate from session totals
            const amountTotal = (session.amount_total || 0) / 100;
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
                stripePaymentIntentId: paymentIntentId,
                status: 'HELD' // Funds are held until event completion (payout happens later)
              }
            });

            // Notify the worker
            await sendNotification(
              application.workerProfile.userId,
              `Congratulations! Your application for '${application.staffingRequest.roleName}' was accepted and paid for. Check your tasks!`
            );
          }
        }
        break;
      }
      case 'identity.verification_session.verified': {
        const session = event.data.object as Stripe.Identity.VerificationSession;
        const workerProfileId = session.metadata?.workerProfileId;
        
        if (workerProfileId) {
          await prisma.workerProfile.update({
            where: { id: workerProfileId },
            data: {
              isVerified: true,
              verificationStatus: 'APPROVED'
            }
          });
        }
        break;
      }
      case 'identity.verification_session.requires_input': {
        const session = event.data.object as Stripe.Identity.VerificationSession;
        const workerProfileId = session.metadata?.workerProfileId;
        
        if (workerProfileId) {
          await prisma.workerProfile.update({
            where: { id: workerProfileId },
            data: {
              isVerified: false,
              verificationStatus: 'REJECTED' // They need to try again
            }
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('WEBHOOK PROCESSING ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
