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
      name, email, mobile, avatarUrl, dateOfBirth, emergencyContact, isPhoneVerified,
      categories, specialization, pastWork, rates, portfolioLinks, isRunnerAvailable,
      govtIdUrl, liveSelfieUrl, proofOfExperienceType, proofOfExperienceUrl, 
      socialMediaUrl, referenceEvent, referenceContact, tier, requestedTier
    } = body;

    // Update user details
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        name, 
        email, 
        mobile, 
        avatarUrl,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        emergencyContact,
        isPhoneVerified: Boolean(isPhoneVerified)
      }
    });

    const updateData: any = {
      categories: Array.isArray(categories) ? categories : [],
      specialization,
      pastWork,
      rates,
      portfolioLinks,
      isRunnerAvailable: Boolean(isRunnerAvailable),
      skills: body.skills || '',
      experience: body.experience || '',
      govtIdUrl,
      liveSelfieUrl,
      proofOfExperienceType,
      proofOfExperienceUrl,
      socialMediaUrl,
      referenceEvent,
      referenceContact
    };

    // Only allow setting initial tier if not verified yet, otherwise it goes through requestedTier
    const currentProfile = await prisma.workerProfile.findUnique({ where: { userId } });
    if (!currentProfile || !currentProfile.isVerified) {
      updateData.tier = tier;
    }

    if (requestedTier) {
      updateData.requestedTier = requestedTier;
      updateData.verificationStatus = 'PENDING';
    }

    // Upsert worker profile
    const workerProfile = await prisma.workerProfile.upsert({
      where: { userId },
      update: updateData,
      create: {
        ...updateData,
        userId,
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
