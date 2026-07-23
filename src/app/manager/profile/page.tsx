'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import PushNotificationManager from '@/components/PushNotificationManager';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    bio: '',
    avatarUrl: '',
    rating: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/manager/profile')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
            setFormData({
              name: data.name || '',
              email: data.email || '',
              company: data.managerProfile?.company || '',
              bio: data.managerProfile?.bio || '',
              avatarUrl: data.avatarUrl || '',
              rating: data.managerProfile?.rating || 0
            });
          }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/reviews?type=received')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
      });

    fetch('/api/manager/events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMyEvents(data);
      });
  }, []);

  const handleDeleteAccount = async () => {
    if (confirm("DANGER: Are you sure you want to permanently delete your account and ALL events? This action cannot be undone.")) {
      setSaving(true);
      try {
        const res = await fetch('/api/user/profile', { method: 'DELETE' });
        if (res.ok) {
          window.location.href = '/';
        } else {
          alert('Failed to delete account');
          setSaving(false);
        }
      } catch (e) {
        alert('An error occurred');
        setSaving(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/manager/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMessage('Profile updated successfully!');
        window.dispatchEvent(new Event('profileUpdated'));
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (err) {
      setMessage('An error occurred.');
    }
    setSaving(false);
  };

  return (
    <div className="text-[#242424] w-full max-w-5xl mx-auto space-y-8 font-sans pb-12">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">Manager Profile</h1>
          <p className="text-gray-500 font-medium">Customize your brand identity and view your active footprint.</p>
        </div>
        {formData.rating > 0 && (
          <div className="flex items-center gap-2 bg-[#CD7F32]/10 px-4 py-2 rounded-xl border border-[#CD7F32]/20 shadow-sm">
            <span className="font-black text-xl text-[#CD7F32]">{formData.rating.toFixed(1)}</span>
            <div className="flex text-[#CD7F32]">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <span className="text-xs font-bold text-[#CD7F32] uppercase tracking-widest ml-1">Rating</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile Form */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EAE6DF] overflow-hidden relative group">
            
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#CD7F32]/30 border-t-[#CD7F32] rounded-full animate-spin"></div>
              </div>
            )}

            {/* Premium Banner */}
            <div className="h-48 bg-gradient-to-tr from-[#1a1a1a] via-[#2c2c2c] to-[#CD7F32] relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            </div>

            {/* Avatar & Action Row */}
            <div className="px-8 flex flex-col sm:flex-row justify-between items-start sm:items-end relative -mt-16 sm:-mt-20 mb-8 z-10">
              <div className="relative mb-4 sm:mb-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 sm:border-[6px] border-white bg-gradient-to-br from-[#CD7F32] to-[#8a5522] shadow-2xl flex items-center justify-center overflow-hidden group/avatar cursor-pointer relative z-10 transition-transform duration-500 hover:scale-105" style={{ backgroundImage: formData.avatarUrl ? `url(${formData.avatarUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  {!formData.avatarUrl && (
                    <span className="text-5xl sm:text-6xl font-black text-white mix-blend-overlay shadow-sm">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : 'M'}
                    </span>
                  )}
                  <label htmlFor="avatarUpload" className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-[2px] cursor-pointer text-white">
                    <Camera size={28} className="mb-2 scale-75 group-hover/avatar:scale-100 transition-transform duration-300" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Update Image</span>
                  </label>
                  <input 
                    type="file" 
                    id="avatarUpload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setFormData({ ...formData, avatarUrl: reader.result as string });
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <div className="absolute inset-0 rounded-full border border-[#CD7F32]/30 scale-[1.15] opacity-0 group-hover:opacity-100 transition-all duration-700 z-0 pointer-events-none"></div>
              </div>
              
              <button 
                onClick={handleSubmit} 
                disabled={saving || loading} 
                className="bg-gradient-to-r from-[#242424] to-[#1a1a1a] hover:from-[#CD7F32] hover:to-[#a86524] text-white px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(205,127,50,0.3)] hover:-translate-y-1 disabled:opacity-50 disabled:hover:transform-none flex items-center gap-2"
              >
                {saving ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>

            {/* Form Fields */}
            <div className="px-8 pb-10">
              {message && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-8 p-4 rounded-xl font-bold text-sm flex items-center gap-3 ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {message.includes('success') ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  )}
                  {message}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <div className="space-y-1.5 group/input">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-focus-within/input:text-[#CD7F32] transition-colors">Full Name</label>
                  <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-[#f8f6f0] border-2 border-transparent focus:border-[#CD7F32]/30 focus:bg-white rounded-xl px-4 py-3.5 text-gray-900 font-semibold outline-none transition-all duration-300 shadow-inner" placeholder="Your Name" />
                </div>
                <div className="space-y-1.5 group/input">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-focus-within/input:text-[#CD7F32] transition-colors">Email Address</label>
                  <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-[#f8f6f0] border-2 border-transparent focus:border-[#CD7F32]/30 focus:bg-white rounded-xl px-4 py-3.5 text-gray-900 font-semibold outline-none transition-all duration-300 shadow-inner" placeholder="name@example.com" />
                </div>
                <div className="md:col-span-2 space-y-1.5 group/input">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-focus-within/input:text-[#CD7F32] transition-colors">Company / Organization</label>
                  <input type="text" value={formData.company} onChange={e=>setFormData({...formData, company: e.target.value})} className="w-full bg-[#f8f6f0] border-2 border-transparent focus:border-[#CD7F32]/30 focus:bg-white rounded-xl px-4 py-3.5 text-gray-900 font-semibold outline-none transition-all duration-300 shadow-inner" placeholder="Your Company Name" />
                </div>
                <div className="md:col-span-2 space-y-1.5 group/input">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-focus-within/input:text-[#CD7F32] transition-colors">Bio & Experience</label>
                  <textarea rows={4} value={formData.bio} onChange={e=>setFormData({...formData, bio: e.target.value})} className="w-full bg-[#f8f6f0] border-2 border-transparent focus:border-[#CD7F32]/30 focus:bg-white rounded-xl px-4 py-3.5 text-gray-900 font-medium outline-none transition-all duration-300 shadow-inner resize-y" placeholder="Tell workers a bit about your event management style..."></textarea>
                </div>
                
                <div className="md:col-span-2">
                  <PushNotificationManager />
                </div>
              </div>
            </div>
          </div>
          
          {/* Reviews Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#CD7F32] to-[#8a5522] flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Worker Reviews</h2>
            </div>
            
            {reviews.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-12 border border-[#EAE6DF] text-center shadow-sm">
                <div className="w-16 h-16 bg-[#f8f6f0] rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">No Reviews Yet</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">Once you complete events, workers you hire can leave reviews about their experience with you.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-3xl border border-[#EAE6DF] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg key={star} className={`w-4 h-4 transition-colors ${review.rating >= star ? "text-[#CD7F32] fill-[#CD7F32]" : "text-gray-200 fill-gray-100"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    {review.comment && <p className="text-gray-700 text-sm mb-4 leading-relaxed font-medium">"{review.comment}"</p>}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <div className="w-6 h-6 rounded-full bg-[#CD7F32]/10 flex items-center justify-center text-[#CD7F32] font-bold text-xs">
                        {review.reviewer?.name?.charAt(0) || '?'}
                      </div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{review.reviewer?.name}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Events */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-b from-white to-[#fdfcf9] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EAE6DF] p-6 sticky top-24">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live & Upcoming
            </h3>
            
            {myEvents.filter(ev => ev.status === 'ONGOING' || ev.status === 'UPCOMING').length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm italic font-medium">No active events.</p>
                <Link href="/manager/events/create" className="inline-block mt-4 text-[#CD7F32] text-xs font-bold uppercase tracking-widest hover:underline">
                  Create One →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myEvents
                  .filter(ev => ev.status === 'ONGOING' || ev.status === 'UPCOMING')
                  .slice(0, 5) // Show top 5
                  .map(event => {
                    const isLive = event.status === 'ONGOING';
                    return (
                      <Link href={`/manager/my-events`} key={event.id} className="block group">
                        <div className="bg-white p-3 rounded-2xl border border-[#EAE6DF] shadow-sm flex items-center gap-4 hover:border-[#CD7F32] hover:shadow-md transition-all duration-300">
                          <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                            {event.coverImageUrl ? (
                              <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#CD7F32] to-[#8a5522] flex items-center justify-center text-white font-bold text-xl">
                                {event.title.charAt(0)}
                              </div>
                            )}
                            {isLive && (
                              <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-[#CD7F32] transition-colors">{event.title}</h4>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            <p className="text-[9px] font-bold mt-1.5 tracking-widest uppercase">
                              {isLive ? <span className="text-green-600">Active Now</span> : <span className="text-[#CD7F32]">Upcoming</span>}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                
                {myEvents.filter(ev => ev.status === 'ONGOING' || ev.status === 'UPCOMING').length > 5 && (
                  <Link href="/manager/my-events" className="block text-center pt-2 text-[#CD7F32] text-xs font-bold uppercase tracking-widest hover:underline">
                    View All Events
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* REVIEWS SECTION */}
        <div className="lg:col-span-3 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#CD7F32] to-[#8a5522] flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Manager Reviews</h2>
          </div>
          
          {reviews.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 border border-[#EAE6DF] text-center shadow-sm">
              <div className="w-16 h-16 bg-[#f8f6f0] rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">No Reviews Yet</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">Once you complete events, workers can leave reviews about their experience with you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-3xl border border-[#EAE6DF] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg key={star} className={`w-4 h-4 transition-colors ${review.rating >= star ? "text-[#CD7F32] fill-[#CD7F32]" : "text-gray-200 fill-gray-100"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.comment && <p className="text-gray-700 text-sm mb-4 leading-relaxed font-medium">"{review.comment}"</p>}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-[#CD7F32]/10 flex items-center justify-center text-[#CD7F32] font-bold text-xs">
                      {review.reviewer?.name?.charAt(0) || '?'}
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{review.reviewer?.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        <div className="lg:col-span-3 mt-8 mb-12 p-8 bg-[#111111] border border-[#CD7F32]/50 rounded-[2rem] w-full max-w-4xl mx-auto shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#CD7F32]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <h3 className="font-black text-[#CD7F32] text-xl mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
              DANGER ZONE
            </h3>
            <p className="text-[#EAE6DF] text-sm mb-6 font-medium max-w-2xl">Permanently delete your Back Stage manager account, including all your events, chats, and records. This action cannot be undone and all data will be permanently wiped.</p>
            <button onClick={handleDeleteAccount} disabled={saving} className="px-8 py-3 bg-gradient-to-r from-[#CD7F32] to-[#a86524] text-black font-black rounded-xl hover:scale-[1.02] transition-transform duration-300 shadow-[0_0_15px_rgba(205,127,50,0.5)] disabled:opacity-50 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              Delete My Account Permanently
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
