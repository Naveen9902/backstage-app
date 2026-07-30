import { getAuthUserId } from '@/lib/auth';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = await getAuthUserId();

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
            id: true,
            title: true,
            date: true,
            location: true,
            coverImageUrl: true,
            attendeeCategory: true,
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
