'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, MapPin, Users, Info, ExternalLink, ChevronDown, ChevronUp, User, Briefcase, IndianRupee } from 'lucide-react';
import Link from 'next/link';

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: string;
  createdAt: string;
  manager: {
    name: string;
    email: string;
  };
  staffingRequests: any[];
};

export default function AdminEventsPanel() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedEventId(prev => prev === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-400 font-medium tracking-widest uppercase text-sm">Loading Events</p>
      </div>
    );
  }

  return (
    <div className="min-h-full p-2 md:p-6 text-[var(--foreground)] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500 opacity-[0.04] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-600">
            Platform Events
          </h1>
          <p className="text-base md:text-lg text-gray-400 font-medium">Monitor all events created by managers across the platform.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="bg-[#1a1a1a]/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
        >
          <div className="bg-black/20 border-b border-white/10 p-5 md:p-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <CalendarDays size={16} />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">All Events Directory</h2>
          </div>

          <div className="overflow-x-auto p-0">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-black/40 border-b border-white/5 text-xs uppercase tracking-widest text-gray-400 font-semibold">
                  <th className="p-5 pl-6 w-[30%]">Event Details</th>
                  <th className="p-5 w-[20%]">Location & Date</th>
                  <th className="p-5 w-[20%]">Manager</th>
                  <th className="p-5 w-[15%]">Staffing</th>
                  <th className="p-5 text-center w-[15%]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-16 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                        <CalendarDays size={24} className="text-gray-500" />
                      </div>
                      <p className="text-gray-400 font-medium text-lg">No events have been created yet.</p>
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <React.Fragment key={event.id}>
                      <tr 
                        onClick={() => toggleExpand(event.id)}
                        className={`hover:bg-white/[0.04] transition-all cursor-pointer group ${expandedEventId === event.id ? 'bg-white/[0.02]' : ''}`}
                      >
                        <td className="p-5 pl-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-gray-200 group-hover:text-blue-400 transition-colors text-base mb-1">{event.title}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 max-w-[200px] truncate">
                                <Info size={12} />
                                {event.description || 'No description provided'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                            <MapPin size={14} className="text-blue-400/70" />
                            <span className="truncate max-w-[150px]">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <CalendarDays size={14} className="text-blue-400/70" />
                            {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="font-medium text-gray-300 truncate">{event.manager?.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500 truncate">{event.manager?.email || 'N/A'}</div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                              <Users size={14} />
                            </div>
                            <div>
                              <span className="font-bold text-gray-200">{event.staffingRequests?.length || 0}</span>
                              <span className="text-xs text-gray-500 ml-1 uppercase tracking-wider">Roles</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              event.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                              event.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                              event.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {event.status || 'DRAFT'}
                            </span>
                            <div className="text-gray-500 group-hover:text-white transition-colors">
                              {expandedEventId === event.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Details Row */}
                      <AnimatePresence>
                        {expandedEventId === event.id && (
                          <tr className="bg-black/30">
                            <td colSpan={5} className="p-0 border-b border-white/5">
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-6 md:p-8 space-y-8 border-l-2 border-blue-500 ml-4 my-4 rounded-r-2xl bg-white/[0.02]">
                                  
                                  {/* Event Full Description */}
                                  <div>
                                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                      <Info size={14} /> Full Description
                                    </h4>
                                    <p className="text-sm text-gray-300 bg-black/40 p-4 rounded-xl border border-white/5 leading-relaxed whitespace-pre-wrap">
                                      {event.description || 'No detailed description available.'}
                                    </p>
                                  </div>

                                  {/* Staffing Roles and Applications */}
                                  <div>
                                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                      <Briefcase size={14} /> Roles & Applications
                                    </h4>
                                    
                                    {event.staffingRequests?.length === 0 ? (
                                      <div className="text-sm text-gray-500 italic p-4 bg-black/20 rounded-xl border border-white/5">
                                        No roles have been posted for this event.
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {event.staffingRequests.map((role: any) => (
                                          <div key={role.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                                            {/* Role Header */}
                                            <div className="bg-indigo-500/10 border-b border-white/5 p-4 flex justify-between items-start">
                                              <div>
                                                <h5 className="font-bold text-indigo-300 text-lg mb-1">{role.roleName}</h5>
                                                <p className="text-xs text-indigo-200/70">{role.description || 'No role description'}</p>
                                              </div>
                                              <div className="text-right flex flex-col gap-1 items-end">
                                                <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/10 px-2 py-1 rounded-md text-gray-300">
                                                  <Users size={12} /> {role.spots} Spots
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-md">
                                                  ₹{role.payRate} /hr
                                                </span>
                                              </div>
                                            </div>
                                            
                                            {/* Role Applications */}
                                            <div className="p-0">
                                              {role.applications?.length === 0 ? (
                                                <div className="p-4 text-xs text-center text-gray-500 font-medium">
                                                  No applications received yet.
                                                </div>
                                              ) : (
                                                <ul className="divide-y divide-white/5">
                                                  {role.applications.map((app: any) => (
                                                    <li key={app.id} className="p-4 hover:bg-white/[0.02] transition-colors flex justify-between items-center">
                                                      <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400">
                                                          <User size={14} />
                                                        </div>
                                                        <div>
                                                          <p className="font-medium text-sm text-gray-200">
                                                            {app.workerProfile?.user?.name || 'Unknown Talent'}
                                                          </p>
                                                          <p className="text-[10px] text-gray-500 truncate max-w-[150px]">
                                                            {app.workerProfile?.user?.email || 'No email'}
                                                          </p>
                                                        </div>
                                                      </div>
                                                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                                                        app.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                                        app.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                      }`}>
                                                        {app.status}
                                                      </span>
                                                    </li>
                                                  ))}
                                                </ul>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
