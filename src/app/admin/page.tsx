'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

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
    { id: 'Users', label: 'Total Users', value: metrics?.totalUsers?.toString() || '0', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: 'Managers', label: 'Total Managers', value: metrics?.totalManagers?.toString() || '0', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
    { id: 'Talents', label: 'Total Talents', value: metrics?.totalWorkers?.toString() || '0', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
    { id: 'Unverified', label: 'Unverified Talents', value: metrics?.unverifiedWorkers?.toString() || '0', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
    { id: 'Events', label: 'Total Events', value: metrics?.totalEvents?.toString() || '0', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> },
    { id: 'Applications', label: 'Job Applications', value: metrics?.totalApplications?.toString() || '0', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  ];

  if (loading) {
    return <div className="p-10 font-medium text-gray-500">Loading admin metrics...</div>;
  }

  return (
    <div className="text-[#242424]">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">Platform Overview</h1>
          <p className="text-lg text-gray-700">Monitor system health and platform statistics across Managers and Talents.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTabClick(stat.id)}
            transition={{ delay: index * 0.05 }}
            className={`cursor-pointer rounded-2xl p-6 flex flex-col justify-between h-48 border transition-colors
              ${activeTab === stat.id ? 'bg-[#CD7F32]/10 border-[#CD7F32] shadow-inner' : 'bg-white border-gray-100'}
            `}
            style={activeTab !== stat.id ? { boxShadow: '-6px 6px 0px rgba(205, 127, 50, 0.9)' } : {}}
          >
            <div className="flex justify-between items-start">
              <div>{stat.icon}</div>
              {activeTab === stat.id && (
                <span className="bg-[#CD7F32] text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full">Viewing</span>
              )}
            </div>
            <div>
              <h3 className="text-4xl font-semibold mb-1">{stat.value}</h3>
              <p className="text-gray-600 font-medium text-sm">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Details View */}
      <AnimatePresence mode="wait">
        {activeTab && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-12 overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
                <h2 className="text-lg font-bold font-serif">Detailed View: {activeTab}</h2>
                <button onClick={() => setActiveTab(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              
              <div className="p-0 overflow-x-auto">
                {listLoading ? (
                  <div className="p-8 text-center text-gray-400 font-medium">Loading data...</div>
                ) : listData.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 font-medium">No records found.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                        {['Users', 'Managers', 'Talents', 'Unverified'].includes(activeTab) && (
                          <>
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold">Email</th>
                            <th className="p-4 font-semibold">Role</th>
                            <th className="p-4 font-semibold">Joined</th>
                          </>
                        )}
                        {activeTab === 'Events' && (
                          <>
                            <th className="p-4 font-semibold">Title</th>
                            <th className="p-4 font-semibold">Location</th>
                            <th className="p-4 font-semibold">Manager</th>
                            <th className="p-4 font-semibold">Staff Reqs</th>
                          </>
                        )}
                        {activeTab === 'Applications' && (
                          <>
                            <th className="p-4 font-semibold">Talent</th>
                            <th className="p-4 font-semibold">Event</th>
                            <th className="p-4 font-semibold">Role</th>
                            <th className="p-4 font-semibold">Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {listData.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          {['Users', 'Managers', 'Talents', 'Unverified'].includes(activeTab) && (
                            <>
                              <td className="p-4 font-medium">{item.name}</td>
                              <td className="p-4 text-gray-500">{item.email}</td>
                              <td className="p-4">
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                  item.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                  item.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                }`}>{item.role}</span>
                              </td>
                              <td className="p-4 text-gray-500 text-sm">{new Date(item.createdAt).toLocaleDateString()}</td>
                            </>
                          )}
                          {activeTab === 'Events' && (
                            <>
                              <td className="p-4 font-medium">{item.title}</td>
                              <td className="p-4 text-gray-500">{item.location}</td>
                              <td className="p-4">{item.manager?.name || 'Unknown'}</td>
                              <td className="p-4 text-[#CD7F32] font-bold">{item.staffingRequests?.length || 0} Req(s)</td>
                            </>
                          )}
                          {activeTab === 'Applications' && (
                            <>
                              <td className="p-4 font-medium">{item.workerProfile?.user?.name || 'Unknown'}</td>
                              <td className="p-4 text-gray-500">{item.staffingRequest?.event?.title || 'Unknown Event'}</td>
                              <td className="p-4 font-bold">{item.staffingRequest?.roleName}</td>
                              <td className="p-4">
                                <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${
                                  item.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                  item.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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

      {/* System Status */}
      <div>
        <h2 className="text-2xl font-bold font-serif mb-6">System Status</h2>
        <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 text-green-700">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <p className="font-bold">All backend systems operational</p>
          </div>
          <p className="text-sm text-gray-500 mt-2 ml-7">Connected to database: {metrics ? 'Active' : 'Checking...'}</p>
        </div>
      </div>
    </div>
  );
}
