'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Send, CheckCircle2, Clock, AlertTriangle, Filter, ChevronRight, Layers, DollarSign, Users, Sparkles, FolderOpen, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RunnersPage() {
  const [urgency, setUrgency] = useState('High');
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [task, setTask] = useState('');
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [hiredStaff, setHiredStaff] = useState<any[]>([]);
  const [nearbyRunners, setNearbyRunners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [price, setPrice] = useState('');
  const [selectedEventView, setSelectedEventView] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'In Progress' | 'Completed' | 'Pending'>('ALL');
  
  // Assign to specific worker
  const [assignModal, setAssignModal] = useState<{userId: string, name: string, eventId: string | null, isExternal: boolean, isBroadcast?: boolean} | null>(null);

  const fetchDispatches = () => {
    fetch('/api/manager/runners').then(res => res.json()).then(data => {
      if (data) {
        setDispatches(data.dispatches || []);
        setHiredStaff(data.hiredStaff || []);
        setNearbyRunners(data.nearbyRunners || []);
      }
    });
  };

  useEffect(() => {
    fetch('/api/manager/events').then(res => res.json()).then(data => {
      if (Array.isArray(data)) {
        const activeEvents = data.filter(ev => ev.status !== 'CANCELLED');
        setEvents(activeEvents);
        const ongoing = activeEvents.filter(ev => ev.status === 'ONGOING');
        if (ongoing.length > 0) setSelectedEvent(ongoing[0].id);
        else if (activeEvents.length > 0) setSelectedEvent(activeEvents[0].id);
      }
    });
    
    fetchDispatches();
    
    // Supabase Realtime instead of polling
    const channel = supabase.channel('manager_runner_dispatches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'RunnerDispatch' },
        () => {
          fetchDispatches(); // Instantly refresh data when any dispatch changes
        }
      )
      .subscribe();

    // Fallback: poll every 5 seconds just in case Realtime isn't enabled on the table
    const pollInterval = setInterval(() => {
      fetchDispatches();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, []);

  const handleDirectAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModal || !task) return;
    setAssigning(true);
    try {
      const res = await fetch('/api/manager/runners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: assignModal.eventId || selectedEvent,
          task: assignModal.isExternal ? `[EXTERNAL/ERRAND] ${task}` : task,
          urgency,
          price: assignModal.isExternal && price ? price : null,
          runnerId: assignModal.userId
        })
      });
      if (res.ok) {
        fetchDispatches();
        setAssignModal(null);
        setTask('');
        setPrice('');
      }
    } catch (err) {
      console.error(err);
    }
    setAssigning(false);
  };

  const handleSendPayment = async (dispatchId: string) => {
    try {
      const res = await fetch('/api/manager/runners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatchId, action: 'pay' })
      });
      if (res.ok) {
        fetchDispatches();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to send payment confirmation');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while sending payment confirmation');
    }
  };

  // Group dispatches by Event vs External Errands
  const eventGroups = dispatches.reduce((acc: Record<string, any[]>, dispatch: any) => {
    const isExternal = dispatch.task?.startsWith('[EXTERNAL/ERRAND]') || dispatch.price !== null;
    const groupKey = isExternal ? '⚡ External Rapido Errands' : (dispatch.event?.title || 'General Venue Operations');
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(dispatch);
    return acc;
  }, {});

  // Ensure active events without dispatches also appear as folders
  events.forEach((ev: any) => {
    const key = ev.title || 'General Venue Operations';
    if (!eventGroups[key]) eventGroups[key] = [];
  });

  const currentEventDispatches = selectedEventView ? (eventGroups[selectedEventView] || []) : [];
  const filteredDispatches = currentEventDispatches.filter((d: any) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'Pending') return !d.status || d.status === 'Pending' || d.status === 'Assigned';
    return d.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="mb-10 relative overflow-hidden bg-[#242424] rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-[#242424]/10">
          {/* Radar Animation Background */}
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 opacity-30 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <div className="absolute inset-0 rounded-full border-2 border-[#CD7F32] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute inset-4 rounded-full border-2 border-[#CD7F32] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-8 rounded-full border-2 border-[#CD7F32] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-[#CD7F32] rounded-full shadow-[0_0_20px_#CD7F32] transform -translate-x-1/2 -translate-y-1/2"></div>
            {/* Sweeping radar line */}
            <div className="absolute top-1/2 left-1/2 w-1 h-1/2 bg-gradient-to-t from-[#CD7F32] to-transparent origin-bottom transform -translate-x-1/2 -translate-y-full animate-[spin_4s_linear_infinite]"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Operations
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-3">Runner Dispatch Center</h1>
            <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
              Assign high-priority tasks directly to your hired staff during live events. Real-time coordination, amplified.
            </p>
          </div>
        </div>

        {/* Top Bar: Quick Rapido Broadcast Errand */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-400/30">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 text-2xl shadow-inner">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2 font-extrabold text-base font-serif">
                <span className="bg-white text-blue-600 text-xs px-2.5 py-0.5 rounded-lg uppercase font-mono font-extrabold shadow-sm">Rapido Mode</span>
                <span className="text-xl">Open Broadcast Errand (Swiggy / Rapido Style)</span>
              </div>
              <p className="text-sm text-blue-100 mt-1 max-w-2xl leading-relaxed">
                Need quick on-ground help or supplies? Broadcast an open errand with a fixed price to all nearby workers simultaneously. First worker to grab it claims the job automatically!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setAssignModal({ userId: null, name: 'All Nearby Workers (Rapido Broadcast)', eventId: selectedEvent || (events[0]?.id) || null, isExternal: true, isBroadcast: true });
              setTask('');
              setPrice('');
            }}
            className="bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-lg shrink-0 transition-all hover:scale-105 active:scale-95 whitespace-nowrap flex items-center gap-2 border border-blue-100"
          >
            <span className="text-lg">⚡</span>
            <span>Post Open Errand (₹)</span>
          </button>
        </div>

        {events.length === 0 && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-sm text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span><strong>Note:</strong> You have no events yet. Rapido Open Broadcast errands will automatically create a general operations event for you!</span>
          </div>
        )}

        {/* Top Two-Halves Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            
              {/* Left Half: Hired Internal Staff */}
              <div className="bg-gradient-to-b from-white to-gray-50/50 p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-lg shadow-gray-200/50 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#CD7F32]/10 rounded-bl-full pointer-events-none blur-xl"></div>
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#242424] text-[#CD7F32] flex items-center justify-center shadow-md">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold font-serif text-gray-900">Hired Event Runners</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Internal Venue Crew &bull; Live Tasks</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
                      {hiredStaff.length} On Duty
                    </span>
                  </div>

                  {hiredStaff.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur p-12 rounded-2xl border border-dashed border-gray-200 text-center my-6">
                      <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No internal runners assigned to ongoing events.</p>
                      <p className="text-xs text-gray-400 mt-1">Hire staff in the Staffing tab first.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 my-2 max-h-[450px] overflow-y-auto pr-1">
                      {hiredStaff.map((staff, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group bg-white p-4 rounded-2xl border border-gray-100/80 hover:border-[#CD7F32]/40 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 text-white font-bold flex items-center justify-center text-sm shadow-inner">
                              {staff.name ? staff.name.charAt(0).toUpperCase() : 'R'}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-[#CD7F32] transition-colors flex items-center gap-2">
                                {staff.name}
                                <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-md">Internal</span>
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {staff.roleName} &bull; <span className="text-gray-400 truncate max-w-[140px]">{staff.eventName}</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setAssignModal({ userId: staff.userId, name: staff.name, eventId: staff.eventId, isExternal: false })}
                            className="bg-[#242424] hover:bg-[#CD7F32] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-1.5 group/btn"
                          >
                            <span>Assign</span>
                            <Send className="w-3.5 h-3.5 transform group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>Venue operations &bull; Equipment &bull; VIP Escorts</span>
                  <span className="font-mono">INTERNAL DISPATCH</span>
                </div>
              </div>

              {/* Right Half: Nearby External Runners */}
              <div className="bg-gradient-to-b from-white to-blue-50/30 p-6 md:p-8 rounded-3xl border border-blue-100 shadow-lg shadow-blue-500/5 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full pointer-events-none blur-xl"></div>
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold font-serif text-gray-900">Nearby Quick Runners</h2>
                        <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold">External Errands &bull; Swiggy / Rapido Style</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      {nearbyRunners.length} Nearby
                    </span>
                  </div>

                  {/* Rapido Open Broadcast Mode Banner */}
                  <div className="mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-400/30">
                    <div>
                      <div className="flex items-center gap-1.5 font-extrabold text-sm font-serif">
                        <span className="bg-white text-blue-600 text-[10px] px-2 py-0.5 rounded-md uppercase font-mono font-bold">Rapido Mode</span>
                        <span>⚡ Broadcast Open Errand</span>
                      </div>
                      <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                        Post an open task with price to all nearby workers. First runner to select it claims the job automatically!
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAssignModal({ userId: null, name: 'All Nearby Runners (Rapido Broadcast)', eventId: selectedEvent || null, isExternal: true, isBroadcast: true });
                        setTask('');
                        setPrice('');
                      }}
                      className="bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm shrink-0 transition-transform active:scale-95 whitespace-nowrap flex items-center gap-1.5"
                    >
                      <span>⚡ Post Open Task</span>
                    </button>
                  </div>

                  {nearbyRunners.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur p-12 rounded-2xl border border-dashed border-blue-200 text-center my-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-blue-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                      <p className="text-gray-500 font-medium">No active nearby runners detected right now.</p>
                      <p className="text-xs text-gray-400 mt-1">Runners will appear when active in your vicinity.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 my-2 max-h-[450px] overflow-y-auto pr-1">
                      {nearbyRunners.map((runner, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-blue-300 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-inner">
                              {runner.name ? runner.name.charAt(0).toUpperCase() : 'Q'}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                {runner.name}
                                <span className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span> Live
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1 font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                  {runner.distance}
                                </span>
                                <span className="text-gray-400">&bull;</span>
                                <span className="truncate max-w-[120px] text-gray-500">{runner.skills || 'Quick Delivery & Errands'}</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setAssignModal({ userId: runner.userId, name: runner.name, eventId: null, isExternal: true })}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-md flex items-center gap-1.5 group/btn"
                          >
                            <span>Dispatch</span>
                            <Send className="w-3.5 h-3.5 transform group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-blue-100/60 flex items-center justify-between text-xs text-blue-400">
                  <span>External pickups &bull; Deliveries &bull; Emergency Supplies</span>
                  <span className="font-mono font-bold text-blue-500">RAPID SERVICE</span>
                </div>
              </div>

            </div>

            {/* Bottom Section: Event Dispatch Centers Grid OR Dedicated Event View */}
            <div className="mt-10">
              {!selectedEventView ? (
                /* VIEW 1: EVENT FOLDERS / CARDS GRID */
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#CD7F32]/10 text-[#CD7F32] rounded-full text-xs font-bold uppercase tracking-widest mb-2 border border-[#CD7F32]/30 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-[#CD7F32]" style={{ animationDuration: '6s' }} />
                        <span>Interactive Dispatch Boards</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-serif tracking-tight flex items-center gap-2.5">
                        <span>Event Dispatch Centers</span>
                        <span className="text-xs bg-[#242424] text-[#CD7F32] px-3 py-1 rounded-full font-mono font-bold uppercase tracking-widest shadow-sm border border-[#CD7F32]/30">
                          {Object.keys(eventGroups).length} Active Boards
                        </span>
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">Select an event or external errand board below to coordinate staff and confirm payouts.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Tasks:</span>
                        <span className="text-base font-extrabold text-gray-900 font-mono">{dispatches.length}</span>
                      </div>
                      <button 
                        onClick={fetchDispatches}
                        className="bg-white hover:bg-gray-50 text-gray-700 hover:text-[#CD7F32] text-xs font-bold px-4 py-2.5 rounded-2xl border border-gray-200 shadow-sm transition-all flex items-center gap-1.5 hover:border-[#CD7F32]/50 hover:shadow-md"
                      >
                        <svg className="w-3.5 h-3.5 text-[#CD7F32]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v-5"/></svg>
                        <span>Refresh Data</span>
                      </button>
                    </div>
                  </div>

                  {Object.keys(eventGroups).length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm p-8">
                      <div className="w-16 h-16 rounded-3xl bg-[#CD7F32]/10 text-[#CD7F32] flex items-center justify-center mx-auto mb-4 border border-[#CD7F32]/20 shadow-inner">
                        <FolderOpen className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 font-serif">No Event Dispatch Boards Found</h3>
                      <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">Create an event or dispatch your first errand from the form above to activate your interactive coordination boards!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.entries(eventGroups).map(([groupName, groupDispatches]) => {
                        const isExternalGroup = groupName.includes('External') || groupName.includes('Rapido');
                        const totalTasks = groupDispatches.length;
                        const completedTasks = groupDispatches.filter((d: any) => d.status === 'Completed').length;
                        const inProgressTasks = groupDispatches.filter((d: any) => d.status === 'In Progress').length;
                        const pendingTasksCount = totalTasks - completedTasks - inProgressTasks;
                        const totalPayout = groupDispatches.reduce((sum: number, d: any) => sum + (d.price ? Number(d.price) : 0), 0);

                        return (
                          <motion.div
                            key={groupName}
                            whileHover={{ scale: 1.025, y: -6 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            onClick={() => { setSelectedEventView(groupName); setFilterStatus('ALL'); }}
                            className={`group relative overflow-hidden rounded-3xl p-6.5 cursor-pointer transition-all duration-300 flex flex-col justify-between border-2 shadow-lg ${
                              isExternalGroup 
                                ? 'bg-gradient-to-br from-blue-900/95 via-indigo-900 to-[#242424] text-white border-blue-500/40 hover:border-blue-400 hover:shadow-[0_20px_40px_rgba(59,130,246,0.25)]' 
                                : 'bg-gradient-to-br from-[#242424] via-[#2a2a2a] to-[#1f1f1f] text-white border-gray-800 hover:border-[#CD7F32] hover:shadow-[0_20px_40px_rgba(205,127,50,0.25)]'
                            }`}
                          >
                            <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 ${
                              isExternalGroup ? 'bg-blue-500/20 group-hover:bg-blue-400/30' : 'bg-[#CD7F32]/15 group-hover:bg-[#CD7F32]/30'
                            }`} />

                            <div>
                              <div className="flex items-start justify-between gap-3 mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
                                  isExternalGroup 
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/30 text-2xl' 
                                    : 'bg-[#CD7F32]/20 text-[#CD7F32] border-[#CD7F32]/30'
                                }`}>
                                  {isExternalGroup ? '⚡' : <FolderOpen className="w-6 h-6" />}
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border font-mono shadow-2xs ${
                                  totalTasks > 0 
                                    ? isExternalGroup ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : 'bg-gray-700/50 text-gray-400 border-gray-600/50'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${totalTasks > 0 ? (isExternalGroup ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400 animate-pulse') : 'bg-gray-500'}`} />
                                  {totalTasks > 0 ? 'Active Board' : 'Standby'}
                                </span>
                              </div>

                              <h3 className={`text-xl font-bold font-serif tracking-tight leading-snug mb-2 transition-colors ${
                                isExternalGroup ? 'group-hover:text-blue-300' : 'group-hover:text-[#CD7F32]'
                              }`}>
                                {groupName}
                              </h3>

                              <p className="text-xs text-gray-300 line-clamp-2 mb-6 leading-relaxed">
                                {isExternalGroup 
                                  ? 'Open broadcasts & third-party runner tasks dispatched on fixed payouts.' 
                                  : 'Internal venue crew coordination, VIP requests, and on-ground stage dispatches.'}
                              </p>
                            </div>

                            <div>
                              <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-black/40 rounded-2xl border border-white/10 mb-5 font-mono">
                                <div className="text-center">
                                  <div className="text-[10px] text-gray-400 uppercase font-sans">Active</div>
                                  <div className="text-sm font-extrabold text-sky-400 mt-0.5">{inProgressTasks}</div>
                                </div>
                                <div className="text-center border-x border-white/10">
                                  <div className="text-[10px] text-gray-400 uppercase font-sans">Done</div>
                                  <div className="text-sm font-extrabold text-emerald-400 mt-0.5">{completedTasks}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[10px] text-gray-400 uppercase font-sans">Pending</div>
                                  <div className="text-sm font-extrabold text-amber-400 mt-0.5">{pendingTasksCount}</div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                {totalPayout > 0 ? (
                                  <div className="flex items-center gap-1 text-emerald-400 font-mono font-bold text-xs bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    <span>₹{totalPayout} Payouts</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400 font-medium">
                                    {totalTasks} {totalTasks === 1 ? 'Dispatch Task' : 'Total Dispatches'}
                                  </span>
                                )}

                                <div className={`inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider py-1.5 px-3 rounded-xl transition-all ${
                                  isExternalGroup 
                                    ? 'bg-blue-600 text-white group-hover:bg-blue-500 shadow-md' 
                                    : 'bg-[#CD7F32] text-white group-hover:bg-[#df8a3c] shadow-md shadow-[#CD7F32]/20'
                                }`}>
                                  <span>Open Board</span>
                                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* VIEW 2: DEDICATED EVENT DISPATCHES DETAIL BOARD */
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl border border-gray-200/80 relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 mb-8 border-b border-gray-200">
                    <div>
                      <button
                        onClick={() => { setSelectedEventView(null); setFilterStatus('ALL'); }}
                        className="inline-flex items-center gap-2 bg-[#242424] hover:bg-[#CD7F32] text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-sm mb-4 group/back"
                      >
                        <ArrowLeft className="w-4 h-4 transform group-hover/back:-translate-x-1 transition-transform" />
                        <span>Back to All Events Grid</span>
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#CD7F32]/10 text-[#CD7F32] flex items-center justify-center border border-[#CD7F32]/20 text-2xl shadow-inner shrink-0">
                          {selectedEventView.includes('External') ? '⚡' : '🎪'}
                        </div>
                        <div>
                          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-serif tracking-tight">
                            {selectedEventView}
                          </h2>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-0.5">
                            Live Dispatch Board &bull; Real-time Operations &bull; Payout Management
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl border border-gray-200/80 flex-wrap">
                      {(['ALL', 'In Progress', 'Completed', 'Pending'] as const).map(status => {
                        const count = (eventGroups[selectedEventView] || []).filter((d: any) => {
                          if (status === 'ALL') return true;
                          if (status === 'Pending') return !d.status || d.status === 'Pending' || d.status === 'Assigned';
                          return d.status === status;
                        }).length;

                        const isActive = filterStatus === status;

                        return (
                          <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                              isActive 
                                ? 'bg-[#242424] text-white shadow-md' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                            }`}
                          >
                            <span>{status === 'ALL' ? 'All Tasks' : status}</span>
                            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                              isActive ? 'bg-[#CD7F32] text-white' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {filteredDispatches.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50/70 rounded-3xl border border-dashed border-gray-200 p-8">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3 text-gray-400 shadow-sm border border-gray-200">
                        <Filter className="w-6 h-6 text-gray-400" />
                      </div>
                      <h4 className="text-base font-bold text-gray-900">No Tasks Match "{filterStatus}"</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        There are currently no task dispatches matching this status filter in this board. Try selecting "All Tasks" or dispatching a new task above!
                      </p>
                      {filterStatus !== 'ALL' && (
                        <button
                          onClick={() => setFilterStatus('ALL')}
                          className="mt-4 bg-[#CD7F32] hover:bg-[#b86f2b] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
                        >
                          Show All Tasks
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {filteredDispatches.map((dispatch: any) => {
                        const isExternal = dispatch.task?.startsWith('[EXTERNAL/ERRAND]') || dispatch.price !== null;
                        const cleanTask = dispatch.task?.replace('[EXTERNAL/ERRAND] ', '');

                        return (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -3, scale: 1.01 }}
                            key={dispatch.id} 
                            className={`p-5 rounded-3xl border-2 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-lg ${
                              dispatch.status === 'Completed' ? 'bg-emerald-50/20 border-emerald-200 hover:border-emerald-300' : 
                              dispatch.status === 'In Progress' ? 'bg-sky-50/20 border-sky-200 hover:border-sky-300' : 
                              'bg-white border-gray-200 hover:border-[#CD7F32]/50'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {isExternal ? (
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs font-mono">
                                      ⚡ External Errand
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-[#CD7F32]/10 text-[#CD7F32] border border-[#CD7F32]/25 shadow-2xs font-mono">
                                      🎪 Internal Venue Task
                                    </span>
                                  )}
                                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider shadow-2xs font-mono ${
                                    dispatch.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                    dispatch.status === 'In Progress' ? 'bg-sky-100 text-sky-800 border border-sky-300' :
                                    'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}>
                                    {dispatch.status || 'Pending / Assigned'}
                                  </span>
                                  {dispatch.price !== null && dispatch.price !== undefined && (
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-2xs font-mono flex items-center gap-0.5">
                                      <span>₹{dispatch.price}</span>
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 shrink-0" title={`Urgency: ${dispatch.urgency}`}>
                                  <span className={`w-2 h-2 rounded-full ${
                                    dispatch.urgency === 'Critical' ? 'bg-red-500 animate-ping' :
                                    dispatch.urgency === 'High' ? 'bg-orange-500' : 'bg-gray-400'
                                  }`}></span>
                                  <span className="text-[10px] font-extrabold uppercase text-gray-700 font-mono">{dispatch.urgency || 'Normal'}</span>
                                </div>
                              </div>
                              
                              <p className="font-bold text-gray-900 text-base leading-relaxed mb-6 font-serif">
                                {cleanTask || 'No description provided'}
                              </p>
                            </div>
                            
                            <div>
                              <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100 bg-gray-50/60 -mx-5 px-5 py-2.5 rounded-xl">
                                <div className="text-gray-500 flex items-center gap-1 font-mono text-[11px]">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  <span>{dispatch.createdAt ? new Date(dispatch.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-gray-400 font-medium text-[11px]">Runner:</span>
                                  {dispatch.runner ? (
                                    <span className={`font-extrabold px-2.5 py-0.5 rounded-md text-xs shadow-2xs ${isExternal ? 'bg-blue-600 text-white font-mono' : 'bg-[#242424] text-[#CD7F32]'}`}>
                                      {dispatch.runner.name}
                                    </span>
                                  ) : (
                                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] animate-pulse">
                                      Awaiting Grab...
                                    </span>
                                  )}
                                </div>
                              </div>

                              {dispatch.status === 'Completed' && dispatch.price !== null && dispatch.price !== undefined && (
                                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 bg-gray-50/80 -mx-5 -mb-5 p-4 rounded-b-3xl">
                                  {dispatch.paymentStatus === 'CONFIRMED' ? (
                                    <span className="text-xs font-bold text-emerald-700 flex items-center justify-center w-full gap-1.5 bg-emerald-100/90 py-2.5 px-3 rounded-2xl border border-emerald-300 shadow-2xs font-mono">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                      <span>Payment Confirmed by Runner (₹{dispatch.price})</span>
                                    </span>
                                  ) : dispatch.paymentStatus === 'SENT' ? (
                                    <span className="text-xs font-bold text-blue-700 flex items-center justify-center w-full gap-1.5 bg-blue-100/90 py-2.5 px-3 rounded-2xl border border-blue-300 shadow-2xs font-mono">
                                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                      <span>Payment Done (₹{dispatch.price})</span>
                                    </span>
                                  ) : (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleSendPayment(dispatch.id); }}
                                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold py-2.5 px-4 rounded-2xl text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 active:scale-95"
                                    >
                                      <DollarSign className="w-4 h-4" />
                                      <span>Confirm Payment Sent (₹{dispatch.price})</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
        </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {assignModal.isBroadcast && <span className="text-blue-600">⚡</span>}
                <span>{assignModal.isBroadcast ? 'Broadcast Open Errand (Rapido Mode)' : `Assign Task to ${assignModal.name}`}</span>
              </h3>
              {assignModal.isBroadcast && (
                <p className="text-xs text-blue-600 mt-1 font-medium">This errand will pop up for all nearby workers. The first runner to accept it claims it automatically!</p>
              )}
            </div>
            
            <form onSubmit={handleDirectAssign} className="p-6 space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Task Description</label>
                <textarea 
                  required 
                  rows={3} 
                  value={task} 
                  onChange={e=>setTask(e.target.value)} 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:border-[#CD7F32] outline-none shadow-inner text-gray-900" 
                  placeholder="e.g. Need more ice at the main stage VIP bar immediately."
                ></textarea>
              </div>
              {assignModal.isExternal && (
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 flex items-center justify-between">
                    <span>Task Payout Price (₹ / $)</span>
                    <span className="text-[10px] font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono font-bold">External Errand Fee</span>
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                    <input 
                      type="number" 
                      min="0"
                      step="any"
                      value={price} 
                      onChange={e=>setPrice(e.target.value)} 
                      className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 focus:border-blue-600 outline-none shadow-inner text-gray-900 font-bold font-mono" 
                      placeholder="e.g. 250"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Set the payout amount for buying/hiring this runner for the task.</p>
                </div>
              )}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Urgency</label>
                <div className="flex gap-2 flex-wrap">
                  {['Low', 'Medium', 'High', 'Critical'].map(level => (
                    <button 
                      key={level} 
                      type="button" 
                      onClick={() => setUrgency(level)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${urgency === level ? 'bg-[#CD7F32] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setAssignModal(null); setTask(''); setPrice(''); }}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={assigning} 
                  type="submit" 
                  className={`flex-1 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 text-white shadow-md ${
                    assignModal.isBroadcast ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : 'bg-[#242424] hover:bg-black'
                  }`}
                >
                  {assigning ? 'Dispatching...' : assignModal.isBroadcast ? '⚡ Broadcast to All Nearby' : 'Dispatch'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
