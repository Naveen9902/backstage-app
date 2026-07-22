import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import prisma from '@/lib/prisma';
import { Calendar, Clock, MapPin, Globe, Ticket, Lightbulb, ThumbsUp, Navigation, ChevronRight, Sparkles } from 'lucide-react';
import EventMediaGallery from '@/components/EventMediaGallery';
import { cookies } from 'next/headers';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailsPage({ params }: Props) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const userId = cookieStore.get('fanUserId')?.value || cookieStore.get('workerUserId')?.value || cookieStore.get('managerUserId')?.value;
  
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      manager: {
        include: {
          managerProfile: true,
        },
      },
      staffingRequests: true,
    },
  });

  if (!event) {
    notFound();
  }

  // Fetch related events for "You May Also Like"
  const relatedEvents = await prisma.event.findMany({
    where: {
      id: { not: id },
      status: 'UPCOMING'
    },
    take: 5
  });

  // Default values for new BookMyShow style fields
  const duration = event.duration || "3 Hours";
  const language = event.language || "Kannada";
  const tags = event.tags || "Contemporary, Folk, Rock";
  const coverImage = event.coverImageUrl || "https://images.unsplash.com/photo-1540039155732-d68a98b4b76a?q=80&w=2000&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <div className="bg-[#242424]">
        <Navbar />
      </div>
      
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
        
        {/* Left Column */}
        <div>
          {/* Hero Banner Carousel (Poster + Video) */}
          <EventMediaGallery 
            coverImage={coverImage} 
            videoUrl={event.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"} 
            title={event.title} 
          />

          {/* Tags and Interest */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
            <div className="flex items-center gap-2">
              {tags.split(',').slice(0,3).map((tag, idx) => (
                <span key={idx} className="bg-[#2B3144] text-white text-[11px] uppercase tracking-wide font-semibold px-3 py-1.5 rounded-md">
                  {tag.trim()}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
                <ThumbsUp className="w-5 h-5 text-green-500 fill-green-500" />
                717 are interested
              </div>
              <Link href={userId ? `/user/events/${id}` : `/login`} className="border border-[#CD7F32] text-[#CD7F32] hover:bg-[#CD7F32]/5 font-semibold px-6 py-2 rounded-lg transition-colors text-sm text-center">
                {userId ? 'Join Community' : 'Login to Join Community'}
              </Link>
            </div>
          </div>

          <div className="space-y-12">
            
            {/* About The Event */}
            <section>
              <h2 className="text-[22px] font-bold text-gray-900 mb-4">About The Event</h2>
              <div className="text-gray-700 text-sm leading-relaxed space-y-4">
                <p className="whitespace-pre-line text-[15px] text-gray-800">{event.description}</p>
                <button className="text-[#CD7F32] font-semibold text-[15px] hover:underline">Read More</button>
              </div>
            </section>

            {/* You Should Know */}
            <section>
              <h2 className="text-[22px] font-bold text-gray-900 mb-4">You Should Know</h2>
              <div className="bg-[#FFF4E8] rounded-xl p-6 flex items-start gap-4">
                <div className="bg-transparent mt-0.5 shrink-0">
                   <Lightbulb className="w-6 h-6 text-gray-800 stroke-[1.5]" />
                </div>
                <p className="text-[14px] text-gray-900 font-semibold leading-relaxed pt-1">
                  An additional cover charge, fully redeemable on food and beverages, will be payable at the gate.
                </p>
              </div>
            </section>

            {/* Featured Highlights & Artist Lineup */}
            {event.bands && (
              <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700 mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#CD7F32]" />
                  Featured Lineup & Highlights
                </h2>
                <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-thin">
                  {event.bands.split(',').map((band, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 w-[110px] shrink-0 group/artist">
                      <div className="w-[84px] h-[84px] rounded-full overflow-hidden border-2 border-gray-100 shadow-sm group-hover/artist:border-[#CD7F32] group-hover/artist:shadow-md transition-all duration-300 relative bg-gradient-to-tr from-[#CD7F32]/10 to-[#CD7F32]/5">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(band.trim())}&background=CD7F32&color=fff&size=128&font-size=0.35&bold=true`} 
                          alt={band.trim()} 
                          className="w-full h-full object-cover group-hover/artist:scale-110 transition-transform duration-300" 
                        />
                      </div>
                      <span className="text-xs text-gray-800 text-center font-bold line-clamp-2 leading-tight group-hover/artist:text-[#CD7F32] transition-colors">{band.trim()}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>

        {/* Right Sticky Sidebar */}
        <div className="relative">
          <div className="sticky top-24 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-4 text-gray-700">
                <Calendar className="w-5 h-5 text-gray-500 shrink-0" />
                <div className="text-[15px] pt-0.5">{new Date(event.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
              
              {event.startTime && (
                <div className="flex items-start gap-4 text-gray-700">
                  <Clock className="w-5 h-5 text-gray-500 shrink-0" />
                  <div className="text-[15px] pt-0.5">{event.startTime}</div>
                </div>
              )}

              <div className="flex items-start gap-4 text-gray-700">
                <Clock className="w-5 h-5 text-gray-500 shrink-0" />
                <div className="text-[15px] pt-0.5">{duration}</div>
              </div>

              <div className="flex items-start gap-4 text-gray-700">
                <Globe className="w-5 h-5 text-gray-500 shrink-0" />
                <div className="text-[15px] pt-0.5">{language}</div>
              </div>

              <div className="flex items-start gap-4 text-gray-700">
                <Ticket className="w-5 h-5 text-gray-500 shrink-0" />
                <div className="text-[15px] pt-0.5">{tags}</div>
              </div>

              <div className="flex items-start gap-4 text-gray-700">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">{event.location}</div>
                  <Link href={`https://maps.google.com/?q=${event.location}`} target="_blank" className="text-blue-600 text-sm hover:underline">
                    View on Map
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 flex flex-col items-center">
              <button className="w-full bg-[#CD7F32] hover:bg-[#b56e29] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#CD7F32]/30 transition-transform active:scale-95 text-lg">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* You May Also Like Section */}
      <div className="bg-white pb-24 pt-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[22px] font-bold text-gray-900">You May Also Like</h2>
            <Link href="/events" className="text-[#CD7F32] font-semibold text-[15px] flex items-center gap-1 hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-gray-500 text-[15px] mb-8">Events around you, book now</p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {relatedEvents.map((related) => (
              <Link href={`/events/${related.id}`} key={related.id} className="group cursor-pointer flex flex-col h-full">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-4 relative shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-[#CD7F32]/30">
                  <img 
                    src={related.coverImageUrl || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000&auto=format&fit=crop"} 
                    alt={related.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="font-bold text-sm">View Details</h3>
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 mb-1 group-hover:text-[#CD7F32] transition-colors">{related.title}</h4>
                <p className="text-sm text-gray-500">{related.location}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
