'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type DispatchTask = {
  id: string;
  task: string;
  urgency: string;
  status: string;
  runner: string | null;
  createdAt: string;
  event: {
    title: string;
    location: string;
  };
};

export default function LiveRunnersBoard() {
  const [pendingTasks, setPendingTasks] = useState<DispatchTask[]>([]);
  const [myTasks, setMyTasks] = useState<DispatchTask[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 3000); // Polling every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (dispatchId: string, action: 'accept' | 'complete') => {
    try {
      const res = await fetch('/api/worker/runners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatchId, action })
      });
      if (res.ok) {
        fetchTasks(); // instantly refresh
      } else {
        const err = await res.json();
        alert(err.error || 'Action failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="text-[#242424] max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">Live Runner Board</h1>
        <p className="text-lg text-gray-700">Accept urgent tasks for events you are working</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Available Tasks */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <h2 className="text-2xl font-bold font-serif">Available Tasks</h2>
          </div>
          
          {loading && pendingTasks.length === 0 ? (
            <div className="text-gray-500">Scanning for tasks...</div>
          ) : pendingTasks.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-500">
              No pending tasks right now.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTasks.map(task => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={task.id} 
                  className="p-5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{task.task}</h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase ${
                      task.urgency === 'Critical' ? 'bg-red-200 text-red-800' :
                      task.urgency === 'High' ? 'bg-orange-200 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.urgency}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    {task.event.title} &bull; {task.event.location}
                  </div>
                  <button 
                    onClick={() => handleAction(task.id, 'accept')}
                    className="w-full bg-[#CD7F32] hover:bg-[#b5702c] text-white font-bold py-2.5 rounded-lg transition-colors shadow-md"
                  >
                    Accept Task
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* My Tasks */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold font-serif mb-6">My Active Tasks</h2>
          
          {loading && myTasks.length === 0 ? (
            <div className="text-gray-500">Loading...</div>
          ) : myTasks.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-500">
              You haven't accepted any tasks yet.
            </div>
          ) : (
            <div className="space-y-4">
              {myTasks.map(task => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={task.id} 
                  className={`p-5 rounded-xl border ${task.status === 'Completed' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold text-lg ${task.status === 'Completed' ? 'line-through text-gray-500' : ''}`}>{task.task}</h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase ${task.status === 'Completed' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {task.event.title}
                  </div>
                  {task.status !== 'Completed' && (
                    <button 
                      onClick={() => handleAction(task.id, 'complete')}
                      className="w-full bg-[#242424] hover:bg-black text-white font-bold py-2.5 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      Mark Complete
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
