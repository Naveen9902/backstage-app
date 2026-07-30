import { getAuthUserId } from '@/lib/auth';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    let isManager = false;
    const userId = await getAuthUserId();
    if (userId) {
      isManager = true;
    } else {
      userId = cookieStore.get('adminUserId')?.value;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Enforce manager session concurrency limits
    if (isManager) {
      const sessionToken = cookieStore.get('managerSessionToken')?.value;
      if (!sessionToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const activeSession = await prisma.session.findUnique({
        where: { token: sessionToken }
      });
      if (!activeSession || activeSession.userId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Fetch user with their profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        managerProfile: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    console.error('GET PROFILE ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch profile', details: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Force route recompilation 2
    const { name, email, company, bio, avatarUrl, location, socialLink } = await req.json();

    // Update user details
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email, avatarUrl }
    });

    // Update or create manager profile
    const profile = await prisma.managerProfile.upsert({
      where: { userId },
      update: { company, bio, location, socialLink, managerName: name, profilePictureUrl: avatarUrl },
      create: { userId, company, bio, location, socialLink, managerName: name, profilePictureUrl: avatarUrl }
    });

    return NextResponse.json({ ...user, managerProfile: profile }, { status: 200 });
  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
