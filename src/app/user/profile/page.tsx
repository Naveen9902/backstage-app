'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', mobile: '', avatarUrl: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProfile(data);
          setFormData({ name: data.name || '', mobile: data.mobile || '', avatarUrl: data.avatarUrl || '' });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setIsEditing(false);
        setMessage('Profile updated successfully!');
        window.dispatchEvent(new Event('profileUpdated'));
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (e) {
      setMessage('An error occurred.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-[#CD7F32]/30 border-t-[#CD7F32] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="text-[#242424] w-full max-w-5xl mx-auto space-y-8 font-sans pb-12">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-500 font-medium">Manage your account details and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile Form */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EAE6DF] overflow-hidden relative group">
            
            {/* Premium Banner */}
            <div className="h-48 bg-gradient-to-tr from-[#1a1a1a] via-[#2c2c2c] to-[#CD7F32] relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            </div>

            {/* Avatar & Action Row */}
            <div className="px-8 flex flex-col sm:flex-row justify-between items-start sm:items-end relative -mt-16 sm:-mt-20 mb-8 z-10">
              <div className="relative mb-4 sm:mb-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 sm:border-[6px] border-white bg-gradient-to-br from-[#CD7F32] to-[#8a5522] shadow-2xl flex items-center justify-center overflow-hidden group/avatar cursor-pointer relative z-10 transition-transform duration-500 hover:scale-105" style={{ backgroundImage: (isEditing ? formData.avatarUrl : profile?.avatarUrl) ? `url(${isEditing ? formData.avatarUrl : profile?.avatarUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  {!(isEditing ? formData.avatarUrl : profile?.avatarUrl) && (
                    <span className="text-5xl sm:text-6xl font-black text-white mix-blend-overlay shadow-sm">
                      {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  )}
                  {isEditing && (
                    <>
                      <label htmlFor="avatarUpload" className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-[2px] cursor-pointer text-white">
                        <Camera size={28} className="mb-2 scale-75 group-hover/avatar:scale-100 transition-transform duration-300" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Update Image</span>
                      </label>
                      <input 
                        type="file" 
                        id="avatarUpload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setFormData({...formData, avatarUrl: reader.result as string});
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full border border-[#CD7F32]/30 scale-[1.15] opacity-0 group-hover:opacity-100 transition-all duration-700 z-0 pointer-events-none"></div>
              </div>
              
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button onClick={() => { setIsEditing(false); setFormData({ name: profile.name, mobile: profile.mobile || '', avatarUrl: profile.avatarUrl || '' }); }} className="px-6 py-3.5 border-2 border-gray-200 text-gray-500 rounded-2xl font-bold hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 transition-all duration-300">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-[#242424] to-[#1a1a1a] hover:from-[#CD7F32] hover:to-[#a86524] text-white px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(205,127,50,0.3)] hover:-translate-y-1 disabled:opacity-50 disabled:hover:transform-none flex items-center gap-2">
                      {saving ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="px-8 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all duration-300">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Profile Info */}
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

              {!isEditing ? (
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">{profile?.name || 'User'}</h2>
                  <p className="text-lg text-gray-500 font-medium">{profile?.email || 'user@example.com'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                  <div className="space-y-1.5 group/input">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-focus-within/input:text-[#CD7F32] transition-colors">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#f8f6f0] border-2 border-transparent focus:border-[#CD7F32]/30 focus:bg-white rounded-xl px-4 py-3.5 text-gray-900 font-semibold outline-none transition-all duration-300 shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5 group/input">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-focus-within/input:text-[#CD7F32] transition-colors">Phone Number</label>
                    <input 
                      type="text" 
                      value={formData.mobile} 
                      onChange={e => setFormData({...formData, mobile: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#f8f6f0] border-2 border-transparent focus:border-[#CD7F32]/30 focus:bg-white rounded-xl px-4 py-3.5 text-gray-900 font-semibold outline-none transition-all duration-300 shadow-inner"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Account Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-b from-white to-[#fdfcf9] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EAE6DF] p-6 sticky top-24 space-y-6">
            
            <div>
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#CD7F32]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                Contact Info
              </h3>
              <div className="bg-white p-4 rounded-2xl border border-[#EAE6DF] shadow-sm space-y-3 hover:border-[#CD7F32]/50 transition-colors">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Email Address</p>
                  <p className="text-sm font-bold text-gray-900">{profile?.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Phone Number</p>
                  <p className="text-sm font-bold text-gray-900">{profile?.mobile || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#CD7F32]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                Account Details
              </h3>
              <div className="bg-white p-4 rounded-2xl border border-[#EAE6DF] shadow-sm space-y-3 hover:border-[#CD7F32]/50 transition-colors">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Role</p>
                  <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">{profile?.role}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Joined</p>
                  <p className="text-sm font-bold text-gray-900">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}
