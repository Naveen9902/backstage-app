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
    <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="BackStage Logo" className="h-10 w-auto object-contain rounded-md" />
          <span className="text-xl font-bold text-white tracking-wide font-serif">Back <span className="text-[#CD7F32]">Stage</span></span>
        </Link>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
        <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
        <Link href="/#events" className="hover:text-white transition-colors">Events</Link>
        <Link href="/#testimonials" className="hover:text-white transition-colors">Testimonials</Link>
        <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
      </div>
      {session.loggedIn ? (
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm hidden md:inline">Hi, {session.user?.name}</span>
          <Link href={getDashboardLink()}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-[#242424] text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-lg shadow-black/20 border border-[#CD7F32]/50 hover:bg-[#1a1a1a]"
            >
              Dashboard
            </motion.button>
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
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-white hover:text-[#CD7F32] font-semibold text-sm transition-colors mr-2">Sign In</Link>
          <Link href="/register">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-[#CD7F32] text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-lg shadow-[#CD7F32]/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
              Get Started
            </motion.button>
          </Link>
        </div>
      )}
    </nav>
  );
}
