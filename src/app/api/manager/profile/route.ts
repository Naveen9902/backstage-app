import { getAuthUserId } from '@/lib/auth';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function GET() {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Force route recompilation 3
    const { name, company, bio, avatarUrl, location, socialLink } = await req.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Update user details (omitted email for security)
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, avatarUrl }
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
