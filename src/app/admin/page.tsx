'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Users, UserCheck, ShieldCheck, 
  CalendarDays, Briefcase, Activity, 
  Server, X, TrendingUp 
} from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Detail View State
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [listData, setListData] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/metrics', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch admin metrics", err);
        setLoading(false);
      });
  }, []);

  const handleTabClick = async (tab: string) => {
    if (activeTab === tab) {
      setActiveTab(null);
      return;
    }
    setActiveTab(tab);
    setListLoading(true);
    
    let endpoint = '';
    if (tab === 'Users' || tab === 'Managers' || tab === 'Talents' || tab === 'Unverified') endpoint = '/api/admin/users';
    else if (tab === 'Events') endpoint = '/api/admin/events';
    else if (tab === 'Applications') endpoint = '/api/admin/applications';

    try {
      const res = await fetch(endpoint, { cache: 'no-store' });
      const data = await res.json();
      
      if (!data.error) {
        if (tab === 'Managers') setListData(data.filter((u: any) => u.role === 'MANAGER'));
        else if (tab === 'Talents') setListData(data.filter((u: any) => u.role === 'WORKER'));
        else if (tab === 'Unverified') setListData(data.filter((u: any) => u.role === 'WORKER' && !u.workerProfile?.isVerified));
        else setListData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  const stats = [
    { id: 'Users', label: 'Total Users', value: metrics?.totalUsers?.toString() || '0', icon: <Users size={28} className="text-[var(--primary)]" /> },
    { id: 'Managers', label: 'Managers', value: metrics?.totalManagers?.toString() || '0', icon: <Briefcase size={28} className="text-[var(--primary)]" /> },
    { id: 'Talents', label: 'Talents', value: metrics?.totalWorkers?.toString() || '0', icon: <UserCheck size={28} className="text-[var(--primary)]" /> },
    { id: 'Unverified', label: 'Pending Verification', value: metrics?.unverifiedWorkers?.toString() || '0', icon: <ShieldCheck size={28} className="text-red-400" /> },
    { id: 'Events', label: 'Active Events', value: metrics?.totalEvents?.toString() || '0', icon: <CalendarDays size={28} className="text-[var(--primary)]" /> },
    { id: 'Applications', label: 'Applications', value: metrics?.totalApplications?.toString() || '0', icon: <Activity size={28} className="text-[var(--primary)]" /> },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[var(--primary)] font-medium tracking-widest uppercase text-sm">Initializing System</p>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-full p-2 md:p-6 text-[var(--foreground)] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--primary)] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500 opacity-[0.02] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Command Center
            </h1>
            <p className="text-base md:text-lg text-gray-400 font-medium">Real-time platform analytics and administration.</p>
          </div>
          
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <span className="text-sm font-semibold text-gray-300 tracking-wide">SYSTEM ONLINE</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {stats.map((stat) => (
            <motion.div
              variants={itemVariants}
              key={stat.id}
              onClick={() => handleTabClick(stat.id)}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative cursor-pointer rounded-3xl p-7 flex flex-col justify-between h-48 
                backdrop-blur-xl border transition-all duration-300 overflow-hidden
                ${activeTab === stat.id 
                  ? 'bg-white/10 border-[var(--primary)]/60 shadow-[0_0_30px_rgba(205,127,50,0.15)]' 
                  : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                }
              `}
            >
              {/* Card internal glow */}
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-[var(--primary)] opacity-[0.15] blur-2xl rounded-full"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className={`p-3 rounded-2xl ${activeTab === stat.id ? 'bg-[var(--primary)]/20' : 'bg-black/20'}`}>
                  {stat.icon}
                </div>
                {activeTab === stat.id && (
                  <span className="flex items-center gap-1 text-[var(--primary)] text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                    <TrendingUp size={12} />
                    Active
                  </span>
                )}
              </div>
              <div className="relative z-10">
                <h3 className="text-4xl font-bold mb-1 text-white">{stat.value}</h3>
                <p className="text-gray-400 font-medium text-sm tracking-wide uppercase">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Details View */}
        <AnimatePresence mode="wait">
          {activeTab && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20, transition: { duration: 0.2 } }}
              className="mb-12 overflow-hidden rounded-3xl"
            >
              <div className="bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden rounded-3xl">
                <div className="bg-black/20 border-b border-white/10 p-5 md:p-6 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex w-8 h-8 rounded-full bg-[var(--primary)]/20 items-center justify-center text-[var(--primary)]">
                      <Server size={16} />
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">Data Explorer: <span className="text-[var(--primary)]">{activeTab}</span></h2>
                  </div>
                  <button 
                    onClick={() => setActiveTab(null)} 
                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-0 overflow-x-auto">
                  {listLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-400 font-medium animate-pulse">Fetching records...</p>
                    </div>
                  ) : listData.length === 0 ? (
                    <div className="p-16 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                        <Users size={24} className="text-gray-500" />
                      </div>
                      <p className="text-gray-400 font-medium text-lg">No records found for this category.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-black/40 border-b border-white/5 text-xs uppercase tracking-widest text-gray-400 font-semibold">
                          {['Users', 'Managers', 'Talents', 'Unverified'].includes(activeTab) && (
                            <>
                              <th className="p-5">Name</th>
                              <th className="p-5">Email</th>
                              <th className="p-5">Role</th>
                              <th className="p-5 text-right">Joined</th>
                            </>
                          )}
                          {activeTab === 'Events' && (
                            <>
                              <th className="p-5">Title</th>
                              <th className="p-5">Location</th>
                              <th className="p-5">Manager</th>
                              <th className="p-5 text-right">Staff Reqs</th>
                            </>
                          )}
                          {activeTab === 'Applications' && (
                            <>
                              <th className="p-5">Talent</th>
                              <th className="p-5">Event</th>
                              <th className="p-5">Role</th>
                              <th className="p-5 text-right">Status</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {listData.map((item: any) => (
                          <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                            {['Users', 'Managers', 'Talents', 'Unverified'].includes(activeTab) && (
                              <>
                                <td className="p-5">
                                  <div className="font-semibold text-gray-200 group-hover:text-[var(--primary)] transition-colors">{item.name}</div>
                                </td>
                                <td className="p-5 text-gray-400">{item.email}</td>
                                <td className="p-5">
                                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                    item.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                    item.role === 'MANAGER' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  }`}>{item.role}</span>
                                </td>
                                <td className="p-5 text-gray-500 text-sm text-right font-mono">
                                  {new Date(item.createdAt).toISOString().split('T')[0]}
                                </td>
                              </>
                            )}
                            {activeTab === 'Events' && (
                              <>
                                <td className="p-5 font-semibold text-gray-200 group-hover:text-[var(--primary)] transition-colors">{item.title}</td>
                                <td className="p-5 text-gray-400">{item.location}</td>
                                <td className="p-5 text-gray-300">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                      {(item.manager?.name || 'U').charAt(0)}
                                    </div>
                                    {item.manager?.name || 'Unknown'}
                                  </div>
                                </td>
                                <td className="p-5 text-right">
                                  <span className="inline-flex items-center justify-center bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30 px-3 py-1 rounded-full text-xs font-bold">
                                    {item.staffingRequests?.length || 0} Open
                                  </span>
                                </td>
                              </>
                            )}
                            {activeTab === 'Applications' && (
                              <>
                                <td className="p-5 font-semibold text-gray-200 group-hover:text-[var(--primary)] transition-colors">
                                  {item.workerProfile?.user?.name || 'Unknown'}
                                </td>
                                <td className="p-5 text-gray-400">{item.staffingRequest?.event?.title || 'Unknown Event'}</td>
                                <td className="p-5 text-gray-300 font-medium">{item.staffingRequest?.roleName}</td>
                                <td className="p-5 text-right">
                                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                    item.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                    item.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                                    'bg-red-500/20 text-red-400 border border-red-500/30'
                                  }`}>{item.status}</span>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
