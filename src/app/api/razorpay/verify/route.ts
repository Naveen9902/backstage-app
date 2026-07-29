export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    // Simulation mode check
    if (!secret || razorpay_order_id.startsWith('order_mock_')) {
      await finalizePayment(razorpay_order_id, razorpay_payment_id);
      return NextResponse.json({ success: true, verified: true });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      await finalizePayment(razorpay_order_id, razorpay_payment_id);
      return NextResponse.json({ success: true, verified: true });
    } else {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}

async function finalizePayment(orderId: string, paymentId: string) {
  const transaction = await prisma.paymentTransaction.findUnique({
    where: { razorpayOrderId: orderId },
    include: { application: true }
  });

  if (transaction && transaction.status === 'PENDING') {
    // 1. Update transaction
    await prisma.paymentTransaction.update({
      where: { razorpayOrderId: orderId },
      data: { 
        status: 'PAID_OUT', // Or HELD depending on payout strategy
        razorpayPaymentId: paymentId
      }
    });

    // 2. Update application status
    await prisma.application.update({
      where: { id: transaction.applicationId },
      data: { status: 'PAID' }
    });
  }
}
