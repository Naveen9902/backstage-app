export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { workerProfileId, isVerified } = await req.json();

    if (!workerProfileId) {
      return NextResponse.json({ error: 'Missing workerProfileId' }, { status: 400 });
    }

    const worker = await prisma.workerProfile.update({
      where: { id: workerProfileId },
      data: { isVerified: isVerified ?? true },
      include: {
        user: true
      }
    });

    return NextResponse.json(worker, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify worker' }, { status: 500 });
  }
}
