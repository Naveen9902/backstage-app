'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    bio: '',
    avatarUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);

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
            avatarUrl: data.avatarUrl || ''
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
  }, []);

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
    <div className="text-[#242424] max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">Profile</h1>
        <p className="text-lg text-gray-700">Manage your personal and company information</p>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white rounded-xl p-8 border border-gray-100" 
        style={{ boxShadow: '-6px 6px 0px rgba(205, 127, 50, 0.9)' }}
      >
        {loading ? (
          <div className="text-gray-500">Loading profile...</div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden bg-cover bg-center" style={{ backgroundImage: formData.avatarUrl ? `url(${formData.avatarUrl})` : 'none' }}>
                {!formData.avatarUrl && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                )}
              </div>
              <div>
                <input 
                  type="file" 
                  id="avatarUpload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, avatarUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label 
                  htmlFor="avatarUpload" 
                  className="text-sm font-bold text-[#CD7F32] hover:underline cursor-pointer"
                >
                  Change Photo
                </label>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-6 w-full">
              {message && (
                <div className={`p-4 rounded-lg font-bold text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-gray-700">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Email Address</label>
                  <input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Company / Organization</label>
                  <input type="text" value={formData.company} onChange={e=>setFormData({...formData, company: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Bio</label>
                  <textarea rows={4} value={formData.bio} onChange={e=>setFormData({...formData, bio: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none"></textarea>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button type="submit" disabled={saving} className="bg-[#CD7F32] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#a06227] transition-colors shadow-md disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold font-serif mb-6">Reviews from Workers</h2>
        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-100 text-center text-gray-500 italic">
            You don't have any reviews yet. Complete events to get rated!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(review => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={review.rating >= star ? "#CD7F32" : "none"} stroke={review.rating >= star ? "#CD7F32" : "#e5e7eb"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                {review.comment && <p className="text-gray-700 text-sm mb-3 italic">"{review.comment}"</p>}
                <p className="text-xs font-bold text-gray-500 uppercase">From: {review.reviewer?.name}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
