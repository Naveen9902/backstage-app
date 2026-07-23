export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get('fanUserId')?.value;
    if (!userId) userId = cookieStore.get('managerUserId')?.value;
    if (!userId) userId = cookieStore.get('workerUserId')?.value;
    if (!userId) userId = cookieStore.get('adminUserId')?.value;
    if (!userId) userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get('fanUserId')?.value;
    if (!userId) userId = cookieStore.get('managerUserId')?.value;
    if (!userId) userId = cookieStore.get('workerUserId')?.value;
    if (!userId) userId = cookieStore.get('adminUserId')?.value;
    if (!userId) userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, mobile, avatarUrl } = body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        mobile,
        avatarUrl
      }
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get('fanUserId')?.value;
    if (!userId) userId = cookieStore.get('managerUserId')?.value;
    if (!userId) userId = cookieStore.get('workerUserId')?.value;
    if (!userId) userId = cookieStore.get('adminUserId')?.value;
    if (!userId) userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the user from the database.
    // Thanks to the `onDelete: Cascade` rules in schema.prisma, 
    // this will automatically cleanly delete their profiles, events, and messages.
    await prisma.user.delete({
      where: { id: userId }
    });

    // Clear all auth cookies
    cookieStore.delete('userId');
    cookieStore.delete('workerUserId');
    cookieStore.delete('managerUserId');
    cookieStore.delete('adminUserId');
    cookieStore.delete('fanUserId');

    return NextResponse.json({ success: true, message: 'Account deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete Profile Error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}

