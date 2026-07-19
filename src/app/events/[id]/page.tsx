import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import prisma from '@/lib/prisma';
import { Calendar, Clock, MapPin, Building, Users, Music } from 'lucide-react';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailsPage({ params }: Props) {
  const { id } = await params;
  
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

  const managerName = event.manager?.name || 'Independent Manager';
  const companyName = event.manager?.managerProfile?.company || 'Independent Company';

  return (
    <div className="min-h-screen bg-[#242424] font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-12 px-6 lg:pt-32 lg:pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#CD7F32]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#CD7F32]/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#F5F5DC]/60 hover:text-[#CD7F32] transition-colors text-sm font-semibold mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm ${event.status === 'ONGOING' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[#CD7F32]/20 text-[#CD7F32] border border-[#CD7F32]/30'}`}>
              {event.status}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif leading-tight">
            {event.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#CD7F32]" />
              {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            {event.startTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#CD7F32]" />
                {event.startTime}
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#CD7F32]" />
              {event.location}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-black/20 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6 font-serif flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#CD7F32]/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#CD7F32]" />
              </div>
              About this Event
            </h2>
            <div className="prose prose-invert prose-p:text-white/70 prose-p:leading-relaxed max-w-none">
              <p className="whitespace-pre-line">{event.description}</p>
            </div>
            
            {event.bands && (
              <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-4">
                <Music className="w-6 h-6 text-[#CD7F32] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">Performing Artists / Bands</h3>
                  <p className="text-white/70 text-sm">{event.bands}</p>
                </div>
              </div>
            )}
          </section>

          {/* Available Roles Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 font-serif flex items-center gap-3">
              <Users className="w-7 h-7 text-[#CD7F32]" />
              Available Staffing Roles
            </h2>
            
            {event.staffingRequests && event.staffingRequests.length > 0 ? (
              <div className="space-y-4">
                {event.staffingRequests.map((request) => (
                  <div key={request.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/10 transition-colors">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{request.roleName}</h3>
                      <div className="flex items-center gap-4 text-sm text-white/50">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" /> {request.quantity} Needed
                        </span>
                        <span>•</span>
                        <span className="text-[#CD7F32] font-semibold">${request.payRate.toFixed(2)} / hr</span>
                      </div>
                    </div>
                    <Link href="/register" className="bg-[#CD7F32] hover:bg-[#b06a29] text-white px-6 py-2.5 rounded-xl font-bold text-sm text-center transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[#CD7F32]/20 whitespace-nowrap">
                      Login to Apply
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 p-10 rounded-2xl text-center">
                <p className="text-white/50">No staffing requests are currently available for this event.</p>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 shadow-2xl sticky top-24">
            <h3 className="text-lg font-bold text-white mb-6 font-serif border-b border-white/10 pb-4">Event Organizer</h3>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CD7F32] to-[#8c521a] flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg">
                {companyName.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-white text-lg">{companyName}</div>
                <div className="text-white/50 text-sm">{managerName}</div>
              </div>
            </div>
            
            <div className="space-y-4 text-sm text-white/70">
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-[#CD7F32]" />
                Verified Organizer
              </div>
            </div>
            
            <Link href="/register" className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-bold text-sm mt-8 transition-colors">
              Contact Organizer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
