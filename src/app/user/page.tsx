'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function UserDashboard() {
  return (
    <div className="space-y-8 text-[#242424] font-sans">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">Welcome to BackStage</h1>
        <p className="text-gray-600">Discover events, join communities, and follow your favorite bands.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/user/events">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[#CD7F32]/20 cursor-pointer h-full"
          >
            <div className="w-12 h-12 bg-[#CD7F32]/10 rounded-xl flex items-center justify-center text-[#CD7F32] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Upcoming Events</h2>
            <p className="text-sm text-gray-500">Browse and discover the best live music events happening near you.</p>
          </motion.div>
        </Link>
        
        <Link href="/user/community">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[#CD7F32]/20 cursor-pointer h-full"
          >
            <div className="w-12 h-12 bg-[#CD7F32]/10 rounded-xl flex items-center justify-center text-[#CD7F32] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Community Hub</h2>
            <p className="text-sm text-gray-500">Connect with other fans, share experiences, and discuss your favorite artists.</p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
