'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertTriangle, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SwipeToToggleRunner from '@/components/SwipeToToggleRunner';

const SwipeToComplete = ({ onComplete, loading }: { onComplete: () => void, loading: boolean }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  
  return (
    <div className="relative w-56 h-12 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border border-gray-200 shadow-inner group">
      <span className="text-xs font-bold text-gray-400 select-none pointer-events-none tracking-widest z-0">
        {loading ? 'COMPLETING...' : isCompleted ? 'DONE' : 'SWIPE TO COMPLETE'}
      </span>
      {!isCompleted && !loading && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 176 }}
          dragElastic={0.05}
          dragSnapToOrigin
          onDragEnd={(e, info) => {
            if (info.offset.x > 120) {
              if (typeof window !== 'undefined') {
                import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
                  Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
                }).catch(() => {});
              }
              setIsCompleted(true);
              onComplete();
            }
          }}
          whileTap={{ scale: 0.95 }}
          className="absolute left-0 top-0 w-12 h-12 bg-gradient-to-br from-[#242424] to-black rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10 border-2 border-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </motion.div>
      )}
      <div className={`absolute top-0 left-0 h-full bg-green-500 transition-all duration-500 ease-out z-10 ${isCompleted ? 'w-full' : 'w-0'}`}></div>
      {isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold z-20">
          <CheckCircle2 className="w-5 h-5 mr-2" /> DONE
        </div>
      )}
    </div>
  );
};

const SwipeToTake = ({ onTake, loading, price }: { onTake: () => void, loading: boolean, price?: number | null }) => {
  const [isTaken, setIsTaken] = useState(false);
  
  return (
    <div className="relative w-full sm:w-64 h-12 bg-blue-50/80 rounded-full overflow-hidden flex items-center justify-center border-2 border-blue-400 shadow-inner group">
      <span className="text-xs font-extrabold text-blue-700 select-none pointer-events-none tracking-widest z-0 font-mono">
        {loading ? 'GRABBING TASK...' : isTaken ? 'CLAIMED! ⚡' : `SWIPE TO TAKE ${price ? '(₹'+price+')' : 'TASK'}`}
      </span>
      {!isTaken && !loading && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 208 }}
          dragElastic={0.05}
          dragSnapToOrigin
          onDragEnd={(e, info) => {
            if (info.offset.x > 140) {
              if (typeof window !== 'undefined') {
                import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
                  Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
                }).catch(() => {});
              }
              setIsTaken(true);
              onTake();
            }
          }}
          whileTap={{ scale: 0.95 }}
          className="absolute left-0 top-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10 border-2 border-yellow-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="yellow" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </motion.div>
      )}
      <div className={`absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500 ease-out z-10 ${isTaken ? 'w-full' : 'w-0'}`}></div>
      {isTaken && (
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold z-20">
          ⚡ TAKEN!
        </div>
      )}
    </div>
  );
};

const triggerTopUpNotification = (title: string, body: string) => {
  if (typeof window === 'undefined') return;
  
  import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
    Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
  }).catch(() => {});

  import('@capacitor/local-notifications').then(({ LocalNotifications }) => {
    LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Math.floor(Math.random() * 100000),
          schedule: { at: new Date(Date.now() + 100) },
          sound: undefined,
          attachments: [],
          actionTypeId: '',
          extra: null
        }
      ]
    }).catch(() => {});
  }).catch(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/logo.jpg' });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') new Notification(title, { body, icon: '/logo.jpg' });
      });
    }
  });
};

