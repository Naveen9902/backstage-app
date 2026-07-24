import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import twilio from 'twilio';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push';

const globalAny = global as any;

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const cookieStore = await cookies();
    const userId = cookieStore.get('workerUserId')?.value || cookieStore.get('userId')?.value || cookieStore.get('managerUserId')?.value;



    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          resetOtp: otp,
          resetOtpExpiry: new Date(Date.now() + 300000) // 5 minutes
        }
      });
    } else {
      console.warn('User not logged in. OTP will only work in mock mode in memory for this session.');
      globalAny.mockOtpStore = globalAny.mockOtpStore || {};
      globalAny.mockOtpStore[phone] = { code: otp, expires: Date.now() + 300000 };
    }

    // Twilio Integration (Fallback if not configured)
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      const client = twilio(twilioAccountSid, twilioAuthToken);
      try {
        await client.messages.create({
          body: `Your Back Stage verification code is: ${otp}`,
          from: twilioPhoneNumber,
          to: phone
        });
        console.log(`[Twilio] Real SMS sent to ${phone}`);
      } catch (twilioErr: any) {
        console.error('Twilio Error:', twilioErr.message);
        return NextResponse.json({ error: 'Failed to send SMS via Twilio. Check API keys and phone format.' }, { status: 500 });
      }
    } else {
      // SIMULATION MODE
      console.log('----------------------------------------------------');
      console.log('📱 SIMULATION MODE: SMS OTP SENT');
      console.log(`📱 To Phone: ${phone}`);
      console.log(`📱 OTP Code: ${otp}`);
      console.log('📱 Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to .env for real SMS.');
      console.log('----------------------------------------------------');

      if (userId) {
        await prisma.notification.create({
          data: {
            userId,
            message: `📱 Your Phone Verification OTP is: ${otp}`
          }
        });
        
        // Also send Web Push Notification if subscribed
        const userObj = await prisma.user.findUnique({ where: { id: userId } });
        if (userObj?.pushSubscription) {
          await sendPushNotification(userObj.pushSubscription, {
            title: 'Verification Code',
            body: `Your Back Stage OTP is: ${otp}`
          });
        }
      }
      return NextResponse.json({ success: true, message: 'OTP sent in simulation mode', mockOtp: otp }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent via Twilio' }, { status: 200 });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
