import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CommunityChatLayout from '@/components/CommunityChatLayout';

export default async function ManagerEventChatPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  
  const cookieStore = await cookies();
  let userId = cookieStore.get('managerUserId')?.value || cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'MANAGER') redirect('/login');

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

  if (!event || event.managerId !== user.id) {
    return <div className="p-8 text-red-500">You do not have permission to view this chat.</div>;
  }

  // Fetch other events managed by this manager
  const otherEvents = await prisma.event.findMany({
    where: { managerId: user.id, id: { not: eventId } },
    select: { id: true, title: true, coverImageUrl: true }
  });

  const currentUserObj = {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role
  };

  const eventData = JSON.parse(JSON.stringify(event));

  return (
    <div className="w-full h-full bg-[#f3efe5] rounded-xl overflow-hidden">
      <CommunityChatLayout 
        eventId={eventId}
        event={eventData}
        currentUser={currentUserObj}
        otherEvents={otherEvents}
        returnHref="/manager/my-events"
      />
    </div>
  );
}