export default function WorkerDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [platformLiveEvents, setPlatformLiveEvents] = useState<any[]>([]);
  const [tasksData, setTasksData] = useState<{ pending: any[]; myTasks: any[] }>({ pending: [], myTasks: [] });
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [isRunnerAvailable, setIsRunnerAvailable] = useState(false);
  const [togglingRunner, setTogglingRunner] = useState(false);

  const fetchData = async () => {
    try {
      const [profRes, appsRes, liveRes, runnersRes] = await Promise.all([
        fetch('/api/worker/profile', { cache: 'no-store' }),
        fetch('/api/worker/applications', { cache: 'no-store' }),
        fetch('/api/events/live', { cache: 'no-store' }),
        fetch('/api/worker/runners', { cache: 'no-store' })
      ]);
      const profData = await profRes.json();
      const appsData = await appsRes.json();
      const liveData = await liveRes.json();
      const runnersData = await runnersRes.json();
      
      if (profData && !profData.error) setProfile(profData);
      if (Array.isArray(appsData)) setApplications(appsData);
      if (Array.isArray(liveData)) setPlatformLiveEvents(liveData);
      if (runnersData && !runnersData.error) {
        setTasksData({
          pending: runnersData.pending || [],
          myTasks: runnersData.myTasks || []
        });
        if (typeof runnersData.isRunnerAvailable === 'boolean') {
          setIsRunnerAvailable(runnersData.isRunnerAvailable);
        }
      }
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRunner = async (newVal: boolean) => {
    setTogglingRunner(true);
    try {
      const res = await fetch('/api/worker/runners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRunnerAvailable: newVal })
      });
      if (res.ok) {
        const data = await res.json();
        setIsRunnerAvailable(data.isRunnerAvailable);
        fetchData();
      } else {
        alert('Failed to update runner state');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingRunner(false);
    }
  };

  const handleAccept = async (dispatchId: string) => {
    setLoadingAction(dispatchId);
    try {
      const res = await fetch('/api/worker/runners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatchId, action: 'accept' })
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to claim task (someone else might have grabbed it)');
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingAction(null);
  };

  const handleComplete = async (dispatchId: string) => {
    setLoadingAction(dispatchId);
    try {
      const res = await fetch('/api/worker/runners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatchId, action: 'complete' })
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to complete task');
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingAction(null);
  };

  const handleConfirmPayment = async (dispatchId: string) => {
    setLoadingAction(dispatchId);
    try {
      const res = await fetch('/api/worker/runners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatchId, action: 'confirm_payment' })
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to confirm payment');
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingAction(null);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s

    const channel = supabase.channel('worker_dashboard_dispatches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'RunnerDispatch' },
        (payload) => {
          if (payload && payload.eventType === 'INSERT') {
            triggerTopUpNotification(
              '⚡ New Errand Dispatch!',
              'A new runner task is available near you! Swipe to claim now before someone else grabs it.'
            );
          }
          fetchData();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const acceptedApps = applications.filter(app => app.status === 'ACCEPTED');
  const pendingApps = applications.filter(app => app.status === 'PENDING').length;
  const liveShifts = acceptedApps.filter(app => app.staffingRequest?.event?.status === 'ONGOING');
  const completedShifts = acceptedApps.filter(app => app.staffingRequest?.event?.status === 'COMPLETED').length;
  const upcomingShifts = acceptedApps.filter(app => !app.staffingRequest?.event?.status || app.staffingRequest?.event?.status === 'UPCOMING').length;
  const rating = profile?.workerProfile?.rating || 0;

  const activeMyTasks = tasksData.myTasks.filter(t => t.status !== 'Completed');
  const completedMyTasks = tasksData.myTasks.filter(t => t.status === 'Completed');

  const stats = [
    {
      label: 'Live Events',
      value: liveShifts.length.toString(),
      sub: liveShifts.length > 0 ? 'You are on duty!' : 'No active shifts currently',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4Z"/></svg>
    },
    {
      label: 'Upcoming Events',
      value: upcomingShifts.toString(),
      sub: 'Confirmed future shifts',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
    },
    {
      label: 'Applications',
      value: applications.length.toString(),
      sub: `${pendingApps} pending · ${acceptedApps.length} accepted`,
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    },
    {
      label: 'Talent Rating',
      value: rating > 0 ? rating.toFixed(1) : 'New',
      sub: rating > 0 ? 'Based on past performance' : 'Complete shifts to get rated',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    },
  ];

  if (loading) return <div className="p-10 font-medium text-gray-500">Loading your dashboard...</div>;

  return (
    <div className="text-[#242424]">
      {/* Header with Runner Toggle */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-10 gap-6 bg-[#1a1a1a] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight mb-2 text-white">Talent Dashboard</h1>
          <p className="text-base sm:text-lg text-gray-300">Welcome back, <span className="text-[#CD7F32] font-semibold uppercase">{profile?.name || 'Talent'}!</span></p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          <SwipeToToggleRunner
            isRunnerAvailable={isRunnerAvailable}
            onToggle={handleToggleRunner}
            loading={togglingRunner}
          />
          <Link href="/worker/jobs" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 bg-[#CD7F32] hover:bg-amber-600 text-white px-6 py-3.5 rounded-full font-bold shadow-lg shadow-[#CD7F32]/20 w-full whitespace-nowrap h-14"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
              Find Jobs
            </motion.button>
          </Link>
        </div>
      </div>

      {/* ACTIVE TASKS & ERRANDS POP-UP AT TOP OF DASHBOARD */}
      {(activeMyTasks.length > 0 || tasksData.pending.length > 0) && (
        <div className="mb-10 space-y-6">
          {/* Active Tasks Assigned to Me */}
          {activeMyTasks.length > 0 && (
            <div className="bg-gradient-to-r from-[#242424] to-gray-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl border border-yellow-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 animate-ping"></span>
                  <h2 className="text-xl md:text-2xl font-extrabold font-serif tracking-tight text-white flex items-center gap-2">
                    🎯 My Active Ground Tasks ({activeMyTasks.length})
                  </h2>
                </div>
                <Link href="/worker/runners">
                  <span className="text-xs font-bold text-yellow-400 hover:underline flex items-center gap-1 font-mono">
                    Open Full Board →
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeMyTasks.map((task) => {
                  const isExternalErrand = (task.price !== null && task.price !== undefined) || (task.task && task.task.startsWith('[EXTERNAL/ERRAND]'));
                  const cleanTask = task.task ? task.task.replace('[EXTERNAL/ERRAND] ', '') : '';

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-white text-gray-900 rounded-2xl p-5 shadow-lg border-2 flex flex-col justify-between ${
                        isExternalErrand ? 'border-blue-500 shadow-blue-500/10' : 'border-[#CD7F32]'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                            isExternalErrand ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isExternalErrand ? '⚡ External Errand' : task.event?.title || 'Event Task'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {task.price !== null && task.price !== undefined && (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-md text-xs font-extrabold font-mono shadow-2xs">
                                ₹{task.price}
                              </span>
                            )}
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-base font-extrabold text-gray-900 mb-3 leading-snug whitespace-pre-wrap">{cleanTask}</h3>
                      </div>

                      <div className="pt-4 border-t border-gray-100 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>

                        {task.status !== 'Completed' ? (
                          <SwipeToComplete
                            onComplete={() => handleComplete(task.id)}
                            loading={loadingAction === task.id}
                          />
                        ) : task.price !== null && task.price !== undefined ? (
                          <div className="w-full sm:w-auto">
                            {task.paymentStatus === 'CONFIRMED' ? (
                              <span className="inline-flex items-center justify-center w-full gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-xl text-xs font-bold font-mono shadow-2xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Confirmed (₹{task.price})
                              </span>
                            ) : task.paymentStatus === 'SENT' ? (
                              <button
                                onClick={() => handleConfirmPayment(task.id)}
                                disabled={loadingAction === task.id}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 animate-pulse disabled:opacity-50 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{loadingAction === task.id ? 'Confirming...' : `Confirm Received (₹${task.price})`}</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center justify-center w-full gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
                                <Clock className="w-3.5 h-3.5" />
                                Awaiting Payment
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600">✅ Completed</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Open Broadcast Errands */}
          {tasksData.pending.length > 0 && (
            <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-[#1a1a2e] rounded-3xl p-6 md:p-8 text-white shadow-2xl border-2 border-yellow-400/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 animate-ping"></span>
                  <div>
                    <h2 className="text-xl md:text-2xl font-extrabold font-serif tracking-tight text-yellow-300 flex items-center gap-2">
                      ⚡ Open Errand Broadcasts ({tasksData.pending.length})
                    </h2>
                    <p className="text-xs text-blue-200 mt-0.5">First runner to swipe & claim takes the payout!</p>
                  </div>
                </div>
                <Link href="/worker/runners">
                  <span className="text-xs font-bold text-blue-300 hover:underline font-mono">
                    View All Open →
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasksData.pending.map((task) => {
                  const isExternalErrand = (task.price !== null && task.price !== undefined) || (task.task && task.task.startsWith('[EXTERNAL/ERRAND]'));
                  const cleanTask = task.task ? task.task.replace('[EXTERNAL/ERRAND] ', '') : '';

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/95 backdrop-blur-md text-gray-900 rounded-2xl p-5 shadow-xl border-2 border-yellow-400 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-yellow-300 text-yellow-950 font-mono shadow-2xs">
                            ⚡ OPEN BROADCAST
                          </span>
                          {task.price !== null && task.price !== undefined && (
                            <span className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-extrabold font-mono shadow-sm">
                              ₹{task.price} PAYOUT
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-900 mb-2 leading-snug whitespace-pre-wrap">{cleanTask}</h3>
                        <p className="text-xs text-gray-500 font-medium">{task.event?.title || 'General Venue & External Errands'}</p>
                      </div>

                      <div className="pt-4 border-t border-gray-200 mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>

                        <SwipeToTake
                          onTake={() => handleAccept(task.id)}
                          loading={loadingAction === task.id}
                          price={task.price}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Day-Wise Completed Tasks & Errand History */}
      {completedMyTasks.length > 0 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 text-gray-900 shadow-xl border border-gray-200 mb-10">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-xl md:text-2xl font-extrabold font-serif tracking-tight text-gray-900 flex items-center gap-2">
                📜 Completed Runner Tasks & Errand History
              </h2>
            </div>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-mono">
              {completedMyTasks.length} Completed Total
            </span>
          </div>

          <div className="space-y-6">
            {Object.entries(
              completedMyTasks.reduce((acc: { [key: string]: any[] }, task) => {
                const dateStr = new Date(task.updatedAt || task.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                if (!acc[dateStr]) acc[dateStr] = [];
                acc[dateStr].push(task);
                return acc;
              }, {})
            ).map(([dayLabel, dayTasks]) => (
              <div key={dayLabel} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-gray-500 uppercase tracking-widest bg-gray-100 px-3.5 py-1.5 rounded-xl w-fit font-mono">
                  <span>📅 {dayLabel}</span>
                  <span className="text-gray-400">({dayTasks.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dayTasks.map((task) => {
                    const isExternalErrand = (task.price !== null && task.price !== undefined) || (task.task && task.task.startsWith('[EXTERNAL/ERRAND]'));
                    const cleanTask = task.task ? task.task.replace('[EXTERNAL/ERRAND] ', '') : '';

                    return (
                      <div
                        key={task.id}
                        className="bg-gray-50 hover:bg-white rounded-2xl p-4.5 border border-gray-200 hover:border-emerald-500/50 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isExternalErrand ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isExternalErrand ? '⚡ External Errand' : task.event?.title || 'Event Task'}
                            </span>
                            <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {new Date(task.updatedAt || task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-gray-900 mb-2 line-clamp-2 leading-snug">{cleanTask}</h4>
                        </div>

                        <div className="pt-3 border-t border-gray-200/60 mt-2 flex items-center justify-between gap-2 flex-wrap">
                          {task.price !== null && task.price !== undefined ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-emerald-700 font-mono">₹{task.price}</span>
                              {task.paymentStatus === 'CONFIRMED' ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md text-[10px] font-extrabold font-mono">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed
                                </span>
                              ) : task.paymentStatus === 'SENT' ? (
                                <button
                                  onClick={() => handleConfirmPayment(task.id)}
                                  disabled={loadingAction === task.id}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-1 px-2.5 rounded-lg text-[10px] transition-all shadow-2xs flex items-center gap-1 animate-pulse cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3 h-3" /> Confirm Received (₹{task.price})
                                </button>
                              ) : (
                                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                  Awaiting Payment
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-gray-500">No fee specified</span>
                          )}
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            ✅ Completed
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIVE EVENT ALERT */}
      {liveShifts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-green-50 border border-green-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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
          <div className="flex flex-wrap gap-2 flex-shrink-0 w-full sm:w-auto">
            <Link href="/worker/runners" className="flex-1 sm:flex-none">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Runner Tasks
              </button>
            </Link>
            <Link href={`/worker/events/${liveShifts[0]?.staffingRequest?.eventId}/chat`} className="flex-1 sm:flex-none">
              <button className="w-full bg-white border border-green-400 text-green-700 hover:bg-green-50 font-bold text-xs px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Event Chat
              </button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 flex flex-col justify-between h-44 border border-gray-100"
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
        className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
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
        <Link href="/worker/completed-shifts" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto text-sm font-semibold text-gray-500 hover:text-gray-800 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            View Completed Shifts
          </button>
        </Link>
      </motion.div>

      {/* Recent Applications — exclude completed events */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold font-serif">Active Events</h2>
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

      {/* Recently Completed Shifts (Review) */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold font-serif text-gray-800">Recently Completed</h2>
          <Link href="/worker/completed-shifts" className="text-sm font-bold text-[#CD7F32] hover:underline flex items-center gap-1">
            View All <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </Link>
        </div>

        {applications.filter(app => app.staffingRequest?.event?.status === 'COMPLETED').length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 text-center text-gray-500">
            No completed shifts yet.
          </div>
        ) : (
          <div className="space-y-3">
            {applications
              .filter(app => app.staffingRequest?.event?.status === 'COMPLETED')
              .slice(0, 4)
              .map((app, index) => {
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl p-4 border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full flex-shrink-0 bg-gray-400"></div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-800">{app.staffingRequest?.roleName}</h4>
                        <p className="text-xs text-gray-500">
                          {app.staffingRequest?.event?.title}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 self-end md:self-auto w-full md:w-auto">
                      <Link href="/worker/completed-shifts" className="flex-1 md:flex-none">
                        <button className="w-full bg-[#CD7F32] hover:bg-[#b06a28] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-sm flex items-center justify-center gap-1.5">
                          Review
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>

      {/* Platform Live Events Section */}
      {platformLiveEvents.length > 0 && (
        <div className="mt-12 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
              <h2 className="text-2xl font-bold font-serif">Platform Live Events</h2>
            </div>
            <Link href="/worker/jobs" className="text-sm font-bold text-[#CD7F32] hover:underline">Explore</Link>
          </div>

          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 snap-x hide-scrollbar">
            {platformLiveEvents.map((event, i) => (
              <Link href={`/events/${event.id}`} key={event.id} className="min-w-[280px] md:min-w-[320px] snap-start shrink-0 group">
                <div className="bg-white border border-gray-200 hover:border-[#CD7F32] rounded-xl overflow-hidden transition-all duration-300 relative h-full flex flex-col shadow-sm hover:shadow-md">
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-white/90 backdrop-blur-md border border-gray-200 text-gray-800 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      ONGOING
                    </span>
                  </div>
                  
                  <div className="h-32 w-full overflow-hidden bg-gray-100 relative">
                    <img 
                      src={event.coverImageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#CD7F32] transition-colors">{event.title}</h3>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    
                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {event.staffingRequests?.length || 0} Open Roles
                      </span>
                      <span className="text-[10px] font-bold text-[#CD7F32] uppercase tracking-wider group-hover:underline">View →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
