import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId } = await req.json();
    if (!applicationId) {
      return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        staffingRequest: {
          include: { event: true }
        },
        workerProfile: {
          include: { user: true }
        }
      }
    });

    if (!application || application.staffingRequest.event.managerId !== userId) {
      return NextResponse.json({ error: 'Application not found or unauthorized' }, { status: 404 });
    }

    if (!application.workerProfile.stripeAccountId) {
      return NextResponse.json({ error: 'Worker has not set up payments yet.' }, { status: 400 });
    }

    // Determine the base URL for redirects
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // For gig work, we calculate total pay. Let's assume payRate is total fixed pay for the event.
    // If it's hourly, we would need 'hours' from the event or request.
    // Let's use payRate as the fixed amount.
    const workerAmount = application.staffingRequest.payRate; 
    const platformFeePercentage = 0.10; // 10% platform fee
    const platformFeeAmount = workerAmount * platformFeePercentage;
    const totalAmount = workerAmount + platformFeeAmount;

    // --- SIMULATION MODE ---
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('SIMULATION MODE: Redirecting to mock Stripe checkout');
      return NextResponse.json({ 
        url: `/mock/stripe/checkout?applicationId=${application.id}&amount=${totalAmount}&eventId=${application.staffingRequest.eventId}` 
      });
    }
    // -----------------------

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd', // Assuming USD for now
            product_data: {
              name: `Staffing: ${application.staffingRequest.roleName}`,
              description: `Event: ${application.staffingRequest.event.title}`,
            },
            unit_amount: Math.round(totalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(platformFeeAmount * 100),
        transfer_data: {
          destination: application.workerProfile.stripeAccountId,
        },
        metadata: {
          applicationId: application.id,
          managerId: userId,
          workerId: application.workerProfile.userId
        }
      },
      mode: 'payment',
      success_url: `${baseUrl}/manager/events/${application.staffingRequest.eventId}?payment_success=true`,
      cancel_url: `${baseUrl}/manager/events/${application.staffingRequest.eventId}?payment_canceled=true`,
      metadata: {
        applicationId: application.id,
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('STRIPE CHECKOUT ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
