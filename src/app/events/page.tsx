import Navbar from '@/components/Navbar';
import prisma from '@/lib/prisma';
import EventsFilters from '@/components/EventsFilters';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
    select: {
      id: true,
      title: true,
      location: true,
      status: true,
      attendeeCategory: true,
      tags: true,
      coverImageUrl: true,
    }
  });

  return (
    <div className="font-sans">
      <div className="bg-[#242424]">
        <Navbar />
      </div>
      
      {/* Client Component for Search, Filters, and Grid */}
      <EventsFilters events={events} />
    </div>
  );
}
