export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get applications for events managed by this user
    const applications = await prisma.application.findMany({
      where: {
        staffingRequest: {
          event: {
            managerId: userId
          }
        }
      },
      include: {
        workerProfile: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        staffingRequest: {
          include: {
            event: {
              select: { title: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
