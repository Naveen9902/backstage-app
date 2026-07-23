import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    // Manager, Worker, or generic user ID
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('workerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { eventId, revieweeId, rating, comment } = body;

    if (!eventId || !revieweeId || !rating) {
      console.log('[DEBUG REVIEWS] 400: Missing required fields:', { eventId, revieweeId, rating });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify event is COMPLETED
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.status !== 'COMPLETED') {
      console.log('[DEBUG REVIEWS] 400: Event not COMPLETED. Status:', event.status);
      return NextResponse.json({ error: 'Reviews can only be submitted for completed events' }, { status: 400 });
    }

    // Prevent duplicate reviews
    const existingReview = await prisma.review.findUnique({
      where: {
        eventId_reviewerId_revieweeId: {
          eventId,
          reviewerId: userId,
          revieweeId,
        }
      }
    });

    if (existingReview) {
      console.log('[DEBUG REVIEWS] 400: Duplicate review detected.');
      return NextResponse.json({ error: 'Review already submitted for this user on this event' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        eventId,
        reviewerId: userId,
        revieweeId,
        rating: Number(rating),
        comment: comment || null,
      }
    });

    // Update user's average rating in their profile
    // Determine if reviewee is manager or worker
    const reviewee = await prisma.user.findUnique({
      where: { id: revieweeId },
      include: { workerProfile: true, managerProfile: true }
    });

    if (reviewee?.workerProfile) {
      const allWorkerReviews = await prisma.review.findMany({
        where: { revieweeId: revieweeId }
      });
      const avg = allWorkerReviews.reduce((acc, r) => acc + r.rating, 0) / allWorkerReviews.length;
      await prisma.workerProfile.update({
        where: { id: reviewee.workerProfile.id },
        data: { rating: avg }
      });
    } else if (reviewee?.managerProfile) {
      const allManagerReviews = await prisma.review.findMany({
        where: { revieweeId: revieweeId }
      });
      const avg = allManagerReviews.reduce((acc, r) => acc + r.rating, 0) / allManagerReviews.length;
      await prisma.managerProfile.update({
        where: { id: reviewee.managerProfile.id },
        data: { rating: avg }
      });
    }

    await sendNotification(revieweeId, `You received a new ${rating}-star review.`);

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('POST REVIEW ERROR:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('workerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const type = searchParams.get('type'); // 'given' or 'received'

    const whereClause: any = {};
    if (eventId) {
      whereClause.eventId = eventId;
    }
    
    if (type === 'received') {
      whereClause.revieweeId = userId;
    } else {
      whereClause.reviewerId = userId; // default to 'given'
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        reviewee: {
          select: { name: true, role: true }
        },
        reviewer: {
          select: { name: true, role: true }
        }
      }
    });

    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error('GET REVIEWS ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
