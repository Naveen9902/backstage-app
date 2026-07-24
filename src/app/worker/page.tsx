'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, Bell, User, MapPin, CheckCircle2, Lock, ChevronRight, Mail } from 'lucide-react';

export default function WorkerDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [nearbyEvents, setNearbyEvents] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  
  const [activeTier, setActiveTier] = useState('TIER_1');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Security', 'Usher']);

  const availableRoles = ['Security', 'Usher', 'Bartender', 'Runner', 'Stagehand', 'VIP Host'];

  const fetchData = async () => {
    try {
      const res = await fetch('/api/worker/dashboard', { cache: 'no-store' });
      const data = await res.json();
      
      if (data && !data.error) {
        setUser(data.user);
        if (data.user?.workerProfile?.tier) setActiveTier(data.user.workerProfile.tier);
        if (data.user?.workerProfile?.categories?.length > 0) setSelectedRoles(data.user.workerProfile.categories);
        
        if (Array.isArray(data.nearbyEvents)) setNearbyEvents(data.nearbyEvents);
        if (Array.isArray(data.invites)) setInvites(data.invites);
      }
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleRole = async (role: string) => {
    const newRoles = selectedRoles.includes(role) 
      ? selectedRoles.filter(r => r !== role)
      : [...selectedRoles, role];
      
    setSelectedRoles(newRoles);
    
    // Auto-save to backend
    fetch('/api/worker/profile', { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: newRoles }) 
    });
  };

  const acceptInvite = async (applicationId: string) => {
    try {
      const res = await fetch(`/api/worker/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED' })
      });
      if (res.ok) {
        setInvites(invites.filter(inv => inv.id !== applicationId));
        alert("Job offer accepted!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const declineInvite = async (applicationId: string) => {
    try {
      const res = await fetch(`/api/worker/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      });
      if (res.ok) {
        setInvites(invites.filter(inv => inv.id !== applicationId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-10 font-medium text-gray-500">Loading your dashboard...</div>;

  const profile = user?.workerProfile;

  return (
    <div className="min-h-screen bg-[#f4efe5] text-[#242424] font-sans pb-20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:p-8">
        
        {/* Left Side / Main Mobile View - Designed to look like a mobile mockup */}
        <div className="flex-1 lg:max-w-md w-full mx-auto relative lg:border-[8px] lg:border-black lg:rounded-[3rem] lg:overflow-hidden lg:shadow-2xl bg-white lg:h-[850px] flex flex-col">
          {/* Mobile Notch Placeholder (Desktop only) */}
          <div className="hidden lg:block absolute top-0 inset-x-0 h-6 bg-black rounded-b-3xl w-40 mx-auto z-50"></div>
          
          {/* Top Notification / Message Bar */}
          <div className="flex items-center justify-between px-6 pt-12 pb-4 bg-white border-b border-gray-100 sticky top-0 z-40">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group">
              <Menu className="w-6 h-6 text-gray-800" />
            </button>
            <div className="font-bold font-serif text-xl tracking-tight">Worker Hub</div>
            <div className="flex items-center gap-3">
              <div className="relative border-2 border-green-500 p-1.5 rounded-full cursor-pointer hover:bg-green-50 transition-colors shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                <Bell className="w-5 h-5 text-gray-800" />
                {invites.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
              </div>
              <Link href="/worker/profile">
                <div className="w-9 h-9 rounded-full bg-[#242424] flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform border-2 border-white shadow-md">
                  {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" /> : <User className="w-5 h-5" />}
                </div>
              </Link>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 pb-10">
            {/* Tiers Navigation */}
            <div className="px-6 py-4 flex gap-4 border-b border-gray-100 overflow-x-auto hide-scrollbar">
              {['TIER_1', 'TIER_2', 'TIER_3'].map((tier, idx) => (
                <button
                  key={tier}
                  onClick={() => setActiveTier(tier)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    activeTier === tier 
                      ? 'bg-[#CD7F32] text-white shadow-md shadow-[#CD7F32]/20' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  Tier {idx + 1}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Profile Card (Location Based) */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#242424] rounded-2xl p-6 text-white mb-8 shadow-xl relative overflow-hidden"
              >
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#CD7F32] rounded-full blur-[50px] opacity-50"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h2 className="text-2xl font-bold font-serif mb-1">{user?.name || 'Worker'}</h2>
                    <div className="flex items-center gap-1 text-[#CD7F32] text-sm font-semibold">
                      <MapPin className="w-4 h-4" />
                      <span>{profile?.location || 'Location Not Set'}</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
                    {activeTier.replace('_', ' ')}
                  </div>
                </div>

                {/* TIER 1 Multiple Role Selection */}
                {activeTier === 'TIER_1' && (
                  <div className="mt-6 border-t border-white/10 pt-4 relative z-10">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Your Selected Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {availableRoles.map(role => {
                        const isSelected = selectedRoles.includes(role);
                        return (
                          <button
                            key={role}
                            onClick={() => toggleRole(role)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              isSelected ? 'bg-[#CD7F32] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                            {role}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Job Invites Section */}
              {invites.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#CD7F32]"/> Job Invitations
                  </h3>
                  <div className="space-y-3">
                    {invites.map(invite => (
                      <div key={invite.id} className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900">{invite.staffingRequest?.roleName}</h4>
                            <p className="text-xs text-gray-600 font-medium">{invite.staffingRequest?.event?.title}</p>
                          </div>
                          <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                            You're Invited
                          </span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button onClick={() => acceptInvite(invite.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-sm transition-colors">
                            Accept
                          </button>
                          <button onClick={() => declineInvite(invite.id)} className="px-4 border border-gray-300 hover:bg-gray-100 text-gray-600 font-bold py-2 rounded-lg text-sm transition-colors">
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Events Grid */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Nearby Events</h3>
                  <Link href="/worker/jobs" className="text-[#CD7F32] text-xs font-bold hover:underline">View All</Link>
                </div>
                
                {/* 3x4 Grid for Desktop, vertical list for mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {nearbyEvents.slice(0, 12).map((event, i) => (
                    <Link href={`/events/${event.id}`} key={event.id}>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                        className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-[#CD7F32] transition-colors shadow-sm h-full flex flex-col"
                      >
                        <div className="h-24 bg-gray-200 relative">
                          <img src={event.coverImageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80'} alt="" className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-green-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            LIVE
                          </div>
                        </div>
                        <div className="p-3 flex-1 flex flex-col">
                          <h4 className="font-bold text-sm text-gray-900 line-clamp-1 mb-1">{event.title}</h4>
                          <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-2 line-clamp-1">
                            <MapPin className="w-3 h-3"/> 
                            {event.distance !== null && event.distance !== undefined ? `${event.distance.toFixed(1)} miles away` : event.location}
                          </p>
                          <div className="mt-auto text-[10px] font-bold text-[#CD7F32] uppercase tracking-wider">
                            Apply Now →
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                  
                  {nearbyEvents.length === 0 && (
                    <div className="col-span-full py-10 text-center text-gray-500 text-sm bg-white rounded-xl border border-dashed border-gray-300">
                      No active events in your area right now.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side / Verification & User Flow */}
        <div className="flex-1 lg:max-w-xl w-full mx-auto hidden lg:flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-serif">Tier Progression</h2>
              <Link href="/worker/profile" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#CD7F32] transition-colors">
                <User className="w-4 h-4" /> Edit Full Profile
              </Link>
            </div>
            
            <p className="text-gray-600 mb-8">
              Complete verifications and maintain high ratings to automatically unlock higher tiers. Higher tiers give you access to premium events, higher pay rates, and priority applications.
            </p>

            <div className="space-y-6">
              {/* Tier 2 Requirements */}
              <div className={`p-6 rounded-2xl border-2 transition-all ${activeTier === 'TIER_1' ? 'border-[#CD7F32] bg-orange-50/30' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#CD7F32]/10 text-[#CD7F32] flex items-center justify-center font-bold text-lg">2</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Unlock Tier 2</h3>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Priority Access</p>
                    </div>
                  </div>
                  {activeTier !== 'TIER_1' ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Lock className="w-5 h-5 text-gray-400" />}
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-700"><CheckCircle2 className="w-4 h-4 text-green-500"/> ID Verification completed</span>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-700"><div className="w-4 h-4 rounded-full border-2 border-gray-300"/> Complete 5 shifts (2/5)</span>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-700"><div className="w-4 h-4 rounded-full border-2 border-gray-300"/> Maintain 4.5+ Rating (Current: {profile?.rating || 0})</span>
                  </li>
                </ul>
                
                {activeTier === 'TIER_1' && (
                  <button className="mt-5 w-full bg-[#242424] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-colors flex items-center justify-center gap-2">
                    Start Tier 2 Verification <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Tier 3 Requirements */}
              <div className={`p-6 rounded-2xl border-2 transition-all ${activeTier === 'TIER_2' ? 'border-[#CD7F32] bg-orange-50/30' : 'border-gray-100 bg-gray-50 opacity-70'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-lg">3</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Unlock Tier 3</h3>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Premium Talent</p>
                    </div>
                  </div>
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500"><div className="w-4 h-4 rounded-full border-2 border-gray-300"/> Complete 20 shifts</span>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500"><div className="w-4 h-4 rounded-full border-2 border-gray-300"/> Maintain 4.8+ Rating</span>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500"><div className="w-4 h-4 rounded-full border-2 border-gray-300"/> Manager Endorsement</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
