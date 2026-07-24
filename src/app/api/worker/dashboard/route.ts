import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

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

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get('workerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { workerProfile: true }
    });

    if (!user || !user.workerProfile) {
      return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 });
    }

    const maxDistance = 50; // default 50 miles

    // Get live/upcoming events
    const allEvents = await prisma.event.findMany({
      where: {
        status: { in: ['UPCOMING', 'ONGOING'] }
      },
      include: { staffingRequests: true }
    });

    let nearbyEvents = allEvents;
    if (user.workerProfile.latitude && user.workerProfile.longitude) {
      nearbyEvents = allEvents.map(event => {
        let distance = null;
        if (event.latitude && event.longitude) {
          distance = getDistanceInMiles(
            user.workerProfile!.latitude!, 
            user.workerProfile!.longitude!, 
            event.latitude, 
            event.longitude
          );
        }
        return { ...event, distance };
      }).filter(event => event.distance === null || event.distance <= maxDistance);
      
      nearbyEvents.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    // Get Invites
    const invites = await prisma.application.findMany({
      where: {
        workerProfileId: user.workerProfile.id,
        status: 'INVITED'
      },
      include: {
        staffingRequest: {
          include: { event: true }
        }
      }
    });

    return NextResponse.json({
      user,
      nearbyEvents,
      invites
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
