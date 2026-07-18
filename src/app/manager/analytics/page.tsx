'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState({
    totalEvents: { value: 0, change: '+0%' },
    staffHired: { value: 0, change: '+0%' },
    runnersDispatched: { value: 0, change: '+0%' },
    avgRating: { value: 0, change: '+0.0' }
  });
  const [topEvents, setTopEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/manager/analytics');
        if (res.ok) {
          const data = await res.json();
          setMetrics({
            totalEvents: data.totalEvents || { value: 0, change: '+0%' },
            staffHired: data.staffHired || { value: 0, change: '+0%' },
            runnersDispatched: data.runnersDispatched || { value: 0, change: '+0%' },
            avgRating: data.avgRating || { value: 0, change: '+0.0' }
          });
          setTrendData(data.trendData || []);
          setTopEvents(data.topEvents || []);
        }

      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-10 text-gray-500 font-medium">Loading analytics...</div>;
  }

  return (
    <div className="text-[#242424] max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">Analytics</h1>
        <p className="text-lg text-gray-700">Insights and event performance metrics</p>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Events', val: metrics.totalEvents.value.toString(), change: metrics.totalEvents.change },
          { label: 'Staff Hired', val: metrics.staffHired.value.toString(), change: metrics.staffHired.change },
          { label: 'Runners Dispatched', val: metrics.runnersDispatched.value.toString(), change: metrics.runnersDispatched.change },
          { label: 'Avg Rating', val: Number(metrics.avgRating.value).toFixed(1), change: metrics.avgRating.change },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-xl border border-gray-100"
            style={{ boxShadow: '-4px 4px 0px rgba(205, 127, 50, 0.9)' }}
          >
            <p className="text-sm text-gray-500 font-bold uppercase">{stat.label}</p>
            <h3 className="text-3xl font-serif font-bold my-2">{stat.val}</h3>
            <span className={`text-sm font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change} this month
            </span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-xl border border-gray-100"
          style={{ boxShadow: '-6px 6px 0px rgba(205, 127, 50, 0.9)' }}
        >
          <h2 className="text-xl font-bold font-serif mb-6">Staffing Trends (YTD)</h2>
          <div className="flex items-end gap-4 h-64 mt-4 border-b border-gray-200 pb-2">
            {trendData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end items-center group">
                <div 
                  className="w-full bg-[#CD7F32] rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity relative" 
                  style={{ height: `${Math.max((d.value / Math.max(...trendData.map(t => t.value), 1)) * 100, 2)}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.value}
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2 font-bold">{d.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Events */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-xl border border-gray-100"
          style={{ boxShadow: '-6px 6px 0px rgba(205, 127, 50, 0.9)' }}
        >
          <h2 className="text-xl font-bold font-serif mb-6">Top Performing Events</h2>
          <div className="space-y-4">
            {topEvents.length > 0 ? (
              topEvents.map((ev, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <h4 className="font-bold">{ev.name}</h4>
                    <p className="text-sm text-gray-500">{ev.staff} staff hired</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#CD7F32" stroke="#CD7F32"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span className="font-bold text-sm">{ev.rating}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No events created yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
