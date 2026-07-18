import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import EventChat from '@/components/EventChat';
import Link from 'next/link';

export default async function ManagerEventChatPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  
  const cookieStore = await cookies();
  let userId = cookieStore.get('managerUserId')?.value || cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'MANAGER') redirect('/login');

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.managerId !== user.id) {
    return <div className="p-8 text-red-500">You do not have permission to view this chat.</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/manager/my-events" className="text-sm font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to My Events
          </Link>
          <h1 className="text-3xl font-bold font-serif">{event.title} - Chat</h1>
        </div>
      </div>
      
      <EventChat eventId={eventId} currentUser={{ id: user.id, name: user.name, role: user.role, avatarUrl: user.avatarUrl }} />
    </div>
  );
}
