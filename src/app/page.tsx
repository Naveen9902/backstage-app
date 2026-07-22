'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  const [topEvents, setTopEvents] = useState<any[]>([]);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering
  const [showFilters, setShowFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/events/top').then(res => res.json()),
      fetch('/api/events/live').then(res => res.json())
    ]).then(([topData, liveData]) => {
      if (Array.isArray(topData)) setTopEvents(topData);
      if (Array.isArray(liveData)) setLiveEvents(liveData);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#242424] font-sans selection:bg-[#CD7F32]/30">
      <Navbar />

      {/* Hero Section (Screenshot 2) */}
      <main className="max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight font-serif text-[#CD7F32]"
          >
            Event Staffing
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/80 max-w-lg leading-relaxed"
          >
            Connect with top-tier event professionals, find the perfect opportunities, and build your career in the events industry. BackStage is the all-in-one platform for event staffing and community building.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/register" className="bg-[#CD7F32] hover:bg-[#b06a29] text-white px-8 py-3 rounded-lg font-bold transition-colors">
              Start Free Trial
            </Link>
            <button className="bg-transparent border border-white/20 hover:border-white/50 text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              See How It Works
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-10 pt-8"
          >
            <div>
              <div className="text-3xl font-bold text-white mb-1">10K+</div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Events Hosted</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#CD7F32] mb-1">4.8★</div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Average Rating</div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 w-full max-w-md lg:max-w-none"
        >
          <div className="bg-[#2D2D2D] rounded-2xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#CD7F32]/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <path d="m9 16 2 2 4-4"/>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3 font-serif">Your Event Hub</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Discover events, find jobs, connect with professionals, and grow your network.
            </p>

            <div className="flex items-center gap-4 text-xs font-bold text-white/80">
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                1.2K MEMBERS
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                LIVE NOW
              </div>
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                4.8/5
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Live Right Now Section */}
      {liveEvents.length > 0 && (
        <section className="py-12 bg-black border-y border-white/10 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-[#CD7F32]/10 blur-[120px] pointer-events-none rounded-full" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                <h2 className="text-3xl font-bold font-serif text-white tracking-tight">Live Right Now</h2>
              </div>
            </div>

            <div className="flex overflow-x-auto pb-8 -mx-6 px-6 gap-6 snap-x hide-scrollbar">
              {liveEvents.map((event, i) => (
                <Link href={`/events/${event.id}`} key={event.id} className="min-w-[320px] md:min-w-[400px] snap-start shrink-0 group">
                  <div className="bg-[#1a1a1a] border border-white/10 hover:border-[#CD7F32]/50 rounded-2xl overflow-hidden transition-all duration-300 relative h-full flex flex-col">
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        ONGOING
                      </span>
                    </div>
                    
                    <div className="h-48 w-full overflow-hidden bg-gray-800 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                      <img 
                        src={event.coverImageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-0"
                      />
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-[#CD7F32] transition-colors">{event.title}</h3>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#CD7F32] flex items-center justify-center text-[10px] font-bold text-white uppercase overflow-hidden" style={{ backgroundImage: event.artistAvatarUrl ? `url(${event.artistAvatarUrl})` : 'none', backgroundSize: 'cover' }}>
                            {!event.artistAvatarUrl && event.managerProfile?.user?.name?.charAt(0)}
                          </div>
                          <span className="text-xs text-gray-400 font-medium">By {event.managerProfile?.user?.name || 'Manager'}</span>
                        </div>
                        <span className="text-xs font-bold text-[#CD7F32] uppercase tracking-wider group-hover:underline">View Live →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Event Categories Section */}
      <section className="py-24 bg-white text-[#242424]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#CD7F32] mb-4">Discover Events</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-16">
            Find the perfect events that match your interests. From campus fests to corporate networking, we have it all.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              {
                title: "Campus fests & culture nights",
                desc: "Cultural fests, culture nights, fresher's/farewell events",
                icon: <><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></>
              },
              {
                title: "Hackathons & tech meets",
                desc: "Hackathons, tech talks, startup meetups",
                icon: <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>
              },
              {
                title: "Workshops & skill-ups",
                desc: "Hands-on workshops, training sessions, skill-building",
                icon: <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>
              },
              {
                title: "Corporate & networking",
                desc: "Offsites, launches, mixers (the public/semi-public ones)",
                icon: <><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></>
              },
              {
                title: "Career & job fairs",
                desc: "Campus placements, job and internship fairs",
                icon: <><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>
              },
              {
                title: "Music & entertainment",
                desc: "College gigs, DJ nights, open mics, cultural performances",
                icon: <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>
              }
            ].map((category, i) => (
              <div key={i} className="group bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-[#CD7F32]/40 transition-all duration-300 flex flex-col items-center text-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </svg>
                <h3 className="text-xl font-bold mb-3 font-serif group-hover:text-[#CD7F32] transition-colors">{category.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{category.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Top Events Section */}
      <section className="py-24 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-[26px] font-bold text-gray-900 mb-1">Live & Upcoming Events</h2>
              <p className="text-gray-500 text-sm">Join these active events happening right now.</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`md:hidden p-2 rounded-lg border flex items-center gap-2 text-sm font-bold transition-all ${showFilters ? 'bg-[#CD7F32] border-[#CD7F32] text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-[#CD7F32] hover:text-[#CD7F32]'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                Filters
              </button>
              <Link href="/events" className="text-[#CD7F32] font-semibold text-sm hover:underline hidden md:inline-block">View All Events &rarr;</Link>
            </div>
          </div>

          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="md:hidden bg-white border border-gray-200 rounded-2xl p-4 shadow-sm overflow-hidden mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Filters</h3>
                <button onClick={() => setLocationFilter('')} className="text-xs font-bold text-[#CD7F32] uppercase tracking-wider hover:underline">Clear Filters</button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Location</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <input 
                      type="text" 
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      placeholder="Filter by city, venue..." 
                      className="w-full bg-[#f8f6f0] border-transparent rounded-xl pl-9 pr-4 py-2 text-sm focus:border-[#CD7F32] focus:bg-white focus:ring-1 focus:ring-[#CD7F32] transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 gap-8">
            {/* Main Area: Event Grid */}
            <div>
              {loading ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-[4/5] bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse"></div>
                  ))}
                </div>
              ) : topEvents.filter(e => !locationFilter || e.location?.toLowerCase().includes(locationFilter.toLowerCase())).length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-gray-100 shadow-sm text-center text-gray-500">
                  No events found matching your filters.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {topEvents.filter(e => !locationFilter || e.location?.toLowerCase().includes(locationFilter.toLowerCase())).map(event => (
                    <Link href={`/events/${event.id}`} key={event.id} className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgba(205,127,50,0.15)] hover:-translate-y-1 border border-gray-100 hover:border-[#CD7F32]/30 transition-all duration-300">
                      <div className="aspect-[4/5] rounded-t-2xl overflow-hidden bg-gray-100 mb-0 relative border-b border-gray-100">
                        <img 
                          src={event.coverImageUrl || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000&auto=format&fit=crop"} 
                          alt={event.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md bg-white/95 backdrop-blur-md uppercase shadow-sm ${event.status === 'ONGOING' ? 'text-green-600' : 'text-[#CD7F32]'}`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <img 
                            src={event.artistAvatarUrl || event.manager?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.bands || event.manager?.name || "Artist")}&background=random`} 
                            alt={event.bands || event.manager?.name || "Artist"} 
                            className="w-6 h-6 rounded-full object-cover border border-gray-200"
                          />
                          <span className="text-[12px] font-semibold text-gray-700 truncate">
                            {event.bands || event.manager?.name || "Unknown Artist"}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1 text-[15px] leading-snug line-clamp-2 group-hover:text-[#CD7F32] transition-colors">{event.title}</h3>
                        <p className="text-[13px] text-gray-500 line-clamp-1 mb-1">{event.location}</p>
                        <p className="text-[12px] text-gray-400 font-medium line-clamp-1">{event.tags}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white text-[#242424]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#CD7F32] mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Whether you are an independent talent or a large event production company, we have a plan for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-shadow flex flex-col">
              <h3 className="text-xl font-bold font-serif mb-2">Talent / Worker</h3>
              <div className="text-4xl font-bold mb-6">Free<span className="text-sm text-gray-500 font-normal">/forever</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Create professional profile
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Apply to unlimited events
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Receive ratings & reviews
                </li>
              </ul>
              <Link href="/register" className="w-full block text-center bg-white border-2 border-gray-200 hover:border-[#CD7F32] text-[#242424] px-6 py-3 rounded-xl font-bold transition-colors">
                Get Started
              </Link>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="bg-[#242424] rounded-3xl p-8 border border-[#CD7F32]/50 shadow-2xl transform md:-translate-y-4 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#CD7F32] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">MOST POPULAR</div>
              <h3 className="text-xl font-bold font-serif text-white mb-2">Manager Pro</h3>
              <div className="text-4xl font-bold text-white mb-6">$49<span className="text-sm text-white/50 font-normal">/month</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-white/80">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Host up to 10 events/month
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Advanced talent filtering
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  In-app messaging & dispatch
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Basic analytics dashboard
                </li>
              </ul>
              <Link href="/register" className="w-full block text-center bg-[#CD7F32] hover:bg-[#b06a29] text-white px-6 py-3 rounded-xl font-bold transition-colors">
                Start 14-Day Trial
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-shadow flex flex-col">
              <h3 className="text-xl font-bold font-serif mb-2">Enterprise</h3>
              <div className="text-4xl font-bold mb-6">$199<span className="text-sm text-gray-500 font-normal">/month</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Unlimited events
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Dedicated account manager
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Custom runner integrations
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  API access & SSO
                </li>
              </ul>
              <button className="w-full block text-center bg-white border-2 border-gray-200 hover:border-[#CD7F32] text-[#242424] px-6 py-3 rounded-xl font-bold transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA & Footer Section (Screenshot 1) */}
      <section className="bg-[#D68D46] pt-20">
        <div className="max-w-4xl mx-auto px-6 text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-white mb-4">Ready to Join the Community?</h2>
          <p className="text-white/90 text-lg mb-10">
            Join thousands of event professionals already using BackStage.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="bg-[#242424] hover:bg-[#1a1a1a] text-white px-8 py-3.5 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              Create Free Account
            </Link>
            <button className="bg-transparent border border-white hover:bg-white/10 text-white px-8 py-3.5 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              Watch Demo
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#242424] py-16 border-t-[6px] border-[#a66a2e]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
            <div>
              <Link href="/" className="flex items-center gap-2 font-serif text-2xl font-bold text-white mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#CD7F32] flex items-center justify-center shadow-lg shadow-[#CD7F32]/20">
                  <span className="text-[#242424]">B</span>
                </div>
                Back<span className="text-[#CD7F32]">Stage</span>
              </Link>
              <p className="text-white/40">The ultimate platform for event staffing and community building.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">Platform</h4>
              <ul className="space-y-3 text-white/50">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#events" className="hover:text-white transition-colors">Events</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">Community</h4>
              <ul className="space-y-3 text-white/50">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/forums" className="hover:text-white transition-colors">Forums</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>

              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">Contact</h4>
              <ul className="space-y-3 text-white/50">
                <li>support@backstage.com</li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </footer>
      </section>
      
    </div>
  );
}
