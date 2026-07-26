import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import CommunityChatLayout from '@/components/CommunityChatLayout';

export default async function UserCommunityChatPage({ params }: { params: Promise<{ eventId: string }> | { eventId: string } }) {
  try {
    const resolvedParams = await params;
    const eventId = resolvedParams?.eventId;

    if (!eventId) {
      return (
        <div className="p-12 text-center max-w-md mx-auto my-12 bg-white rounded-3xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">Community Chat Unavailable</h3>
          <p className="text-sm text-gray-500 mb-6">Invalid event identifier.</p>
          <a href="/user/community" className="bg-[#242424] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md inline-block">Back to Communities</a>
        </div>
      );
    }
    
    const cookieStore = await cookies();
    const userId = cookieStore.get('fanUserId')?.value || 
                   cookieStore.get('userId')?.value || 
                   cookieStore.get('workerUserId')?.value || 
                   cookieStore.get('managerUserId')?.value || 
                   cookieStore.get('token')?.value ||
                   cookieStore.get('auth_token')?.value;

    let user: any = null;
    if (userId) {
      user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { id: true, name: true, avatarUrl: true, role: true }
      });
    }

    // Fallback user if cookie is missing or guest mode
    if (!user) {
      user = {
        id: userId || 'community_guest',
        name: 'Community Member',
        avatarUrl: null,
        role: 'USER'
      };
    }

    // Auto-connect user to event fans in database if valid user ID
    if (user.id !== 'community_guest') {
      try {
        await prisma.event.update({
          where: { id: eventId },
          data: { fans: { connect: { id: user.id } } }
        });
      } catch (e) {}
    }

    // Server-side optimized fetch for initial event data
    const event = await prisma.event.findUnique({
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
      return (
        <div className="p-12 text-center max-w-md mx-auto my-12 bg-white rounded-3xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">Community Chat Unavailable</h3>
          <p className="text-sm text-gray-500 mb-6">This event community is currently unavailable or has been removed.</p>
          <a href="/user/community" className="bg-[#242424] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md inline-block">Back to Communities</a>
        </div>
      );
    }

    // Fetch other events for the server sidebar
    let otherEvents: any[] = [];
    try {
      if (user.role === 'USER') {
        otherEvents = await prisma.event.findMany({
          where: { fans: { some: { id: user.id } }, id: { not: eventId } },
          select: { id: true, title: true, coverImageUrl: true },
          take: 20
        });
      }
    } catch (e) {}

    const currentUserObj = {
      id: user.id,
      name: user.name || 'Member',
      avatarUrl: user.avatarUrl || null,
      role: user.role || 'USER'
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
  } catch (err: any) {
    console.error("COMMUNITY PAGE RENDER ERROR:", err);
    return (
      <div className="p-12 text-center max-w-md mx-auto my-12 bg-white rounded-3xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">Community Chat</h3>
        <p className="text-sm text-gray-500 mb-6">Unable to load chat room right now. Please try again.</p>
        <a href="/user/community" className="bg-[#242424] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md inline-block">Back to Communities</a>
      </div>
    );
  }
}
