export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { applicationId } = await req.json();

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        staffingRequest: { include: { event: true } },
        workerProfile: { include: { user: true } },
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const payRate = application.staffingRequest.payRate;
    const qty = application.staffingRequest.quantity;
    const workerPayout = payRate * qty;
    const platformFee = workerPayout * 0.15; // 15% platform fee
    const totalAmount = workerPayout + platformFee;

    const receiptId = `receipt_${crypto.randomBytes(8).toString('hex')}`;

    const options = {
      amount: Math.round(totalAmount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: receiptId,
      notes: {
        applicationId: application.id,
        eventId: application.staffingRequest.event.id,
      }
    };

    let order;
    if (!process.env.RAZORPAY_KEY_SECRET) {
      // Simulation mode
      order = { id: `order_mock_${crypto.randomBytes(8).toString('hex')}`, amount: options.amount };
    } else {
      order = await razorpay.orders.create(options);
    }

    // Save transaction in DB
    await prisma.paymentTransaction.create({
      data: {
        applicationId: application.id,
        managerId: application.staffingRequest.event.managerId,
        workerId: application.workerProfile.userId,
        amountTotal: totalAmount,
        platformFee,
        workerPayout,
        razorpayOrderId: order.id,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ 
      orderId: order.id, 
      amount: options.amount,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_fallback_key',
    });
  } catch (error) {
    console.error('Razorpay Checkout Error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
