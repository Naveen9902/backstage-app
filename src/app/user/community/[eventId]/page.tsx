import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CommunityChatLayout from '@/components/CommunityChatLayout';

export default async function UserCommunityChatPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  
  const cookieStore = await cookies();
  const userId = cookieStore.get('fanUserId')?.value || 
                 cookieStore.get('userId')?.value || 
                 cookieStore.get('workerUserId')?.value || 
                 cookieStore.get('managerUserId')?.value || 
                 cookieStore.get('token')?.value ||
                 cookieStore.get('auth_token')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect('/login');

  // Server-side optimized fetch for initial event data
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      coverImageUrl: true,
      date: true,
      location: true,
      managerId: true,
      manager: {
        select: { id: true, name: true, avatarUrl: true, role: true }
      },
      staffingRequests: {
        select: {
          applications: {
            where: { status: { in: ['ACCEPTED', 'HIRED'] } },
            select: {
              workerProfile: {
                select: {
                  user: {
                    select: { id: true, name: true, avatarUrl: true, role: true }
                  }
                }
              }
            }
          }
        }
      },
      fans: {
        select: { id: true, name: true, avatarUrl: true, role: true },
        take: 50
      }
    }
  });

  if (!event) {
    return <div className="p-8 text-center text-red-500 font-bold">Event not found</div>;
  }

  // Fetch other events for the server sidebar
  let otherEvents: any[] = [];
  if (user.role === 'USER') {
    otherEvents = await prisma.event.findMany({
      where: { fans: { some: { id: user.id } }, id: { not: eventId } },
      select: { id: true, title: true, coverImageUrl: true },
      take: 20
    });
  } else if (user.role === 'WORKER') {
    const workerProfile = await prisma.workerProfile.findUnique({ 
      where: { userId: user.id },
      select: { id: true }
    });
    if (workerProfile) {
      const apps = await prisma.application.findMany({
        where: { workerProfileId: workerProfile.id, status: { in: ['ACCEPTED', 'HIRED'] } },
        select: { staffingRequest: { select: { event: { select: { id: true, title: true, coverImageUrl: true } } } } },
        take: 20
      });
      const eventMap = new Map();
      apps.forEach(app => {
        if (app.staffingRequest?.event && app.staffingRequest.event.id !== eventId) {
          eventMap.set(app.staffingRequest.event.id, app.staffingRequest.event);
        }
      });
      otherEvents = Array.from(eventMap.values());
    }
  }

  const currentUserObj = {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role
  };

  const eventData = JSON.parse(JSON.stringify(event));

  return (
    <div className="w-[100vw] h-[calc(100dvh-128px)] -mx-4 -mt-4 bg-[#f3efe5] md:w-full md:h-full md:mx-0 md:mt-0 flex flex-col">
      <CommunityChatLayout 
        eventId={eventId}
        event={eventData}
        currentUser={currentUserObj}
        otherEvents={otherEvents}
        returnHref="/user/community"
      />
    </div>
  );
}
