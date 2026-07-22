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
    <div className="text-[#242424] max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">My Profile</h1>
        <p className="text-lg text-gray-700">Manage your skills, experience, and verification status</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#EAE6DF] overflow-hidden">
        {loading ? (
          <div className="p-8 text-gray-500">Loading profile...</div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="h-32 bg-gradient-to-r from-[#242424] to-[#CD7F32]/80 relative">
              <div className="absolute -bottom-12 left-8">
                <div className="relative w-24 h-24 rounded-full border-4 border-white bg-[#CD7F32] flex items-center justify-center shadow-md overflow-hidden bg-cover bg-center group" style={{ backgroundImage: formData.avatarUrl ? `url(${formData.avatarUrl})` : 'none' }}>
                  {!formData.avatarUrl && (
                    <span className="text-3xl font-bold text-white">
                      {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'T'}
                    </span>
                  )}
                  <label htmlFor="avatarUpload" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer text-white">
                    <Camera size={20} className="mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
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
                        reader.onloadend = () => {
                          setFormData({ ...formData, avatarUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>
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
            
            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={saving || isUnderage} className="px-8 py-3 bg-[#CD7F32] text-white font-bold rounded-lg hover:bg-[#a06227] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? 'Saving...' : (isUnderage ? 'Cannot Save (Under 18)' : 'Save Profile')}
              </button>
            </div>
              </form>
            </div>
          </>
        )}
      </div>

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

      {/* Event History Section */}
      <div className="mt-12 mb-12">
        <h2 className="text-2xl font-bold font-serif mb-6">My Event History</h2>
        {applications.filter(app => app.status === 'ACCEPTED').length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-100 text-center text-gray-500 italic">
            You haven't worked any events yet. Check out the dashboard to find jobs!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications
              .filter(app => app.status === 'ACCEPTED')
              .map(app => {
                const eventStatus = app.staffingRequest?.event?.status;
                const isLive = eventStatus === 'ONGOING';
                return (
                  <div key={app.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-[#CD7F32] transition-colors cursor-default">
                    <div>
                      <h4 className="font-bold text-gray-900 line-clamp-1">{app.staffingRequest?.event?.title}</h4>
                      <p className="text-sm text-gray-500 font-medium mt-1">{app.staffingRequest?.roleName}</p>
                    </div>
                    <div>
                      {isLive ? (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          LIVE NOW
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
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
  );
}
