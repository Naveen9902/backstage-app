import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('adminUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const events = await prisma.event.findMany({
      include: {
        manager: {
          select: { name: true, email: true, managerProfile: true }
        },
        staffingRequests: {
          include: { 
            applications: {
              include: {
                workerProfile: {
                  include: { user: true }
                }
              }
            } 
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
