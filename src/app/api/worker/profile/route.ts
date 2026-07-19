export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma'; // force recompile

export async function GET() {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get('workerUserId')?.value;
    if (!userId) userId = cookieStore.get('managerUserId')?.value;
    if (!userId) userId = cookieStore.get('adminUserId')?.value;
    if (!userId) userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { workerProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('workerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      name, email, mobile, avatarUrl, 
      category, specialization, pastWork, rates, portfolioLinks, isRunnerAvailable 
    } = body;

    // Update user details
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email, mobile, avatarUrl }
    });

    // Upsert worker profile
    const workerProfile = await prisma.workerProfile.upsert({
      where: { userId },
      update: {
        category,
        specialization,
        pastWork,
        rates,
        portfolioLinks,
        isRunnerAvailable: Boolean(isRunnerAvailable),
        skills: body.skills || '',
        experience: body.experience || '',
      },
      create: {
        userId,
        category,
        specialization,
        pastWork,
        rates,
        portfolioLinks,
        isRunnerAvailable: Boolean(isRunnerAvailable),
        skills: body.skills || '',
        experience: body.experience || '',
        isVerified: false,
        rating: 0
      }
    });

    return NextResponse.json({ user, workerProfile }, { status: 200 });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
