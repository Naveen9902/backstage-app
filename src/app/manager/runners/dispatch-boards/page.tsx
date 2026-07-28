'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FolderOpen, DollarSign, ChevronRight, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AllDispatchBoardsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [boardHistoryTab, setBoardHistoryTab] = useState<'ACTIVE' | 'CLOSED'>('ACTIVE');

  const fetchDispatches = () => {
    fetch('/api/manager/runners').then(res => res.json()).then(data => {
      if (data) {
        setDispatches(data.dispatches || []);
      }
    });
  };

  useEffect(() => {
    fetch('/api/manager/events').then(res => res.json()).then(data => {
      if (Array.isArray(data)) {
        setEvents(data.filter(ev => ev.status !== 'CANCELLED'));
      }
    });
    
    fetchDispatches();
    
    const channel = supabase.channel('manager_all_boards')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'RunnerDispatch' },
        () => fetchDispatches()
      ).subscribe();

    const pollInterval = setInterval(() => fetchDispatches(), 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, []);

  // Group dispatches
  const eventGroups = dispatches.reduce((acc: Record<string, any[]>, dispatch: any) => {
    const isExternal = dispatch.task?.startsWith('[EXTERNAL/ERRAND]') || dispatch.price !== null;
    const groupKey = isExternal ? '⚡ Open Errands' : (dispatch.event?.title || 'General Venue Operations');
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(dispatch);
    return acc;
  }, {});

  events.forEach((ev: any) => {
    const key = ev.title || 'General Venue Operations';
    if (!eventGroups[key]) eventGroups[key] = [];
  });

  const eventStatusMap = events.reduce((acc: Record<string, string>, ev: any) => {
    acc[ev.title || 'General Venue Operations'] = ev.status || 'ONGOING';
    return acc;
  }, {});

  dispatches.forEach((d: any) => {
    if (d.event?.title && d.event?.status) {
      eventStatusMap[d.event.title] = d.event.status;
    }
  });

  const isBoardClosed = (groupName: string) => {
    const status = eventStatusMap[groupName];
    return status === 'COMPLETED' || status === 'CLOSED' || status === 'ARCHIVED';
  };

  const allGroupNames = Object.keys(eventGroups).sort((a, b) => {
    if (a === '⚡ Open Errands') return -1;
    if (b === '⚡ Open Errands') return 1;
    return a.localeCompare(b);
  });
  
  const activeBoardNames = allGroupNames.filter(name => !isBoardClosed(name));
  const closedBoardNames = allGroupNames.filter(name => isBoardClosed(name));
  const displayedGroupNames = boardHistoryTab === 'ACTIVE' ? activeBoardNames : closedBoardNames;

  const navigateToBoard = (boardName: string) => {
    router.push(`/manager/runners?board=${encodeURIComponent(boardName)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 lg:p-12 pb-32">
      <div className="max-w-7xl mx-auto">
        <Link href="/manager/runners">
          <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-[#CD7F32] font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-sm border border-gray-200 mb-8 group">
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        </Link>

        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#CD7F32]/10 text-[#CD7F32] rounded-full text-xs font-bold uppercase tracking-widest mb-2 border border-[#CD7F32]/30 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-[#CD7F32]" style={{ animationDuration: '6s' }} />
                <span>All Boards Directory</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-serif tracking-tight flex items-center gap-2.5 flex-wrap">
                <span>All Event Dispatch Centers</span>
              </h2>
            </div>
            
            <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
              <button
                onClick={() => setBoardHistoryTab('ACTIVE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  boardHistoryTab === 'ACTIVE'
                    ? 'bg-[#242424] text-[#CD7F32] shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Boards</span>
                <span className="px-1.5 py-0.2 bg-white/20 text-current rounded font-mono text-[10px]">
                  {activeBoardNames.length}
                </span>
              </button>
              <button
                onClick={() => setBoardHistoryTab('CLOSED')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  boardHistoryTab === 'CLOSED'
                    ? 'bg-[#242424] text-white shadow-md border border-[#CD7F32]/40'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <span>🏁 Closed History</span>
                <span className="px-1.5 py-0.2 bg-white/20 text-current rounded font-mono text-[10px]">
                  {closedBoardNames.length}
                </span>
              </button>
            </div>
          </div>

          {displayedGroupNames.length === 0 ? (
            <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 rounded-3xl bg-[#CD7F32]/10 text-[#CD7F32] flex items-center justify-center mx-auto mb-4">
                {boardHistoryTab === 'CLOSED' ? <span className="text-3xl">🏁</span> : <FolderOpen className="w-8 h-8" />}
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-serif">
                {boardHistoryTab === 'CLOSED' ? 'No Closed Dispatch Boards' : 'No Active Dispatch Boards'}
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedGroupNames.map(groupName => {
                const groupDispatches = eventGroups[groupName] || [];
                const isExternalGroup = groupName.includes('External') || groupName.includes('Errands') || groupName.includes('Errand');
                const isClosed = isBoardClosed(groupName);
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
                    onClick={() => navigateToBoard(groupName)}
                    className={`group relative overflow-hidden rounded-3xl p-6.5 cursor-pointer transition-all duration-300 flex flex-col justify-between border-2 shadow-lg ${
                      isClosed
                        ? 'bg-[#181818] text-white border-gray-800 hover:border-[#CD7F32]/80'
                        : isExternalGroup 
                        ? 'bg-gradient-to-br from-[#242424] via-[#2a241f] to-[#181818] text-white border-[#CD7F32]/40 hover:border-[#CD7F32]' 
                        : 'bg-gradient-to-br from-[#242424] via-[#2a2a2a] to-[#1f1f1f] text-white border-gray-800 hover:border-[#CD7F32]'
                    }`}
                  >
                    <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 bg-[#CD7F32]/15 group-hover:bg-[#CD7F32]/30" />

                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner bg-[#CD7F32]/20 text-[#CD7F32] border-[#CD7F32]/30 text-2xl">
                          {isClosed ? '🏁' : isExternalGroup ? '⚡' : <FolderOpen className="w-6 h-6" />}
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border font-mono shadow-2xs ${
                          isClosed ? 'bg-[#242424] text-gray-300 border-gray-700' : 'bg-[#CD7F32]/20 text-[#CD7F32] border-[#CD7F32]/40'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isClosed ? 'bg-gray-400' : 'bg-[#CD7F32] animate-pulse'}`} />
                          {isClosed ? '🏁 Closed History' : 'Active Board'}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold font-serif tracking-tight leading-snug mb-2 transition-colors group-hover:text-[#CD7F32]">
                        {groupName}
                      </h3>
                    </div>

                    <div className="mt-6">
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
                            {totalTasks} Total Dispatches
                          </span>
                        )}

                        <div className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider py-1.5 px-3 rounded-xl transition-all bg-[#CD7F32] text-white group-hover:bg-[#df8a3c] shadow-md shadow-[#CD7F32]/20">
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
      </div>
    </div>
  );
}
