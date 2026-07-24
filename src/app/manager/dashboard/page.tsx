'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ManagerDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [appsData, setAppsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, eventsRes, appsRes] = await Promise.all([
        fetch('/api/manager/profile'),
        fetch('/api/manager/events'),
        fetch('/api/manager/applications')
      ]);

      const profData = await profileRes.json();
      const evData = await eventsRes.json();
      const appData = await appsRes.json();

      setProfile(profData);
      if (Array.isArray(evData)) setEventsData(evData);
      if (Array.isArray(appData)) setAppsData(appData);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  // Derived stats
  const totalEvents = eventsData.length;
  const liveEvents = eventsData.filter(e => e.status === 'ONGOING');
  const completedEvents = eventsData.filter(e => e.status === 'COMPLETED').length;
  const upcomingEvents = eventsData.filter(e => !e.status || e.status === 'UPCOMING').length;
  const totalJobs = eventsData.reduce((sum, ev) =>
    sum + (Array.isArray(ev.staffingRequests) ? ev.staffingRequests.reduce((s: number, r: any) => s + (r.quantity || 0), 0) : 0), 0);
  const totalApps = appsData.length;
  const avgRating = (() => {
    const ratings = appsData.map((a: any) => a.workerProfile?.rating || 0).filter((r: number) => r > 0);
    return ratings.length > 0 ? ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length : 0;
  })();

  const stats = [
    { label: 'Total Events', value: totalEvents.toString(), sub: `${upcomingEvents} upcoming · ${liveEvents.length} live` },
    { label: 'Total Jobs Posted', value: totalJobs.toString(), sub: 'Across all events' },
    { label: 'Applications', value: totalApps.toString(), sub: 'Received total' },
    { label: 'Avg Talent Rating', value: avgRating.toFixed(1), sub: 'Based on applicants' },
  ];

  return (
    <div className="text-[#242424]">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">Dashboard</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p className="text-lg text-gray-700">
              Welcome back, <span className="text-[#CD7F32] font-semibold uppercase">{profile?.name || 'Manager'}!</span>
            </p>
            {profile?.managerProfile?.subscriptionTier && (
              <div className="inline-flex">
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  profile.managerProfile.subscriptionTier === 'ENTERPRISE'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : profile.managerProfile.subscriptionTier === 'PRO'
                      ? 'bg-[#CD7F32]/10 text-[#CD7F32] border border-[#CD7F32]/20'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {profile.managerProfile.subscriptionTier} Plan
                </span>
              </div>
            )}
          </div>
        </div>
        <Link href="/manager/events/create">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-[#CD7F32] text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-[#CD7F32]/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            Create Event
          </motion.button>
        </Link>
      </div>

      {/* Live Event Alert */}
      {!loading && liveEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-green-50 border border-green-300 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse flex-shrink-0"></span>
            <div>
              <p className="font-bold text-green-800">
                {liveEvents.length === 1 ? `"${liveEvents[0].title}" is LIVE now!` : `${liveEvents.length} events are LIVE right now!`}
              </p>
              <p className="text-green-600 text-sm">Runners can be dispatched for these events.</p>
            </div>
          </div>
          <Link href="/manager/runners">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Dispatch Runners
            </button>
          </Link>
        </motion.div>
      )}

      {loading ? (
        <div className="text-gray-500 font-medium">Loading dashboard...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[
              { label: 'Total Events', value: totalEvents.toString(), sub: `${upcomingEvents} upcoming · ${liveEvents.length} live`, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> },
              { label: 'Total Jobs Posted', value: totalJobs.toString(), sub: 'Across all events', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
              { label: 'Applications', value: totalApps.toString(), sub: 'Received total', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { label: 'Avg Talent Rating', value: avgRating.toFixed(1), sub: 'Based on applicants', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="bg-white rounded-2xl p-6 flex flex-col justify-between h-44 border border-gray-100"
                style={{ boxShadow: '-6px 6px 0px rgba(205, 127, 50, 0.9)' }}
              >
                <div>{stat.icon}</div>
                <div>
                  <h3 className="text-4xl font-semibold mb-0.5">{stat.value}</h3>
                  <p className="text-gray-600 font-medium text-sm">{stat.label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{stat.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Completed Events Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex items-center justify-between mb-10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-500">{completedEvents}</h3>
                <p className="text-gray-500 font-semibold text-sm">Completed Events</p>
                <p className="text-gray-400 text-xs">Successfully closed and wrapped up</p>
              </div>
            </div>
            <Link href="/manager/my-events">
              <button className="text-sm font-semibold text-gray-500 hover:text-gray-800 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                View All Events
              </button>
            </Link>
          </motion.div>

          {/* Recent Active Events (exclude completed) */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold font-serif">Active Events</h2>
              <Link href="/manager/my-events" className="text-sm font-bold text-[#CD7F32] hover:underline">View All</Link>
            </div>
            {eventsData.filter(e => e.status !== 'COMPLETED').length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-gray-100 text-center text-gray-500">
                No active events. <Link href="/manager/events/create" className="text-[#CD7F32] hover:underline">Create a new event.</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {eventsData.filter(e => e.status !== 'COMPLETED').slice(0, 4).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl p-4 border flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${event.status === 'ONGOING' ? 'bg-green-500 animate-pulse' : 'bg-[#CD7F32]'}`}></div>
                      <div>
                        <h4 className="font-bold text-sm">{event.title}</h4>
                        <p className="text-xs text-gray-500">{event.location} · {new Date(event.date).toISOString().split('T')[0]}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${event.status === 'ONGOING' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {event.status === 'ONGOING' ? '🔴 LIVE' : 'Upcoming'}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Completed Events (Review & Pay) */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold font-serif">Recently Completed</h2>
              <Link href="/manager/my-events" className="text-sm font-bold text-[#CD7F32] hover:underline">View All</Link>
            </div>
            
            {eventsData.filter(e => e.status === 'COMPLETED').length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 text-center text-gray-500">
                No completed events to review yet.
              </div>
            ) : (
              <div className="space-y-3">
                {eventsData.filter(e => e.status === 'COMPLETED').slice(0, 4).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl p-4 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-gray-400"></div>
                      <div>
                        <h4 className="font-bold text-sm">{event.title}</h4>
                        <p className="text-xs text-gray-500">{event.location} · {new Date(event.date).toISOString().split('T')[0]}</p>
                      </div>
                    </div>
                    
                    <div className="flex w-full md:w-auto">
                      <Link href="/manager/my-events" className="w-full">
                        <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#CD7F32] hover:bg-[#a06227] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          Review & Pay Staff
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
