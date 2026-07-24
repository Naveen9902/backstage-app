import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { status } = await request.json(); // e.g. ACCEPTED or REJECTED
    
    const cookieStore = await cookies();
    let userId = cookieStore.get('workerUserId')?.value || cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { workerProfile: true }
    });

    if (!application || application.workerProfile.userId !== userId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    const updatedApp = await prisma.application.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, application: updatedApp });
  } catch (error: any) {
    console.error('Error updating application status:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
