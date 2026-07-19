'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [session, setSession] = useState<{loggedIn: boolean, user?: any}>({ loggedIn: false });

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(() => {});
  }, []);

  const getDashboardLink = () => {
    if (session.user?.role === 'ADMIN') return '/admin';
    if (session.user?.role === 'MANAGER') return '/manager/dashboard';
    return '/worker';
  };

  return (
    <>
      <nav className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4 border-b border-white/5 bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <img src="/logo.png" alt="BackStage Logo" className="h-8 md:h-10 w-auto object-contain rounded-md" />
            <span className="text-lg md:text-xl font-bold text-white tracking-wide font-serif">Back <span className="text-[#CD7F32]">Stage</span></span>
          </Link>
        </div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/#events" className="hover:text-white transition-colors">Events</Link>
          <Link href="/#testimonials" className="hover:text-white transition-colors">Testimonials</Link>
          <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>

        <div className="hidden md:flex items-center gap-2 md:gap-4">
          {session.loggedIn ? (
            <>
              <span className="text-white/60 text-sm mr-2">Hi, {session.user?.name}</span>
              <Link href={getDashboardLink()}>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-[#242424] text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-lg shadow-black/20 border border-[#CD7F32]/50 hover:bg-[#1a1a1a] cursor-pointer"
                >
                  Dashboard
                </motion.div>
              </Link>
              <button 
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/';
                }}
                className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white hover:text-[#CD7F32] font-semibold text-sm transition-colors mr-2">Sign In</Link>
              <Link href="/register">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-[#CD7F32] text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-lg shadow-[#CD7F32]/20 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                  Get Started
                </motion.div>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Bottom App Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a1a]/95 backdrop-blur-md border-t border-white/10 z-50 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.4)] overflow-x-auto no-scrollbar">
        <div className="flex justify-between items-center h-16 min-w-full px-2 gap-1">
          <Link href="/" className="flex-1 flex flex-col items-center justify-center h-full text-white/60 hover:text-[#CD7F32] transition-colors min-w-[50px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="text-[9px] font-medium tracking-tight">Home</span>
          </Link>
          
          <Link href="/#features" className="flex-1 flex flex-col items-center justify-center h-full text-white/60 hover:text-[#CD7F32] transition-colors min-w-[50px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span className="text-[9px] font-medium tracking-tight">Features</span>
          </Link>

          <Link href="/#events" className="flex-1 flex flex-col items-center justify-center h-full text-white/60 hover:text-[#CD7F32] transition-colors min-w-[50px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            <span className="text-[9px] font-medium tracking-tight">Events</span>
          </Link>
          
          <Link href="/#testimonials" className="flex-1 flex flex-col items-center justify-center h-full text-white/60 hover:text-[#CD7F32] transition-colors min-w-[50px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
            <span className="text-[9px] font-medium tracking-tight">Reviews</span>
          </Link>

          <Link href="/#pricing" className="flex-1 flex flex-col items-center justify-center h-full text-white/60 hover:text-[#CD7F32] transition-colors min-w-[50px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span className="text-[9px] font-medium tracking-tight">Pricing</span>
          </Link>
          
          {session.loggedIn ? (
            <Link href={getDashboardLink()} className="flex-1 flex flex-col items-center justify-center h-full text-[#CD7F32] hover:text-[#a06227] transition-colors min-w-[50px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <span className="text-[9px] font-medium tracking-tight">Dash</span>
            </Link>
          ) : (
            <Link href="/login" className="flex-1 flex flex-col items-center justify-center h-full text-[#CD7F32] hover:text-[#a06227] transition-colors min-w-[50px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
              <span className="text-[9px] font-medium tracking-tight">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
