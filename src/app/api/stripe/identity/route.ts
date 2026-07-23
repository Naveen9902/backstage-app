import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('workerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId }
    });

    if (!workerProfile) {
      return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 });
    }

    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        workerProfileId: workerProfile.id,
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/worker/profile`,
    });

    await prisma.workerProfile.update({
      where: { id: workerProfile.id },
      data: {
        stripeIdentitySessionId: verificationSession.id,
        verificationStatus: 'PENDING'
      }
    });

    return NextResponse.json({ url: verificationSession.url }, { status: 200 });
  } catch (error: any) {
    console.error('Stripe Identity Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create verification session' }, { status: 500 });
  }
}
