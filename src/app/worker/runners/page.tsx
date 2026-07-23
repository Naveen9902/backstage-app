'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LiveRunnersBoard() {
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/worker/runners');
      if (res.ok) {
        const data = await res.json();
        setPendingTasks(data.pending || []);
        setMyTasks(data.myTasks || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    
    // Supabase Realtime instead of polling
    const channel = supabase.channel('worker_runner_dispatches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'RunnerDispatch' },
        () => {
          fetchTasks(); // Instantly refresh data when any dispatch changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAccept = async (dispatchId: string) => {
    setLoadingAction(dispatchId);
    try {
      const res = await fetch('/api/worker/runners', {
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
      const res = await fetch('/api/worker/runners', {
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-10 relative overflow-hidden bg-gradient-to-r from-[#242424] to-[#1a1a1a] rounded-3xl p-8 md:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-10 w-32 h-full bg-gradient-to-b from-[#CD7F32] to-transparent transform rotate-45 animate-pulse"></div>
          <div className="absolute -bottom-10 right-32 w-64 h-64 bg-[#CD7F32] rounded-full blur-[80px]"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#CD7F32]/20 text-[#CD7F32] rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-[#CD7F32]/30">
              <MapPin className="w-3 h-3" />
              On-Ground Operations
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-tight mb-2 text-white">Your Task Board</h1>
            <p className="text-gray-400 max-w-md">
              View your direct assignments or grab open requests to assist the team.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
              <div className="text-3xl font-bold text-[#CD7F32] mb-1">{myTasks.filter(t => t.status !== 'Completed').length}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active</div>
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
              <div className="text-3xl font-bold text-white mb-1">{pendingTasks.length}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Open</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {/* My Tasks Section */}
        <section>
          <h2 className="text-xl font-bold font-serif flex items-center gap-2 mb-4 text-gray-800">
            <CheckCircle2 className="text-[#CD7F32] w-5 h-5" />
            My Active Tasks
          </h2>
          
          {myTasks.length === 0 ? (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center text-gray-500">
              You have no active tasks at the moment.
            </div>
          ) : (
            <div className="space-y-4">
              {myTasks.map(task => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={task.id} 
                  className="bg-white border-l-4 border-[#CD7F32] shadow-sm rounded-r-xl p-5"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#CD7F32]">{task.event?.title}</span>
                      <h3 className="text-lg font-bold text-gray-900 mt-1">{task.task}</h3>
                    </div>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                      {task.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className={`font-bold ${task.urgency === 'Critical' ? 'text-red-600' : task.urgency === 'High' ? 'text-amber-600' : 'text-gray-600'}`}>
                        {task.urgency} Urgency
                      </span>
                    </div>
                    
                    {task.status !== 'Completed' && (
                      <button
                        onClick={() => handleComplete(task.id)}
                        disabled={loadingAction === task.id}
                        className="bg-[#242424] hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {loadingAction === task.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Mark Completed
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
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
              {pendingTasks.map(task => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={task.id} 
                  className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 hover:border-[#CD7F32] transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{task.event?.title}</span>
                      <h3 className="text-lg font-medium text-gray-900 mt-1">{task.task}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      task.urgency === 'Critical' ? 'bg-red-100 text-red-700' : 
                      task.urgency === 'High' ? 'bg-amber-100 text-amber-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.urgency}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 border-t border-gray-100 pt-4">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4"/> 
                      {new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <button
                      onClick={() => handleAccept(task.id)}
                      disabled={loadingAction === task.id}
                      className="bg-[#CD7F32] hover:bg-[#b06a28] text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {loadingAction === task.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept Task'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
