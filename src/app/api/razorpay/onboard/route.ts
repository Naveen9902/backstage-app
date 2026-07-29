export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workerProfileId = searchParams.get('workerProfileId');

    if (!workerProfileId) {
      return NextResponse.json({ error: 'Missing workerProfileId' }, { status: 400 });
    }

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { id: workerProfileId },
      include: { user: true }
    });

    if (!workerProfile) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    // Razorpay Route v1 doesn't have a plug-and-play Hosted Onboarding UI like Stripe Connect.
    // Typically, you'd collect bank details on your own frontend and pass them to Razorpay APIs
    // or use Razorpay OAuth. For this implementation, we will simulate the account creation and 
    // redirect back to the profile to signify successful linking.
    
    const mockAccountId = `acc_${Math.random().toString(36).substring(2, 10)}`;

    await prisma.workerProfile.update({
      where: { id: workerProfileId },
      data: { 
        razorpayAccountId: mockAccountId,
        razorpayAccountStatus: 'ACTIVE'
      }
    });
    
    // Give frontend time to process and then redirect back
    return NextResponse.json({ url: '/worker/profile?razorpay_return=true' });

  } catch (error) {
    console.error('Razorpay Onboard Error:', error);
    return NextResponse.json({ error: 'Failed to onboard' }, { status: 500 });
  }
}
