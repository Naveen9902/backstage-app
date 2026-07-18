import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Total Events
    const totalEvents = await prisma.event.count({
      where: { managerId: userId }
    });

    // 2. Staff Hired
    const staffHired = await prisma.application.count({
      where: {
        status: 'ACCEPTED',
        staffingRequest: {
          event: {
            managerId: userId
          }
        }
      }
    });

    // 3. Runners Dispatched
    const runnersDispatched = await prisma.runnerDispatch.count({
      where: {
        event: { managerId: userId }
      }
    });

    // 4. Avg Rating
    const ratingAgg = await prisma.review.aggregate({
      _avg: { rating: true },
      where: { revieweeId: userId }
    });
    const avgRating = ratingAgg._avg.rating || 0;

    // 5. Trend Data & Changes
    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);

    const startOfLastMonth = new Date(startOfThisMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const sixMonthsAgo = new Date(startOfThisMonth);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const recentEvents = await prisma.event.findMany({
      where: {
        managerId: userId,
        createdAt: { gte: sixMonthsAgo }
      },
      select: { createdAt: true }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = new Map();
    
    // Initialize map with last 6 months (including current) in order
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      trendMap.set(monthNames[d.getMonth()], 0);
    }

    // Populate actual data
    recentEvents.forEach(ev => {
      const monthStr = monthNames[ev.createdAt.getMonth()];
      if (trendMap.has(monthStr)) {
        trendMap.set(monthStr, trendMap.get(monthStr) + 1);
      }
    });

    const trendData = Array.from(trendMap.entries()).map(([month, value]) => ({ month, value }));

    // Changes calculation
    const eventsThisMonth = recentEvents.filter(e => e.createdAt >= startOfThisMonth).length;
    const eventsLastMonth = recentEvents.filter(e => e.createdAt >= startOfLastMonth && e.createdAt < startOfThisMonth).length;

    const recentApps = await prisma.application.findMany({
      where: { status: 'ACCEPTED', staffingRequest: { event: { managerId: userId } }, createdAt: { gte: startOfLastMonth } },
      select: { createdAt: true }
    });
    const staffThisMonth = recentApps.filter(a => a.createdAt >= startOfThisMonth).length;
    const staffLastMonth = recentApps.filter(a => a.createdAt >= startOfLastMonth && a.createdAt < startOfThisMonth).length;

    const recentRunners = await prisma.runnerDispatch.findMany({
      where: { event: { managerId: userId }, createdAt: { gte: startOfLastMonth } },
      select: { createdAt: true }
    });
    const runnersThisMonth = recentRunners.filter(r => r.createdAt >= startOfThisMonth).length;
    const runnersLastMonth = recentRunners.filter(r => r.createdAt >= startOfLastMonth && r.createdAt < startOfThisMonth).length;

    const recentReviews = await prisma.review.findMany({
      where: { revieweeId: userId, createdAt: { gte: startOfLastMonth } },
      select: { rating: true, createdAt: true }
    });
    const reviewsThisMonth = recentReviews.filter(r => r.createdAt >= startOfThisMonth);
    const reviewsLastMonth = recentReviews.filter(r => r.createdAt >= startOfLastMonth && r.createdAt < startOfThisMonth);
    const ratingThisMonth = reviewsThisMonth.length ? reviewsThisMonth.reduce((s, r) => s + r.rating, 0) / reviewsThisMonth.length : 0;
    const ratingLastMonth = reviewsLastMonth.length ? reviewsLastMonth.reduce((s, r) => s + r.rating, 0) / reviewsLastMonth.length : 0;

    const calcPercent = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? '+100%' : '0%';
      const pct = ((curr - prev) / prev) * 100;
      return `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`;
    };
    
    const calcDiff = (curr: number, prev: number) => {
      const diff = curr - prev;
      return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`;
    };

    // 6. Top Events
    const eventsWithStaff = await prisma.event.findMany({
      where: { managerId: userId },
      select: {
        id: true,
        title: true,
        staffingRequests: {
          select: { 
            applications: {
              where: { status: 'ACCEPTED' },
              select: { id: true }
            }
          }
        },
        reviews: {
          select: { rating: true }
        }
      }
    });

    const eventStats = eventsWithStaff.map(ev => {
      const staffHired = ev.staffingRequests.reduce((sum, req) => sum + req.applications.length, 0);
      const evRatingAvg = ev.reviews.length > 0
        ? ev.reviews.reduce((sum, rev) => sum + rev.rating, 0) / ev.reviews.length
        : 0;

      return {
        name: ev.title,
        staff: staffHired,
        rating: evRatingAvg.toFixed(1)
      };
    });

    eventStats.sort((a, b) => {
      const ratingDiff = parseFloat(b.rating) - parseFloat(a.rating);
      if (ratingDiff !== 0) return ratingDiff;
      return b.staff - a.staff;
    });

    const topEvents = eventStats.slice(0, 3);

    return NextResponse.json({
      totalEvents: { value: totalEvents, change: calcPercent(eventsThisMonth, eventsLastMonth) },
      staffHired: { value: staffHired, change: calcPercent(staffThisMonth, staffLastMonth) },
      runnersDispatched: { value: runnersDispatched, change: calcPercent(runnersThisMonth, runnersLastMonth) },
      avgRating: { value: avgRating, change: calcDiff(ratingThisMonth, ratingLastMonth) },
      trendData,
      topEvents
    }, { status: 200 });

  } catch (error: any) {
    console.error("ANALYTICS ERROR:", error);
    return NextResponse.json({ error: 'Failed to fetch analytics', details: error.message }, { status: 500 });
  }
}
