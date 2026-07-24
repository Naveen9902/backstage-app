import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// Haversine formula to calculate distance between two coordinates in miles
function getDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8; // Radius of earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function GET(request: Request, context: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await context.params;
    
    const cookieStore = await cookies();
    let userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier');
    const role = searchParams.get('role');
    const maxDistance = parseFloat(searchParams.get('distance') || '50');

    // Get the event to know its location coordinates
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { staffingRequests: true }
    });

    if (!event || event.managerId !== userId) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    // Base query for workers
    const workers = await prisma.workerProfile.findMany({
      where: {
        ...(tier && tier !== 'ALL' ? { tier: tier } : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    // Filter by distance if event has coordinates
    let matchedWorkers = workers;
    if (event.latitude && event.longitude) {
      matchedWorkers = workers.map(worker => {
        let distance = null;
        if (worker.latitude && worker.longitude) {
          distance = getDistanceInMiles(event.latitude!, event.longitude!, worker.latitude, worker.longitude);
        }
        return { ...worker, distance };
      }).filter(worker => worker.distance === null || worker.distance <= maxDistance);
    }

    // Filter by role if specified
    if (role && role !== 'ALL') {
      matchedWorkers = matchedWorkers.filter(worker => 
        worker.categories && worker.categories.includes(role)
      );
    }

    // Find if already invited
    const applications = await prisma.application.findMany({
      where: {
        staffingRequest: { eventId: eventId },
        workerProfileId: { in: matchedWorkers.map(w => w.id) }
      }
    });

    const results = matchedWorkers.map(w => {
      const app = applications.find(a => a.workerProfileId === w.id);
      return {
        ...w,
        applicationStatus: app ? app.status : null,
        applicationId: app ? app.id : null
      };
    });

    // Sort by distance if available, otherwise by rating
    results.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
      return (b.rating || 0) - (a.rating || 0);
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error searching talent:', error);
    return NextResponse.json({ error: 'Failed to search talent' }, { status: 500 });
  }
}
