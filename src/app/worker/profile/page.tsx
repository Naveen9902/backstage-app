'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function WorkerProfile() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatarUrl: '',
    skills: '',
    experience: '',
    category: '',
    specialization: '',
    pastWork: '',
    rates: '',
    portfolioLinks: '',
    isRunnerAvailable: false,
    isVerified: false,
    rating: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [inAppNotifs, setInAppNotifs] = useState(true);

  useEffect(() => {
    fetch('/api/worker/profile')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            avatarUrl: data.avatarUrl || '',
            skills: data.workerProfile?.skills || '',
            experience: data.workerProfile?.experience || '',
            category: data.workerProfile?.category || '',
            specialization: data.workerProfile?.specialization || '',
            pastWork: data.workerProfile?.pastWork || '',
            rates: data.workerProfile?.rates || '',
            portfolioLinks: data.workerProfile?.portfolioLinks || '',
            isRunnerAvailable: data.workerProfile?.isRunnerAvailable || false,
            isVerified: data.workerProfile?.isVerified || false,
            rating: data.workerProfile?.rating || 0
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

    fetch('/api/user/settings')
      .then(res => res.json())
      .then(data => {
        if (data.notificationsEnabled !== undefined) {
          setInAppNotifs(data.notificationsEnabled);
        }
      })
      .catch(err => console.error('Failed to load settings', err));
  }, []);

  const handleToggleInApp = async () => {
    const newVal = !inAppNotifs;
    setInAppNotifs(newVal);
    try {
      await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationsEnabled: newVal })
      });
    } catch (error) {
      console.error('Failed to update settings', error);
      setInAppNotifs(!newVal);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/worker/profile', {
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
        <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">My Profile</h1>
        <p className="text-lg text-gray-700">Manage your skills, experience, and verification status</p>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className={`p-4 rounded-lg font-bold text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-6 border-b border-gray-100">
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
                  <label htmlFor="avatarUpload" className="text-sm font-bold text-[#CD7F32] hover:underline cursor-pointer">
                    Change Photo
                  </label>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Email Address</label>
                  <input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                </div>
                <div className="flex gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${formData.isVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {formData.isVerified ? 'Verified Talent' : 'Unverified'}
                  </span>
                  {formData.rating > 0 && (
                    <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#CD7F32" stroke="#CD7F32"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {formData.rating.toFixed(1)} Rating
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="text-sm font-bold text-gray-700">Category</label>
                <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none">
                  <option value="">Select Category</option>
                  <option value="Audio/Visual">Audio/Visual</option>
                  <option value="Security">Security</option>
                  <option value="Hospitality">Hospitality</option>
                  <option value="Performance">Performance</option>
                  <option value="General Staff">General Staff</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Specialization</label>
                <input type="text" value={formData.specialization} onChange={e=>setFormData({...formData, specialization: e.target.value})} placeholder="e.g. Stage Manager, Lighting Tech" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-700">Skills & Keywords</label>
                <input type="text" value={formData.skills} onChange={e=>setFormData({...formData, skills: e.target.value})} placeholder="e.g. Ableton, Rigging, First Aid" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-700">Experience / Bio</label>
                <textarea rows={3} value={formData.experience} onChange={e=>setFormData({...formData, experience: e.target.value})} placeholder="Describe your relevant event experience..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none"></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-700">Past Work (Notable Events)</label>
                <textarea rows={2} value={formData.pastWork} onChange={e=>setFormData({...formData, pastWork: e.target.value})} placeholder="e.g. Coachella 2023, Local Food Market" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none"></textarea>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700">Standard Rates</label>
                <input type="text" value={formData.rates} onChange={e=>setFormData({...formData, rates: e.target.value})} placeholder="e.g. $30/hr or $250/day" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Portfolio / Social Links</label>
                <input type="text" value={formData.portfolioLinks} onChange={e=>setFormData({...formData, portfolioLinks: e.target.value})} placeholder="LinkedIn, Instagram, Website..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
              </div>
              
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">Runner Availability</h3>
                  <p className="text-sm text-gray-500">Opt-in to receive last-minute on-demand runner requests for quick tasks.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.isRunnerAvailable} onChange={e=>setFormData({...formData, isRunnerAvailable: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#CD7F32]"></div>
                </label>
              </div>

              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">In-App Notifications</h3>
                  <p className="text-sm text-gray-500">Receive alerts when your applications are accepted, when you get a new review, etc.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={inAppNotifs} onChange={handleToggleInApp} />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#CD7F32]"></div>
                </label>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={saving} className="px-8 py-3 bg-[#CD7F32] text-white font-bold rounded-lg hover:bg-[#a06227] transition-colors shadow-md disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}
      </motion.div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold font-serif mb-6">Reviews Received</h2>
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
