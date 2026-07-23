import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('workerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!workerProfile) {
      return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 });
    }

    // --- SIMULATION MODE ---
    // If there is no real Stripe key, use the simulation flow
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('SIMULATION MODE: Redirecting to mock Stripe onboarding');
      return NextResponse.json({ url: `/mock/stripe/onboarding?workerId=${workerProfile.id}` });
    }
    // -----------------------

    let accountId = workerProfile.stripeAccountId;

    // Create a new Express account if one doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // Can be parameterized based on user region
        email: workerProfile.user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      accountId = account.id;

      await prisma.workerProfile.update({
        where: { id: workerProfile.id },
        data: { stripeAccountId: accountId }
      });
    }

    // Determine the base URL for redirects
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/worker/profile?stripe_refresh=true`,
      return_url: `${baseUrl}/worker/profile?stripe_return=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('STRIPE CONNECT ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
