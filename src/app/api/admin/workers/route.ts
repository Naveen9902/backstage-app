import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('adminUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'ADMIN' && user.email !== 'admin@backstage.com')) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';

    const workers = await prisma.workerProfile.findMany({
      where: {
        verificationStatus: status
      },
      include: {
        user: {
          select: { name: true, email: true, avatarUrl: true, createdAt: true }
        }
      },
      orderBy: { user: { createdAt: 'desc' } }
    });

    return NextResponse.json(workers, { status: 200 });
  } catch (error) {
    console.error('GET ADMIN WORKERS ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('adminUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'ADMIN' && user.email !== 'admin@backstage.com')) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { workerProfileId, action } = await req.json(); // action can be 'APPROVE' or 'REJECT'

    if (!workerProfileId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const profile = await prisma.workerProfile.findUnique({ where: { id: workerProfileId } });
    if (!profile) return NextResponse.json({ error: 'Worker not found' }, { status: 404 });

    let isVerified = false;
    let verificationStatus = 'PENDING';
    let updateData: any = {};

    if (action === 'APPROVE') {
      isVerified = true;
      verificationStatus = 'APPROVED';
      if (profile.requestedTier) {
        updateData.tier = profile.requestedTier;
      }
    } else if (action === 'REJECT') {
      isVerified = false;
      verificationStatus = 'REJECTED';
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    updateData.isVerified = isVerified;
    updateData.verificationStatus = verificationStatus;

    const updated = await prisma.workerProfile.update({
      where: { id: workerProfileId },
      data: updateData,
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('VERIFY WORKER ERROR:', error);
    return NextResponse.json({ error: 'Failed to verify worker' }, { status: 500 });
  }
}
