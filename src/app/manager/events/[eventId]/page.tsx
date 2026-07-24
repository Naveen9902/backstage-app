'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EventWorkersPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const eventRes = await fetch(`/api/user/events/${eventId}`);
      if (eventRes.ok) {
        setEvent(await eventRes.json());
      }
      
      const staffingRes = await fetch(`/api/manager/events/${eventId}/staffing`);
      if (staffingRes.ok) {
        const requests = await staffingRes.json();
        const extractedWorkers: any[] = [];
        requests.forEach((req: any) => {
          if (Array.isArray(req.applications)) {
            req.applications.forEach((app: any) => {
              if (app.status === 'ACCEPTED' || app.status === 'PAID') {
                extractedWorkers.push({
                  id: app.id,
                  userId: app.workerProfile?.user?.id,
                  name: app.workerProfile?.user?.name,
                  avatarUrl: app.workerProfile?.user?.avatarUrl,
                  roleName: req.roleName,
                  status: app.status,
                  checkInTime: app.checkInTime,
                  checkOutTime: app.checkOutTime,
                });
              }
            });
          }
        });
        setWorkers(extractedWorkers);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="bg-[#242424] text-white pt-10 pb-6 px-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#CD7F32]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-4xl mx-auto flex flex-col gap-4 relative z-10">
          <button onClick={() => router.push('/manager/my-events')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to My Events
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              {loading ? (
                <div className="h-10 w-48 bg-gray-700 animate-pulse rounded-lg mb-2"></div>
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold font-serif text-white">{event?.title || 'Event Details'}</h1>
              )}
              <p className="text-[#CD7F32] font-semibold mt-1 uppercase tracking-wider text-sm">Event Workers Roster</p>
            </div>
            
            <Link href={`/manager/events/${eventId}/scan`}>
              <button className="bg-gradient-to-r from-[#CD7F32] to-[#ffb163] text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-[#CD7F32]/20 hover:shadow-[#CD7F32]/40 transition-all active:scale-95 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                Open QR Scanner
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-[#CD7F32]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        ) : workers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#CD7F32]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className="text-xl font-bold font-serif mb-2 text-gray-900">No Workers Yet</h3>
            <p className="text-gray-500 mb-6">You haven't hired any workers for this event.</p>
            <Link href={`/manager/staffing?eventId=${eventId}`}>
              <button className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-bold text-sm">
                Go to Staffing
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {workers.map((worker) => (
              <div key={worker.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    {worker.avatarUrl ? (
                      <img src={worker.avatarUrl} alt={worker.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{worker.name || 'Unknown User'}</h4>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#CD7F32] bg-[#CD7F32]/10 px-2 py-0.5 rounded-md inline-block mt-1">
                      {worker.roleName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Check In</span>
                    <span className={`font-bold ${worker.checkInTime ? 'text-green-600' : 'text-gray-400'}`}>
                      {worker.checkInTime ? new Date(worker.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                    </span>
                  </div>
                  
                  <div className="h-8 w-px bg-gray-200"></div>

                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Check Out</span>
                    <span className={`font-bold ${worker.checkOutTime ? 'text-green-600' : 'text-gray-400'}`}>
                      {worker.checkOutTime ? new Date(worker.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                    </span>
                  </div>
                  
                  <div className="h-8 w-px bg-gray-200"></div>
                  
                  <div className="min-w-[80px] text-right">
                    {worker.status === 'PAID' ? (
                       <span className="flex items-center justify-end gap-1 text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                         Paid
                       </span>
                    ) : worker.checkOutTime ? (
                       <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md inline-block">
                         Pending Pay
                       </span>
                    ) : worker.checkInTime ? (
                       <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block">
                         Working
                       </span>
                    ) : (
                       <span className="text-sm font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block">
                         Hired
                       </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
