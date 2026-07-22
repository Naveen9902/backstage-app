export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: { managerId: userId },
      orderBy: { date: 'asc' },
      include: {
        staffingRequests: true
      }
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error: any) {
    console.error("GET EVENTS ERROR:", error);
    return NextResponse.json({ error: 'Failed to fetch events', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, date, startTime, location, coverImageUrl, videoUrl, attendeeCategory, tags, language, duration, bands, artistAvatarUrl } = await req.json();

    // Check manager subscription tier limits (visual/simple count check)
    const manager = await prisma.user.findUnique({
      where: { id: userId },
      include: { managerProfile: true }
    });
    
    const activeEventsCount = await prisma.event.count({
      where: { managerId: userId, status: { in: ['UPCOMING', 'ONGOING'] } }
    });

    if (manager?.managerProfile?.subscriptionTier === 'FREE' && activeEventsCount >= 2) {
      return NextResponse.json({ error: 'Upgrade to PRO to create more than 2 events.' }, { status: 403 });
    }

    // Combine date + startTime into a single DateTime if both provided
    let eventDate = new Date(date);
    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
    }

    const event = await prisma.event.create({
      data: {
        managerId: userId,
        title,
        description,
        date: eventDate,
        startTime: startTime || null,
        location,
        status: 'UPCOMING',
        coverImageUrl: coverImageUrl || null,
        videoUrl: videoUrl || null,
        attendeeCategory: attendeeCategory || null,
        tags: tags || null,
        language: language || 'English',
        duration: duration || '2 Hours',
        bands: bands || null,
        artistAvatarUrl: artistAvatarUrl || null
      }
    });

    // Notify all users about the new event
    const allUsers = await prisma.user.findMany({ select: { id: true } });
    for (const user of allUsers) {
      await sendNotification(user.id, `New Event Announced: ${title} in ${location}!`);
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('CREATE EVENT ERROR:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, status } = await req.json();

    if (!eventId || !status) {
      return NextResponse.json({ error: 'Missing eventId or status' }, { status: 400 });
    }

    const validStatuses = ['UPCOMING', 'ONGOING', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Ensure the event belongs to this manager
    const event = await prisma.event.findFirst({ where: { id: eventId, managerId: userId } });
    if (!event) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: { status }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('UPDATE EVENT STATUS ERROR:', error);
    return NextResponse.json({ error: 'Failed to update event status' }, { status: 500 });
  }
}
