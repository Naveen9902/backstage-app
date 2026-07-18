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

    // Verify Admin Role
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [totalUsers, totalWorkers, totalManagers, totalEvents, totalApplications, unverifiedWorkers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'WORKER' } }),
      prisma.user.count({ where: { role: 'MANAGER' } }),
      prisma.event.count(),
      prisma.application.count(),
      prisma.workerProfile.count({ where: { isVerified: false } }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalWorkers,
      totalManagers,
      totalEvents,
      totalApplications,
      unverifiedWorkers,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
