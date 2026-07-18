'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function WorkerDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [profRes, appsRes] = await Promise.all([
        fetch('/api/worker/profile', { cache: 'no-store' }),
        fetch('/api/worker/applications', { cache: 'no-store' })
      ]);
      const profData = await profRes.json();
      const appsData = await appsRes.json();
      if (profData && !profData.error) setProfile(profData);
      if (Array.isArray(appsData)) setApplications(appsData);
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const acceptedApps = applications.filter(app => app.status === 'ACCEPTED');
  const pendingApps = applications.filter(app => app.status === 'PENDING').length;
  const liveShifts = acceptedApps.filter(app => app.staffingRequest?.event?.status === 'ONGOING');
  const completedShifts = acceptedApps.filter(app => app.staffingRequest?.event?.status === 'COMPLETED').length;
  const upcomingShifts = acceptedApps.filter(app => !app.staffingRequest?.event?.status || app.staffingRequest?.event?.status === 'UPCOMING').length;
  const isRunner = profile?.workerProfile?.isRunnerAvailable ? 'Active' : 'Inactive';

  const stats = [
    {
      label: 'Confirmed Shifts',
      value: acceptedApps.length.toString(),
      sub: `${upcomingShifts} upcoming · ${completedShifts} done`,
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
    },
    {
      label: 'Pending Apps',
      value: pendingApps.toString(),
      sub: 'Awaiting response',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    },
    {
      label: 'Runner Status',
      value: isRunner,
      sub: isRunner === 'Active' ? 'Available for tasks' : 'Enable in Profile',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
    },
  ];

  if (loading) return <div className="p-10 font-medium text-gray-500">Loading your dashboard...</div>;

  return (
    <div className="text-[#242424]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">Dashboard</h1>
          <p className="text-lg text-gray-700">Welcome back, <span className="text-[#CD7F32] font-semibold uppercase">{profile?.name || 'Talent'}!</span></p>
        </div>
        <Link href="/worker/jobs">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-[#CD7F32] text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-[#CD7F32]/20 w-full md:w-auto justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
            Find Jobs
          </motion.button>
        </Link>
      </div>

      {/* LIVE EVENT ALERT */}
      {liveShifts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-green-50 border border-green-300 rounded-xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse flex-shrink-0"></span>
            <div>
              <p className="font-bold text-green-800">
                {liveShifts.length === 1
                  ? `"${liveShifts[0].staffingRequest.event.title}" is LIVE — You are on duty!`
                  : `${liveShifts.length} events are LIVE — You are on duty!`}
              </p>
              <p className="text-green-600 text-sm">Check for runner tasks and communicate with your team.</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link href="/worker/runners">
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Runner Tasks
              </button>
            </Link>
            <Link href={`/worker/events/${liveShifts[0]?.staffingRequest?.eventId}/chat`}>
              <button className="bg-white border border-green-400 text-green-700 hover:bg-green-50 font-bold text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Event Chat
              </button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 flex flex-col justify-between h-48 border border-gray-100"
            style={{ boxShadow: '-6px 6px 0px rgba(205, 127, 50, 0.9)' }}
          >
            <div>{stat.icon}</div>
            <div>
              <h3 className={`text-4xl font-semibold mb-0.5 ${stat.label === 'Runner Status' && stat.value === 'Active' ? 'text-green-600' : ''}`}>{stat.value}</h3>
              <p className="text-gray-600 font-medium text-sm">{stat.label}</p>
              <p className="text-gray-400 text-xs mt-0.5">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Completed Shifts Card */}
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
            <h3 className="text-3xl font-bold text-gray-500">{completedShifts}</h3>
            <p className="text-gray-500 font-semibold text-sm">Completed Shifts</p>
            <p className="text-gray-400 text-xs">Events you have successfully worked</p>
          </div>
        </div>
        <Link href="/worker/schedule">
          <button className="text-sm font-semibold text-gray-500 hover:text-gray-800 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            View Schedule
          </button>
        </Link>
      </motion.div>

      {/* Recent Applications — exclude completed events */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold font-serif">Recent Applications</h2>
          <Link href="/worker/applications" className="text-sm font-bold text-[#CD7F32] hover:underline">View All</Link>
        </div>

        {applications.filter(app => app.staffingRequest?.event?.status !== 'COMPLETED').length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-100 text-center text-gray-500" style={{ boxShadow: '-6px 6px 0px rgba(205, 127, 50, 0.9)' }}>
            You haven&apos;t applied to any active jobs yet. Browse available jobs to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {applications
              .filter(app => app.staffingRequest?.event?.status !== 'COMPLETED')
              .slice(0, 4)
              .map((app, index) => {
                const eventStatus = app.staffingRequest?.event?.status;
                const isLive = eventStatus === 'ONGOING';
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl p-4 border flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isLive ? 'bg-green-500 animate-pulse' : 'bg-[#CD7F32]'}`}></div>
                      <div>
                        <h4 className="font-bold text-sm">{app.staffingRequest?.roleName}</h4>
                        <p className="text-xs text-gray-500">
                          {app.staffingRequest?.event?.title}
                          {isLive && <span className="ml-2 text-green-600 font-semibold">● LIVE</span>}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                      ${app.status === 'PENDING' ? 'bg-orange-50 text-orange-700' : ''}
                      ${app.status === 'ACCEPTED' ? 'bg-green-50 text-green-700' : ''}
                      ${app.status === 'REJECTED' ? 'bg-red-50 text-red-700' : ''}
                    `}>
                      {app.status}
                    </span>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
