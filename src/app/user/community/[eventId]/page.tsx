import CommunityChatLayout from '@/components/CommunityChatLayout';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export default async function UserCommunityChatPage({ params }: { params: any }) {
  let eventId = 'default';
  try {
    const p = await params;
    eventId = p?.eventId || 'default';
  } catch (e) {
    try {
      eventId = params?.eventId || 'default';
    } catch (err) {}
  }

  let user: any = null;
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('fanUserId')?.value || 
                   cookieStore.get('userId')?.value || 
                   cookieStore.get('workerUserId')?.value || 
                   cookieStore.get('managerUserId')?.value || 
                   cookieStore.get('token')?.value ||
                   cookieStore.get('auth_token')?.value;

    if (userId) {
      user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { id: true, name: true, avatarUrl: true, role: true }
      });
    }
  } catch (e) {}

  let event: any = null;
  try {
    event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        description: true,
        coverImageUrl: true,
        date: true,
        location: true,
        managerId: true,
        manager: {
          select: { id: true, name: true, avatarUrl: true, role: true }
        }
      }
    });
  } catch (e) {}

  const safeEvent = event || {
    id: eventId,
    title: "Community Chat",
    description: "Official event community chat room. Connect with attendees and organizers.",
    coverImageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000&auto=format&fit=crop",
    date: new Date().toISOString(),
    location: "Main Event Area",
    managerId: null,
    manager: null
  };

  const currentUserObj = {
    id: user?.id || 'community_member',
    name: user?.name || 'Member',
    avatarUrl: user?.avatarUrl || null,
    role: user?.role || 'USER'
  };

  const eventData = JSON.parse(JSON.stringify(safeEvent));

  return (
    <div className="w-full h-full bg-[#f3efe5] flex flex-col">
      <CommunityChatLayout 
        eventId={eventId}
        event={eventData}
        currentUser={currentUserObj}
        otherEvents={[]}
        returnHref="/user/community"
      />
    </div>
  );
}
