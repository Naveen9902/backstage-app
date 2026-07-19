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
    <div className="max-w-4xl mx-auto space-y-8 text-[#242424] font-sans">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account details and preferences.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg font-bold text-sm ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-[#EAE6DF] overflow-hidden">
        {/* Profile Header */}
        <div className="h-32 bg-gradient-to-r from-[#242424] to-[#CD7F32]/80 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative w-24 h-24 rounded-full border-4 border-white bg-[#CD7F32] flex items-center justify-center shadow-md overflow-hidden bg-cover bg-center group" style={{ backgroundImage: (isEditing ? formData.avatarUrl : profile?.avatarUrl) ? `url(${isEditing ? formData.avatarUrl : profile?.avatarUrl})` : 'none' }}>
              {!(isEditing ? formData.avatarUrl : profile?.avatarUrl) && (
                <span className="text-3xl font-bold text-white">
                  {profile?.name ? profile.name.substring(0, 2).toUpperCase() : 'U'}
                </span>
              )}
              {isEditing && (
                <>
                  <label htmlFor="avatarUpload" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer text-white">
                    <Camera size={20} className="mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
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
                        reader.onloadend = () => {
                          setFormData({...formData, avatarUrl: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              {!isEditing ? (
                <>
                  <h2 className="text-2xl font-bold">{profile?.name || 'User'}</h2>
                  <p className="text-gray-500">{profile?.email || 'user@example.com'}</p>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#CD7F32] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={formData.mobile} 
                      onChange={e => setFormData({...formData, mobile: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#CD7F32] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
            <div>
              {isEditing ? (
                <div className="flex gap-2">
                  <button onClick={() => { setIsEditing(false); setFormData({ name: profile.name, mobile: profile.mobile || '', avatarUrl: profile.avatarUrl || '' }); }} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#CD7F32] text-white rounded-xl text-sm font-semibold hover:bg-[#a06227] transition-colors disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-[#EAE6DF] rounded-xl text-sm font-semibold hover:border-[#CD7F32] hover:text-[#CD7F32] transition-colors shadow-sm">
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#F5F3EC] p-6 rounded-xl border border-[#EAE6DF]/50">
              <div className="flex items-center gap-3 text-[#CD7F32] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <h3 className="font-bold">Contact Info</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Email Address</p>
                  <p className="text-sm font-medium">{profile?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Phone Number</p>
                  <p className="text-sm font-medium">{profile?.mobile || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F5F3EC] p-6 rounded-xl border border-[#EAE6DF]/50">
              <div className="flex items-center gap-3 text-[#CD7F32] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <h3 className="font-bold">Account Details</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Role</p>
                  <p className="text-sm font-medium uppercase">{profile?.role}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Joined</p>
                  <p className="text-sm font-medium">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
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
