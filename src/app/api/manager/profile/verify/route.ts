export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('managerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { managerProfile: true }
    });

    if (!user || !user.managerProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = user.managerProfile;
    const managerName = profile.managerName || user.name;
    const company = profile.company;
    const location = profile.location;
    const socialLink = profile.socialLink;
    const profilePictureUrl = profile.profilePictureUrl || user.avatarUrl;

    const missingFields = [];
    if (!managerName) missingFields.push('Name');
    if (!company) missingFields.push('Company');
    if (!location) missingFields.push('Location');
    if (!socialLink) missingFields.push('Social Link');
    if (!profilePictureUrl) missingFields.push('Profile Picture');

    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Please fill out missing fields before applying: ${missingFields.join(', ')}.` 
      }, { status: 400 });
    }

    // Update verification status
    const updatedProfile = await prisma.managerProfile.update({
      where: { id: profile.id },
      data: {
        isVerified: false,
        verificationStatus: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, managerProfile: updatedProfile }, { status: 200 });

  } catch (error) {
    console.error('VERIFY PROFILE ERROR:', error);
    return NextResponse.json({ error: 'Failed to apply for verification' }, { status: 500 });
  }
}
