'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const TIER_CATEGORIES = {
  'Tier 1': [
    'Labor / Ground Crew', 'Runners', 'Guest Assistance Staff', 'Parking Staff',
    'Setup/Breakdown Crew', 'Cleaning and Housekeeping Staff', 'Volunteers', 'General Help'
  ],
  'Tier 2': [
    'Event Coordinators', 'MC / Anchor', 'Registration Desk', 'Front of House Staff',
    'Photographer', 'Videographer', 'Media', 'Press Member', 'Paparazzi',
    'Technical Crew Member (Sound, Lighting, Ops)', 'Hospitality / Catering',
    'Stage Manager', 'Backstage Manager'
  ],
  'Tier 3': [
    'Bands / Music Performers', 'Speaker', 'Keynote Guests', 'Comedians',
    'Startup Performers', 'Celebrity', 'Influencer', 'DJ', 'Other Talents'
  ]
};

export default function WorkerProfile() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    avatarUrl: '',
    skills: '',
    experience: '',
    tier: '',
    categories: [] as string[],
    dateOfBirth: '',
    emergencyContact: '',
    isPhoneVerified: false,
    govtIdUrl: '',
    liveSelfieUrl: '',
    proofOfExperienceType: '',
    proofOfExperienceUrl: '',
    socialMediaUrl: '',
    referenceEvent: '',
    referenceContact: '',
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
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [inAppNotifs, setInAppNotifs] = useState(true);

  useEffect(() => {
    fetch('/api/worker/profile')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            mobile: data.mobile || '',
            avatarUrl: data.avatarUrl || '',
            skills: data.workerProfile?.skills || '',
            experience: data.workerProfile?.experience || '',
            tier: data.workerProfile?.tier || '',
            categories: data.workerProfile?.categories || [],
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
            emergencyContact: data.emergencyContact || '',
            isPhoneVerified: data.isPhoneVerified || false,
            govtIdUrl: data.workerProfile?.govtIdUrl || '',
            liveSelfieUrl: data.workerProfile?.liveSelfieUrl || '',
            proofOfExperienceType: data.workerProfile?.proofOfExperienceType || '',
            proofOfExperienceUrl: data.workerProfile?.proofOfExperienceUrl || '',
            socialMediaUrl: data.workerProfile?.socialMediaUrl || '',
            referenceEvent: data.workerProfile?.referenceEvent || '',
            referenceContact: data.workerProfile?.referenceContact || '',
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

    fetch('/api/worker/applications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setApplications(data);
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

  const requiresTier2 = formData.tier === 'Tier 2';
  const requiresTier3 = formData.tier === 'Tier 3';
  
  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };
  const isUnderage = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) < 18 : false;

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFormData({...formData, categories: val ? [val] : []});
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.email || 'user'}_${field}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('worker-verifications')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('worker-verifications').getPublicUrl(filePath);
      setFormData({ ...formData, [field]: data.publicUrl });
    } catch (error: any) {
      console.error('Error uploading file:', error.message);
      alert('Error uploading file. Make sure your Supabase keys are set and the worker-verifications bucket exists.');
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  return (
    <div className="text-[#242424] w-full max-w-5xl mx-auto space-y-8 font-sans pb-12">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">Worker Profile</h1>
          <p className="text-gray-500 font-medium">Manage your skills, experience, and verification status.</p>
        </div>
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
                      {formData.name ? formData.name.charAt(0).toUpperCase() : 'W'}
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
                disabled={saving || loading || isUnderage} 
                className="bg-gradient-to-r from-[#242424] to-[#1a1a1a] hover:from-[#CD7F32] hover:to-[#a86524] text-white px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(205,127,50,0.3)] hover:-translate-y-1 disabled:opacity-50 disabled:hover:transform-none flex items-center gap-2"
              >
                {saving ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                ) : isUnderage ? 'Cannot Save' : 'Save Profile'}
              </button>
            </div>

            {/* Form Section */}
            <div className="pt-16 pb-8 px-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-gray-700">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Email Address</label>
                  <input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Mobile Number</label>
                  <input type="text" value={formData.mobile} onChange={e=>setFormData({...formData, mobile: e.target.value})} placeholder="+1 (555) 000-0000" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-700 mb-2 block">Role Applied For</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div>
                    <label className="text-xs font-bold text-[#CD7F32] mb-1 block">Select Tier</label>
                    <select 
                      value={formData.tier} 
                      onChange={e => setFormData({...formData, tier: e.target.value, categories: []})} 
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:border-[#CD7F32] outline-none text-sm"
                    >
                      <option value="">-- Choose Tier --</option>
                      {Object.keys(TIER_CATEGORIES).map(tier => (
                        <option key={tier} value={tier}>{tier}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#CD7F32] mb-1 block">Specific Role</label>
                    <select 
                      value={formData.categories[0] || ''} 
                      onChange={handleRoleChange}
                      disabled={!formData.tier}
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:border-[#CD7F32] outline-none text-sm disabled:opacity-50"
                    >
                      <option value="">-- Choose Role --</option>
                      {formData.tier && (TIER_CATEGORIES as any)[formData.tier].map((cat: string) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* TIER 1 VERIFICATION */}
              <div className="md:col-span-2 bg-[#fdfbf7] p-6 rounded-xl border border-[#e6decb] space-y-4">
                <h3 className="font-bold text-lg border-b border-[#e6decb] pb-2 text-[#8b6125]">Tier 1 Verification (Required for all)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700">Date of Birth</label>
                    <input type="date" value={formData.dateOfBirth} onChange={e=>setFormData({...formData, dateOfBirth: e.target.value})} className={`w-full bg-white border ${isUnderage ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none`} />
                    {isUnderage && <p className="text-red-500 text-xs mt-1 font-bold">You must be 18+ to work on Back Stage.</p>}
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700">Emergency Contact</label>
                    <input type="text" placeholder="Name & Phone" value={formData.emergencyContact} onChange={e=>setFormData({...formData, emergencyContact: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-gray-700">Phone Verification</label>
                    <div className="flex gap-2 mt-1">
                      <input type="text" disabled value={formData.mobile} placeholder="Enter your mobile number above first" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 outline-none text-gray-500" />
                      <button type="button" onClick={() => { if(formData.mobile) setFormData({...formData, isPhoneVerified: true}); else alert("Enter mobile number above first!"); }} className={`px-4 py-2 rounded-lg font-bold text-sm ${formData.isPhoneVerified ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-[#242424] text-white hover:bg-black transition-colors'}`}>
                        {formData.isPhoneVerified ? 'Verified ✓' : 'Verify via OTP'}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Government ID (Any)</label>
                    <div className={`relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white hover:bg-gray-50 transition-colors ${uploading['govtIdUrl'] ? 'opacity-50' : 'cursor-pointer'}`}>
                      {uploading['govtIdUrl'] ? <span className="text-blue-500 font-bold text-sm">Uploading...</span> : (formData.govtIdUrl ? <span className="text-green-600 font-bold text-sm">ID Uploaded ✓</span> : <span className="text-gray-500 text-sm">Click to upload ID</span>)}
                      <input type="file" disabled={uploading['govtIdUrl']} onChange={(e) => handleFileUpload(e, 'govtIdUrl')} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" accept="image/*,.pdf" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Live Selfie (Cam)</label>
                    <div className={`relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white hover:bg-gray-50 transition-colors ${uploading['liveSelfieUrl'] ? 'opacity-50' : 'cursor-pointer'}`}>
                      {uploading['liveSelfieUrl'] ? <span className="text-blue-500 font-bold text-sm">Uploading...</span> : (formData.liveSelfieUrl ? <span className="text-green-600 font-bold text-sm">Selfie Captured ✓</span> : <span className="text-gray-500 text-sm">Click to take selfie</span>)}
                      <input type="file" capture="user" disabled={uploading['liveSelfieUrl']} onChange={(e) => handleFileUpload(e, 'liveSelfieUrl')} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" accept="image/*" />
                    </div>
                  </div>
                </div>
              </div>

              {/* TIER 2 VERIFICATION */}
              {requiresTier2 && (
                <div className="md:col-span-2 bg-[#f5f8fc] p-6 rounded-xl border border-[#d6e4f5] space-y-4">
                  <h3 className="font-bold text-lg border-b border-[#d6e4f5] pb-2 text-[#3b6d9e]">Tier 2 Verification (Skilled Roles)</h3>
                  <p className="text-sm text-gray-600 mb-2">Please provide proof of relevant experience for your selected skilled roles.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">Proof Type</label>
                      <select value={formData.proofOfExperienceType} onChange={e=>setFormData({...formData, proofOfExperienceType: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none">
                        <option value="">Select Proof Type</option>
                        <option value="video_link">Link to Past Video</option>
                        <option value="social_handle">Insta/YT Handle</option>
                        <option value="intro_clip">30s Self-Recorded Intro Clip (Upload)</option>
                      </select>
                    </div>
                    <div>
                      {formData.proofOfExperienceType === 'intro_clip' ? (
                        <>
                          <label className="text-sm font-bold text-gray-700">Upload Intro Clip</label>
                          <div className={`relative border-2 border-dashed border-gray-300 rounded-lg p-2 mt-1 text-center bg-white hover:bg-gray-50 ${uploading['proofOfExperienceUrl'] ? 'opacity-50' : 'cursor-pointer'}`}>
                            {uploading['proofOfExperienceUrl'] ? <span className="text-blue-500 font-bold text-sm">Uploading...</span> : (formData.proofOfExperienceUrl ? <span className="text-green-600 font-bold text-sm">Clip Uploaded ✓</span> : <span className="text-gray-500 text-sm">Upload Video</span>)}
                            <input type="file" disabled={uploading['proofOfExperienceUrl']} onChange={(e) => handleFileUpload(e, 'proofOfExperienceUrl')} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" accept="video/*" />
                          </div>
                        </>
                      ) : (
                        <>
                          <label className="text-sm font-bold text-gray-700">Link / Handle</label>
                          <input type="text" placeholder="e.g. @myhandle or https://..." value={formData.proofOfExperienceUrl} onChange={e=>setFormData({...formData, proofOfExperienceUrl: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TIER 3 VERIFICATION */}
              {requiresTier3 && (
                <div className="md:col-span-2 bg-[#fff5f5] p-6 rounded-xl border border-[#f5d6d6] space-y-4">
                  <h3 className="font-bold text-lg border-b border-[#f5d6d6] pb-2 text-[#9e3b3b]">Tier 3 Verification (High Visibility Talent)</h3>
                  <p className="text-sm text-gray-600 mb-2">High visibility roles require background and reference checks.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">Active Social Media Link (Genuine Followers)</label>
                      <input type="text" placeholder="e.g. https://instagram.com/myprofile" value={formData.socialMediaUrl} onChange={e=>setFormData({...formData, socialMediaUrl: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-gray-700">Verifiable Past Event Name</label>
                        <input type="text" placeholder="e.g. Coachella 2023" value={formData.referenceEvent} onChange={e=>setFormData({...formData, referenceEvent: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700">Reference Contact (Client/Organizer)</label>
                        <input type="text" placeholder="Name & Phone number" value={formData.referenceContact} onChange={e=>setFormData({...formData, referenceContact: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="md:col-span-2">
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
                <input type="text" value={formData.rates} onChange={e=>setFormData({...formData, rates: e.target.value})} placeholder="e.g. ₹30/hr or ₹250/day" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
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
            
            <div className="pt-8 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={saving || isUnderage} className="bg-gradient-to-r from-[#242424] to-[#1a1a1a] hover:from-[#CD7F32] hover:to-[#a86524] text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:transform-none">
                {saving ? 'Saving...' : (isUnderage ? 'Cannot Save (Under 18)' : 'Save Profile')}
              </button>
            </div>
              </form>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="pt-4">
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
                <p className="text-gray-500 text-sm max-w-sm mx-auto">Once you complete events, managers you work for can leave reviews about their experience with you.</p>
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
              Event History
            </h3>
            
            {applications.filter(app => app.status === 'ACCEPTED').length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm italic font-medium">No event history.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications
                  .filter(app => app.status === 'ACCEPTED')
                  .slice(0, 8)
                  .map(app => {
                    const eventStatus = app.staffingRequest?.event?.status;
                    const isLive = eventStatus === 'ONGOING';
                    return (
                      <div key={app.id} className="bg-white p-3 rounded-2xl border border-[#EAE6DF] shadow-sm flex flex-col gap-2 hover:border-[#CD7F32] hover:shadow-md transition-all duration-300">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm truncate">{app.staffingRequest?.event?.title}</h4>
                            <p className="text-xs text-[#CD7F32] font-bold uppercase tracking-widest mt-0.5">{app.staffingRequest?.roleName}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                          {isLive ? (
                            <span className="bg-green-50 text-green-600 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                              Active Now
                            </span>
                          ) : (
                            <span className="bg-gray-50 text-gray-500 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border border-gray-100">
                              {eventStatus || 'PAST'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
