'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommunityPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/community')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCommunities(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12 font-sans pb-24 relative px-4 md:px-8 mt-6">
      
      {/* Immersive Background Glow */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-[#CD7F32]/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[2.5rem] bg-[#242424] p-12 md:p-16 shadow-2xl border border-black/50 group"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay group-hover:scale-105 transition-transform duration-[3s] ease-out"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#242424] via-[#242424]/90 to-transparent"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#CD7F32]/30 rounded-full blur-[100px] group-hover:bg-[#CD7F32]/40 transition-colors duration-1000"></div>
        
        <div className="relative z-10 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-gradient-to-tr from-[#CD7F32] to-[#ffb163] rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(205,127,50,0.4)] ring-2 ring-white/20"
          >
            <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold font-serif text-white mb-4 leading-tight tracking-tight">The Inner <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CD7F32] to-[#ffb163]">Circle</span></h1>
          <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-lg">Your exclusive hub for event communities. Connect, discuss, and experience events together.</p>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold font-serif text-[#242424] flex items-center gap-3">
            <span className="w-1.5 h-6 bg-[#CD7F32] rounded-full inline-block"></span>
            Your Communities
          </h2>
          <div className="bg-gray-100 px-4 py-1.5 rounded-full text-sm font-bold text-gray-600 shadow-inner">
            {loading ? "..." : `${communities.length} Joined`}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white/50 border border-gray-100 rounded-3xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : communities.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 max-w-3xl mx-auto"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 shadow-inner border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className="font-bold font-serif text-3xl mb-3 text-[#242424]">No Communities Yet</h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto mb-10 leading-relaxed">
              Your social calendar is wide open! Find an event and join its community to start mingling with other fans and staff.
            </p>
            <Link href="/user/events">
              <button className="bg-[#242424] hover:bg-black text-[#CD7F32] font-bold py-4 px-10 rounded-xl transition-all shadow-xl hover:shadow-[#242424]/20 hover:-translate-y-1 flex items-center gap-3 mx-auto">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                Discover Events
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {communities.map((event, i) => (
                <Link key={event.id} href={`/user/community/${event.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5, type: "spring", stiffness: 100 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="group bg-[#242424] rounded-3xl p-1 relative overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#CD7F32]/20 cursor-pointer h-full flex flex-col"
                  >
                    {/* Glowing border effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#CD7F32]/50 via-transparent to-[#CD7F32]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="bg-[#1a1a1a] rounded-[1.4rem] p-8 h-full flex flex-col relative z-10 border border-white/5">
                      {/* Floating glowing orb */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#CD7F32]/20 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                      <div className="flex justify-between items-start mb-8 relative z-20">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#333] to-[#222] rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[#CD7F32] group-hover:bg-[#CD7F32]/10 transition-all duration-300 shadow-inner border border-white/5 ring-1 ring-white/5 group-hover:ring-[#CD7F32]/50">
                          <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                          {event._count?.fans || 0} Online
                        </div>
                      </div>
                      
                      <h3 className="font-bold font-serif text-2xl mb-3 text-white group-hover:text-[#CD7F32] transition-colors leading-tight">{event.title}</h3>
                      <p className="text-sm text-gray-400 mb-8 line-clamp-2 leading-relaxed flex-1">{event.description || "Join the conversation with other attendees and exclusive staff members."}</p>
                      
                      <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                        <div className="flex -space-x-3">
                          {[...Array(Math.min(3, (event._count?.fans || 0) || 1))].map((_, idx) => (
                            <div key={idx} className="w-8 h-8 rounded-full border-2 border-[#1a1a1a] bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center relative z-[3-idx]">
                               <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2 text-[#CD7F32] text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                          Enter Chat
                          <div className="w-8 h-8 rounded-full bg-[#CD7F32]/10 flex items-center justify-center group-hover:bg-[#CD7F32] group-hover:text-white transition-colors">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
