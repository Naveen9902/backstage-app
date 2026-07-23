import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const globalAny = global as any;

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN 
  ? Redis.fromEnv() 
  : null;

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone number and code are required' }, { status: 400 });
    }

    let storedCode = null;

    if (redis) {
      storedCode = await redis.get(`otp:${phone}`);
    } else {
      const mockData = globalAny.mockOtpStore?.[phone];
      if (mockData && mockData.expires > Date.now()) {
        storedCode = mockData.code;
      }
    }

    if (!storedCode) {
      return NextResponse.json({ error: 'OTP expired or not found' }, { status: 400 });
    }

    if (storedCode.toString() !== code.toString()) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    // Success! Delete the code so it can't be reused
    if (redis) {
      await redis.del(`otp:${phone}`);
    } else {
      delete globalAny.mockOtpStore[phone];
    }

    return NextResponse.json({ success: true, message: 'Phone verified successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
