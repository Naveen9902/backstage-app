export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';

    const managers = await prisma.managerProfile.findMany({
      where: {
        verificationStatus: status
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            mobile: true,
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    return NextResponse.json(managers, { status: 200 });
  } catch (error) {
    console.error('Error fetching managers:', error);
    return NextResponse.json({ error: 'Failed to fetch managers' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { managerProfileId, action } = await req.json();

    if (!managerProfileId || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const updatedManager = await prisma.managerProfile.update({
      where: { id: managerProfileId },
      data: {
        isVerified: action === 'APPROVE',
        verificationStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
      },
      include: {
        user: true
      }
    });

    return NextResponse.json(updatedManager, { status: 200 });
  } catch (error) {
    console.error('Error updating manager verification:', error);
    return NextResponse.json({ error: 'Failed to update manager verification' }, { status: 500 });
  }
}
