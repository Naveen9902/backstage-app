'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Send, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
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
  
  // Assign to specific worker
  const [assignModal, setAssignModal] = useState<{userId: string, name: string, eventId: string | null, isExternal: boolean} | null>(null);

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
        const liveEvents = data.filter(ev => ev.status === 'ONGOING');
        setEvents(liveEvents);
        if (liveEvents.length > 0) setSelectedEvent(liveEvents[0].id);
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
          runnerId: assignModal.userId
        })
      });
      if (res.ok) {
        fetchDispatches();
        setAssignModal(null);
        setTask('');
      }
    } catch (err) {
      console.error(err);
    }
    setAssigning(false);
  };
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

        {events.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-amber-600 w-5 h-5" />
              <span className="font-bold text-amber-700">No Live Events</span>
            </div>
            <p className="text-amber-600">Runner dispatch is only available for <strong>ongoing events</strong>. Go to <Link href="/manager/my-events" className="underline font-bold">My Events</Link> and toggle an event to <strong>Live</strong> first.</p>
          </div>
        ) : (
          <>
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

            {/* Bottom Section: Dispatches History */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#CD7F32]/10 text-[#CD7F32] flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-serif text-gray-900">Task Dispatches Live Log</h2>
                    <p className="text-sm text-gray-500">Real-time tracking of all venue commands and external errands</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Dispatched:</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded-lg font-bold text-sm">{dispatches.length}</span>
                </div>
              </div>

              {dispatches.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <Clock className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="font-bold text-gray-700 text-lg mb-1">No tasks dispatched yet</h3>
                  <p className="text-sm text-gray-400 max-w-md mx-auto">Assign a task to an internal event worker or dispatch a nearby quick runner above to start tracking live operations.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {dispatches.map((dispatch) => {
                    const isExternal = dispatch.task?.startsWith('[EXTERNAL/ERRAND]');
                    const cleanTask = isExternal ? dispatch.task.replace('[EXTERNAL/ERRAND] ', '') : dispatch.task;
                    
                    return (
                      <motion.div 
                        key={dispatch.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-50/60 hover:bg-white p-5 rounded-2xl border border-gray-200/70 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 truncate max-w-[140px] bg-white px-2 py-1 rounded-md border border-gray-100 shadow-2xs">
                              {dispatch.event?.title || 'General Errand'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {isExternal ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                                  External
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#CD7F32]/10 text-[#CD7F32] border border-[#CD7F32]/20">
                                  Internal
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                dispatch.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                dispatch.status === 'In Progress' ? 'bg-sky-100 text-sky-700 border border-sky-200' :
                                'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}>
                                {dispatch.status || 'Pending'}
                              </span>
                            </div>
                          </div>
                          
                          <p className="font-semibold text-gray-900 text-sm leading-relaxed mb-4 line-clamp-3">
                            {cleanTask || 'No description provided'}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs mt-auto pt-3 border-t border-gray-200/60">
                          <div className="text-gray-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {dispatch.createdAt ? new Date(dispatch.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">Assigned:</span>
                            {dispatch.runner ? (
                              <span className={`font-bold px-2 py-0.5 rounded ${isExternal ? 'bg-blue-50 text-blue-700 font-mono' : 'bg-gray-100 text-gray-900'}`}>
                                {dispatch.runner.name}
                              </span>
                            ) : (
                              <span className="font-bold text-gray-400 italic">Unassigned</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
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
              <h3 className="text-xl font-bold text-gray-900">Assign Task to {assignModal.name}</h3>
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
                  onClick={() => { setAssignModal(null); setTask(''); }}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={assigning} 
                  type="submit" 
                  className="flex-1 bg-[#242424] text-white font-bold py-3 rounded-xl hover:bg-black transition-colors disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Dispatch'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
