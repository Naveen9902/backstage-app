import { getAuthUserId } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for large uploads
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = await getAuthUserId();

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
    logger.error("GET EVENTS ERROR", error, { userId: await getAuthUserId() });
    return NextResponse.json({ error: 'Failed to fetch events', details: error.message }, { status: 500 });
  }
}

import { eventCreationSchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch (parseErr) {
      return NextResponse.json({ error: 'Invalid request body. The cover image may be too large. Try a smaller image.' }, { status: 400 });
    }
    
    let validatedData;
    try {
      validatedData = eventCreationSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: validationError.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { title, description, date, startTime, location, coverImageUrl, videoUrl, attendeeCategory, tags, language, duration, bands, artistAvatarUrl, socialLink } = validatedData;

    // Check manager subscription tier limits (visual/simple count check)
    const manager = await prisma.user.findUnique({
      where: { id: userId },
      include: { managerProfile: true }
    });
    
    const activeEventsCount = await prisma.event.count({
      where: { managerId: userId, status: { in: ['UPCOMING', 'ONGOING'] } }
    });

    if (manager?.managerProfile?.subscriptionTier === 'FREE' && activeEventsCount >= 10) {
      return NextResponse.json({ error: 'Upgrade to PRO to create more than 10 events.' }, { status: 403 });
    }

    // Combine date + startTime into a single DateTime if both provided
    let eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format.' }, { status: 400 });
    }
    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
    }

    // Size limits: 10MB for images, 50MB for video
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 50 * 1024 * 1024; // 50MB
    const safeCoverImage = coverImageUrl && coverImageUrl.length > maxImageSize ? null : (coverImageUrl || null);
    const safeVideo = videoUrl && videoUrl.length > maxVideoSize ? null : (videoUrl || null);
    const safeArtistAvatar = artistAvatarUrl && artistAvatarUrl.length > maxImageSize ? null : (artistAvatarUrl || null);

    const event = await prisma.event.create({
      data: {
        managerId: userId,
        title,
        description,
        date: eventDate,
        startTime: startTime || null,
        location,
        status: 'UPCOMING',
        coverImageUrl: safeCoverImage,
        videoUrl: safeVideo,
        attendeeCategory: attendeeCategory || null,
        tags: tags || null,
        language: language || 'English',
        duration: duration || '2 Hours',
        bands: bands || null,
        artistAvatarUrl: safeArtistAvatar,
        socialLink: socialLink || null
      }
    });

    // Notify all users about the new event (non-blocking - don't let notification failures block response)
    try {
      const allUsers = await prisma.user.findMany({ select: { id: true } });
      // Send notifications in batches to avoid timeout
      const batchSize = 20;
      for (let i = 0; i < allUsers.length; i += batchSize) {
        const batch = allUsers.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(user => sendNotification(user.id, `New Event Announced: ${title} in ${location}!`))
        );
      }
    } catch (notifErr) {
      logger.error('Notification send failed (non-blocking)', notifErr, { eventId: event.id });
    }

    logger.info("Event created successfully", { eventId: event.id, managerId: userId, title });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    logger.error('CREATE EVENT ERROR', error, { userId: await getAuthUserId() });
    const message = error?.message || 'Failed to create event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = await getAuthUserId();

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
    logger.error('UPDATE EVENT STATUS ERROR', error, { userId: await getAuthUserId() });
    return NextResponse.json({ error: 'Failed to update event status' }, { status: 500 });
  }
}
