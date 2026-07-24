export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('workerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all staffing requests for future events
    const jobs = await prisma.staffingRequest.findMany({
      where: {
        event: {
          status: {
            in: ['UPCOMING', 'ONGOING']
          }
        }
      },
      include: {
        event: {
          select: {
            title: true,
            date: true,
            location: true,
            manager: {
              select: {
                managerProfile: {
                  select: {
                    company: true
                  }
                }
              }
            }
          }
        },
        // We also need to know if the current worker has already applied
        applications: {
          where: {
            workerProfile: {
              userId: userId
            }
          },
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        event: {
          date: 'asc'
        }
      }
    });

    return NextResponse.json(jobs, { status: 200 });
  } catch (error) {
    console.error("GET JOBS ERROR:", error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
