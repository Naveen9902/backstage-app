'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
          dragConstraints={{ left: 0, right: 176 }} // 224 (w-56) - 48 (w-12)
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
    <div className="relative w-full sm:w-64 h-12 bg-[#242424] rounded-full overflow-hidden flex items-center justify-center border-2 border-[#CD7F32]/60 shadow-inner group">
      <span className="text-xs font-extrabold text-[#CD7F32] select-none pointer-events-none tracking-widest z-0 font-mono">
        {loading ? 'GRABBING TASK...' : isTaken ? 'CLAIMED! ⚡' : `SWIPE TO TAKE ${price ? '(₹'+price+')' : 'TASK'}`}
      </span>
      {!isTaken && !loading && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 208 }} // 256 (w-64) - 48 (w-12)
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
          className="absolute left-0 top-0 w-12 h-12 bg-gradient-to-br from-[#CD7F32] to-[#b86f2b] rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10 border-2 border-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </motion.div>
      )}
      <div className={`absolute top-0 left-0 h-full bg-[#CD7F32] transition-all duration-500 ease-out z-10 ${isTaken ? 'w-full' : 'w-0'}`}></div>
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

export default function LiveRunnersBoard() {
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [isRunnerAvailable, setIsRunnerAvailable] = useState(false);
  const [togglingRunner, setTogglingRunner] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | undefined>(undefined);

  const fetchTasks = async () => {
    try {
      const [res, profileRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/runners`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/profile`)
      ]);
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData && profileData.workerProfile) {
          setIsVerified(profileData.workerProfile.isVerified);
          setVerificationStatus(profileData.workerProfile.verificationStatus);
        }
      }

      if (res.ok) {
        const data = await res.json();
        setPendingTasks(data.pending || []);
        setMyTasks(data.myTasks || []);
        if (typeof data.isRunnerAvailable === 'boolean') {
          setIsRunnerAvailable(data.isRunnerAvailable);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRunner = async (newVal: boolean) => {
    setTogglingRunner(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/runners`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRunnerAvailable: newVal })
      });
      if (res.ok) {
        const data = await res.json();
        setIsRunnerAvailable(data.isRunnerAvailable);
        fetchTasks();
        window.dispatchEvent(new Event('profileUpdated'));
      } else {
        alert('Failed to update runner state');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingRunner(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    
    // Supabase Realtime instead of polling
    const channel = supabase.channel('worker_runner_dispatches')
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
          fetchTasks(); // Instantly refresh data when any dispatch changes
        }
      )
      .subscribe();

    // Fallback: poll every 5 seconds just in case Realtime isn't enabled on the table
    const pollInterval = setInterval(() => {
      fetchTasks();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, []);

  const handleAccept = async (dispatchId: string) => {
    setLoadingAction(dispatchId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/runners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatchId, action: 'accept' })
      });
      if (res.ok) {
        fetchTasks();
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/runners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatchId, action: 'complete' })
      });
      if (res.ok) {
        fetchTasks();
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/runners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatchId, action: 'confirm_payment' })
      });
      if (res.ok) {
        fetchTasks();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to confirm payment');
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingAction(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-10 relative overflow-hidden bg-gradient-to-r from-[#242424] to-[#1a1a1a] rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-10 w-32 h-full bg-gradient-to-b from-[#CD7F32] to-transparent transform rotate-45 animate-pulse"></div>
          <div className="absolute -bottom-10 right-32 w-64 h-64 bg-[#CD7F32] rounded-full blur-[80px]"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CD7F32]/20 border border-[#CD7F32]/40 text-[#CD7F32] text-xs font-bold mb-4">
              <span className="w-2 h-2 rounded-full bg-[#CD7F32] animate-pulse"></span>
              Live Errand Portal
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold font-serif tracking-tight">On-Ground Operations</h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base max-w-md leading-relaxed">
              Accept live broadcast tasks, run external errands, and swipe to mark tasks as completed in real-time.
            </p>
          </div>
          
          <div className="flex gap-4 self-start md:self-auto w-full sm:w-auto justify-start sm:justify-end">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center flex-1 sm:flex-initial sm:min-w-[110px]">
              <div className="text-3xl font-bold text-[#CD7F32] mb-1">{myTasks.filter(t => t.status !== 'Completed').length}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Active</div>
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center flex-1 sm:flex-initial sm:min-w-[110px]">
              <div className="text-3xl font-bold text-white mb-1">{pendingTasks.length}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Open</div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/15 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          <div className="text-xs sm:text-sm text-gray-300 text-center lg:text-left leading-relaxed">
            <span className="font-bold text-white uppercase tracking-wider font-mono">Runner Duty Mode:</span> Swipe or tap to go online and receive external errands from nearby events
          </div>
          <div className="flex justify-center lg:justify-end w-full lg:w-auto">
            <SwipeToToggleRunner
              isRunnerAvailable={isRunnerAvailable}
              onToggle={handleToggleRunner}
              loading={togglingRunner}
              isVerified={isVerified}
              verificationStatus={verificationStatus}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {/* My Tasks Section */}
        <section>
          <h2 className="text-xl font-bold font-serif flex items-center gap-2 mb-4 text-gray-800">
            <CheckCircle2 className="text-[#CD7F32] w-5 h-5" />
            My Active Tasks &amp; Errands
          </h2>
          
          {myTasks.length === 0 ? (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center text-gray-500">
              You have no active tasks at the moment.
            </div>
          ) : (
            <div className="space-y-4">
              {myTasks.map(task => {
                const isExternalErrand = (task.price !== null && task.price !== undefined) || (task.task && task.task.startsWith('[EXTERNAL/ERRAND]'));
                const cleanTask = task.task ? task.task.replace('[EXTERNAL/ERRAND] ', '') : '';
                return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={task.id} 
                  className="bg-white shadow-sm rounded-r-xl p-5 border-l-4 border-[#CD7F32]"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2 sm:gap-3 w-full">
                    <div className="min-w-0 w-full overflow-hidden flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1 sm:hidden">
                        <span className="text-xs font-extrabold uppercase tracking-wider truncate max-w-[180px] text-[#CD7F32]">
                          {isExternalErrand ? (task.event?.title || '⚡ External Errand') : task.event?.title}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {task.price !== null && task.price !== undefined && (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full text-[11px] font-extrabold font-mono shadow-2xs">
                              ₹{task.price} Payout
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                            task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-[#CD7F32]/10 text-[#CD7F32] border border-[#CD7F32]/30'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                      <span className="hidden sm:block text-xs font-bold uppercase tracking-wider truncate text-[#CD7F32]">
                        {isExternalErrand ? (task.event?.title || '⚡ External Errand') : task.event?.title}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-1 break-words leading-snug">{cleanTask}</h3>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      {task.price !== null && task.price !== undefined && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold font-mono shadow-2xs">
                          ₹{task.price} Payout
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                        task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-[#CD7F32]/10 text-[#CD7F32] border border-[#CD7F32]/30'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1 shrink-0"><Clock className="w-4 h-4"/> {new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className={`font-bold shrink-0 ${task.urgency === 'Critical' ? 'text-red-600' : task.urgency === 'High' ? 'text-amber-600' : 'text-gray-600'}`}>
                        {task.urgency} Urgency
                      </span>
                    </div>
                    
                    {task.status !== 'Completed' ? (
                      <SwipeToComplete 
                        onComplete={() => handleComplete(task.id)} 
                        loading={loadingAction === task.id} 
                      />
                    ) : task.price !== null && task.price !== undefined && (
                      <div className="w-full sm:w-auto mt-2 sm:mt-0">
                        {task.paymentStatus === 'CONFIRMED' ? (
                          <span className="inline-flex items-center justify-center w-full sm:w-auto gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 px-4 py-2 rounded-xl text-xs font-bold font-mono shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Payment Confirmed (₹{task.price})
                          </span>
                        ) : task.paymentStatus === 'SENT' ? (
                          <button
                            onClick={() => handleConfirmPayment(task.id)}
                            disabled={loadingAction === task.id}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 animate-pulse disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{loadingAction === task.id ? 'Confirming...' : `Confirm Payment Received (₹${task.price})`}</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center justify-center w-full sm:w-auto gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                            Waiting for Manager Payout (₹{task.price})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Pending / Broadcast Tasks */}
        <section>
          <h2 className="text-xl font-bold font-serif flex items-center gap-2 mb-4 text-gray-800">
            <AlertTriangle className="text-amber-500 w-5 h-5" />
            Open Requests
          </h2>
          
          {pendingTasks.length === 0 ? (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center text-gray-500">
              No open requests right now.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTasks.map(task => {
                const isExternalErrand = (task.price !== null && task.price !== undefined) || (task.task && task.task.startsWith('[EXTERNAL/ERRAND]'));
                const cleanTask = task.task ? task.task.replace('[EXTERNAL/ERRAND] ', '') : '';
                return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={task.id} 
                  className={`bg-white shadow-sm rounded-xl p-5 transition-all ${
                    isExternalErrand ? 'border-2 border-[#CD7F32] shadow-lg shadow-[#CD7F32]/10 bg-gradient-to-br from-[#CD7F32]/5 via-white to-white' : 'border border-gray-200 hover:border-[#CD7F32]'
                  }`}
                >
                  {isExternalErrand && (
                    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 bg-[#242424] text-white px-3.5 py-2 rounded-xl text-xs font-bold font-mono shadow-sm border border-[#CD7F32]/50">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#CD7F32] animate-ping"></span>
                        <span className="text-[#CD7F32]">⚡ OPEN ERRAND BROADCAST &bull; FIRST TO GRAB WINS</span>
                      </span>
                      {task.price !== null && task.price !== undefined && (
                        <span className="bg-[#CD7F32] text-white px-2.5 py-0.5 rounded-lg font-extrabold text-sm font-mono shadow-2xs">₹{task.price}</span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2 sm:gap-3 w-full">
                    <div className="min-w-0 w-full overflow-hidden flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1 sm:hidden">
                        <span className={`text-xs font-extrabold uppercase tracking-wider truncate max-w-[180px] ${isExternalErrand ? 'text-[#CD7F32]' : 'text-gray-500'}`}>
                          {task.event?.title || 'External Errand'}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {!isExternalErrand && task.price !== null && task.price !== undefined && (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full text-[11px] font-extrabold font-mono shadow-2xs">
                              ₹{task.price} Payout
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                            task.urgency === 'Critical' ? 'bg-red-100 text-red-700' : 
                            task.urgency === 'High' ? 'bg-amber-100 text-amber-700' : 
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.urgency}
                          </span>
                        </div>
                      </div>
                      <span className={`hidden sm:block text-xs font-bold uppercase tracking-wider truncate ${isExternalErrand ? 'text-[#CD7F32]' : 'text-gray-500'}`}>{task.event?.title || 'External Errand'}</span>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-1 break-words leading-snug">{cleanTask}</h3>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      {!isExternalErrand && task.price !== null && task.price !== undefined && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold font-mono shadow-2xs">
                          ₹{task.price} Payout
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                        task.urgency === 'Critical' ? 'bg-red-100 text-red-700' : 
                        task.urgency === 'High' ? 'bg-amber-100 text-amber-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.urgency}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500 min-w-0">
                      <span className="flex items-center gap-1 shrink-0"><Clock className="w-4 h-4"/> {new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      {isExternalErrand && (
                        <span className="text-xs text-[#CD7F32] font-semibold italic">⚡ Claim immediately before other runners accept!</span>
                      )}
                    </div>
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
          )}
        </section>
      </div>
    </div>
  );
}
