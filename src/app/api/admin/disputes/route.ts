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
    const status = searchParams.get('status') || 'OPEN';

    const disputes = await prisma.dispute.findMany({
      where: {
        status
      },
      include: {
        reporter: {
          select: { name: true, email: true, role: true }
        },
        target: {
          select: { name: true, email: true, role: true }
        },
        event: {
          select: { title: true, date: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(disputes, { status: 200 });
  } catch (error) {
    console.error('GET ADMIN DISPUTES ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 });
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

    const { disputeId, resolution } = await req.json();

    if (!disputeId) {
      return NextResponse.json({ error: 'Missing disputeId' }, { status: 400 });
    }

    const updated = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: 'RESOLVED',
        resolution
      }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('RESOLVE DISPUTE ERROR:', error);
    return NextResponse.json({ error: 'Failed to resolve dispute' }, { status: 500 });
  }
}
