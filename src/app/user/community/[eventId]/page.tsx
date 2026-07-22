import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CommunityChatLayout from '@/components/CommunityChatLayout';

export default async function UserCommunityChatPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  
  const cookieStore = await cookies();
  const userId = cookieStore.get('fanUserId')?.value || cookieStore.get('workerUserId')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect('/login');

  // Server-side fetch for initial event data to pass to layout
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      manager: {
        select: { id: true, name: true, avatarUrl: true, role: true }
      },
      staffingRequests: {
        include: {
          applications: {
            include: {
              workerProfile: {
                include: {
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
        select: { id: true, name: true, avatarUrl: true, role: true }
      }
    }
  });

  if (!event) {
    return <div className="p-8 text-center text-red-500">Event not found</div>;
  }

  // Fetch other events for the server sidebar
  let otherEvents: any[] = [];
  if (user.role === 'USER') {
    otherEvents = await prisma.event.findMany({
      where: { fans: { some: { id: user.id } }, id: { not: eventId } },
      select: { id: true, title: true, coverImageUrl: true }
    });
  } else if (user.role === 'WORKER') {
    const workerProfile = await prisma.workerProfile.findUnique({ where: { userId: user.id } });
    if (workerProfile) {
      const apps = await prisma.application.findMany({
        where: { workerProfileId: workerProfile.id, status: { in: ['ACCEPTED', 'HIRED'] } },
        include: { staffingRequest: { include: { event: { select: { id: true, title: true, coverImageUrl: true } } } } }
      });
      // Filter unique events
      const eventMap = new Map();
      apps.forEach(app => {
        if (app.staffingRequest.event && app.staffingRequest.event.id !== eventId) {
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
