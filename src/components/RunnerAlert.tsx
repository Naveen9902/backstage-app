'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RunnerAlert({ isRunnerAvailable }: { isRunnerAvailable: boolean }) {
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [ignoredTaskIds, setIgnoredTaskIds] = useState<Set<string>>(new Set());
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isRunnerAvailable) return;

    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/worker/runners', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setPendingTasks(data.pending || []);
        }
      } catch (err) {
        console.error('Failed to fetch runner alerts', err);
      }
    };

    fetchTasks();
    
    // Subscribe to new runner dispatches that are pending
    const channel = supabase.channel('runner_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'RunnerDispatch',
          filter: `status=eq.Pending`
        },
        (payload) => {
          // Re-fetch to ensure relations (like event details) are loaded correctly
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isRunnerAvailable]);

  const activeTask = pendingTasks.find(task => !ignoredTaskIds.has(task.id));

  const handleAccept = async (dispatchId: string) => {
    setProcessingId(dispatchId);
    try {
      const res = await fetch('/api/worker/runners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatchId, action: 'accept' })
      });
      if (res.ok) {
        setIgnoredTaskIds(prev => new Set(prev).add(dispatchId));
        router.push('/worker/runners'); // Redirect to active tasks
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to accept task (someone else might have claimed it)');
        setIgnoredTaskIds(prev => new Set(prev).add(dispatchId)); // Ignore it since it's probably gone
      }
    } catch (err) {
      console.error(err);
    }
    setProcessingId(null);
  };

  const handleReject = (dispatchId: string) => {
    setIgnoredTaskIds(prev => new Set(prev).add(dispatchId));
  };

  if (!isRunnerAvailable) return null;

  return (
    <AnimatePresence>
      {activeTask && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-[400px] z-[100] bg-white rounded-2xl shadow-2xl border-2 border-red-500 overflow-hidden flex flex-col"
          style={{ boxShadow: '0 20px 40px -10px rgba(239, 68, 68, 0.4)' }}
        >
          {/* Pulsing Header */}
          <div className="bg-red-500 text-white p-3 flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping absolute left-4"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-white absolute left-4"></span>
            <h3 className="font-bold tracking-widest uppercase text-sm">New Runner Task</h3>
          </div>
          
          <div className="p-5 flex-1 flex flex-col items-center text-center">
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase mb-3 ${
              activeTask.urgency === 'Critical' ? 'bg-red-100 text-red-800' :
              activeTask.urgency === 'High' ? 'bg-orange-100 text-orange-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {activeTask.urgency} Urgency
            </span>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeTask.task}</h2>
            <div className="text-sm text-gray-500 flex flex-col items-center gap-1 mb-6">
              <span className="font-semibold text-gray-700">{activeTask.event.title}</span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                {activeTask.event.location}
              </span>
            </div>
            
            <div className="flex w-full gap-3 mt-auto">
              <button 
                onClick={() => handleReject(activeTask.id)}
                disabled={processingId === activeTask.id}
                className="flex-1 py-3.5 rounded-xl font-bold border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Pass
              </button>
              <button 
                onClick={() => handleAccept(activeTask.id)}
                disabled={processingId === activeTask.id}
                className="flex-1 py-3.5 rounded-xl font-bold bg-[#CD7F32] hover:bg-[#b06a29] text-white shadow-lg transition-all active:scale-95 flex justify-center items-center"
              >
                {processingId === activeTask.id ? (
                   <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'ACCEPT'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
