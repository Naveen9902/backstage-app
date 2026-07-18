export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get('adminUserId')?.value;
    if (!userId) userId = cookieStore.get('managerUserId')?.value;
    if (!userId) userId = cookieStore.get('workerUserId')?.value;
    if (!userId) userId = cookieStore.get('userId')?.value; // fallback

    if (!userId) {
      return NextResponse.json({ loggedIn: false }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
      }
    });

    if (!user) {
      return NextResponse.json({ loggedIn: false }, { status: 200 });
    }

    return NextResponse.json({ loggedIn: true, user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ loggedIn: false }, { status: 200 });
  }
}
