import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import EventChat from '@/components/EventChat';
import Link from 'next/link';

export default async function WorkerEventChatPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  
  const cookieStore = await cookies();
  let userId = cookieStore.get('workerUserId')?.value || cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'WORKER') redirect('/login');

  const profile = await prisma.workerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect('/login');

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return <div className="p-8 text-red-500">Event not found.</div>;

  const acceptedApp = await prisma.application.findFirst({
    where: {
      workerProfileId: profile.id,
      status: 'ACCEPTED',
      staffingRequest: {
        eventId: eventId
      }
    }
  });

  if (!acceptedApp) {
    return <div className="p-8 text-red-500">You do not have permission to view this chat. You must have an accepted job for this event.</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/worker/schedule" className="text-sm font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Schedule
          </Link>
          <h1 className="text-3xl font-bold font-serif">{event.title} - Chat</h1>
        </div>
      </div>
      
      <EventChat eventId={eventId} currentUser={{ id: user.id, name: user.name, role: user.role, avatarUrl: user.avatarUrl }} />
    </div>
  );
}
