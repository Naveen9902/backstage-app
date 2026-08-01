'use client';
import { apiFetch } from '@/lib/apiFetch';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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

const calculateAge = (dob: string) => {
  const diffMs = Date.now() - new Date(dob).getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
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
    rating: 0,
    verificationStatus: 'PENDING',
    requestedTier: '',
    originalTier: '',
    originalCategories: [] as string[],
    location: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [inAppNotifs, setInAppNotifs] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verifyingTier, setVerifyingTier] = useState(false);
  const [showTierForm, setShowTierForm] = useState(false);

  useEffect(() => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/profile`)
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
            rating: data.workerProfile?.rating || 0,
            verificationStatus: data.workerProfile?.verificationStatus || 'PENDING',
            requestedTier: data.workerProfile?.requestedTier || '',
            originalTier: data.workerProfile?.tier || '',
            originalCategories: data.workerProfile?.categories || [],
            location: data.workerProfile?.location || ''
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reviews?type=received`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
      });

    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/applications`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setApplications(data);
      });

    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.notificationsEnabled !== undefined) {
          setInAppNotifs(data.notificationsEnabled);
        }
      })
      .catch(err => console.error('Failed to load settings', err));
  }, []);

  // Poll for verification approval
  useEffect(() => {
    if (formData.verificationStatus === 'PENDING') {
      const intervalId = setInterval(() => {
        apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/profile`, { cache: 'no-store' })
          .then(res => res.json())
          .then(data => {
            if (data && !data.error && data.workerProfile) {
              if (data.workerProfile.verificationStatus !== 'PENDING') {
                setFormData(prev => ({
                  ...prev,
                  verificationStatus: data.workerProfile.verificationStatus,
                  isVerified: data.workerProfile.isVerified,
                  tier: data.workerProfile.tier
                }));
                if (data.workerProfile.verificationStatus === 'APPROVED') {
                  alert('🎉 Your profile has been verified!');
                }
              }
            }
          }).catch(() => {});
      }, 3000);
      return () => clearInterval(intervalId);
    }
  }, [formData.verificationStatus]);

  const handleToggleInApp = async () => {
    const newVal = !inAppNotifs;
    setInAppNotifs(newVal);
    try {
      await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationsEnabled: newVal })
      });
    } catch (error) {
      console.error('Failed to update settings', error);
      setInAppNotifs(!newVal);
    }
  };



  const [agreements, setAgreements] = useState({
    infoAccurate: false,
    guidelines: false,
    bgCheck: false
  });

  const handleSendOtp = async () => {
    if (!formData.mobile) {
      alert("Enter a mobile number above first!");
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/phone/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.mobile })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        if (data.mockOtp) {
          alert("SIMULATION MODE: Your OTP is " + data.mockOtp);
          setOtpCode(data.mockOtp);
        } else {
          alert("OTP sent! Check your phone.");
        }
      } else {
        alert(data.error || "Failed to send OTP");
      }
    } catch (e) {
      alert("An error occurred sending OTP.");
    }
    setVerifyingOtp(false);
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      alert("Enter the OTP code!");
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/phone/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.mobile, code: otpCode })
      });
      const data = await res.json();
      if (data.success) {
        setFormData({ ...formData, isPhoneVerified: true });
        setOtpSent(false);
        setOtpCode('');
        alert("Phone Verified! Don't forget to Save your Profile at the bottom of the page.");
      } else {
        alert(data.error || "Invalid OTP");
      }
    } catch (e) {
      alert("An error occurred verifying OTP.");
    }
    setVerifyingOtp(false);
  };

  const handleApplyForVerification = async () => {
    setVerifyingTier(true);
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requestedTier: formData.tier,
          verificationStatus: 'PENDING'
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setFormData(prev => ({ ...prev, verificationStatus: 'PENDING', requestedTier: formData.tier }));
        alert('Sent for verification!');
        window.dispatchEvent(new Event('profileUpdated'));
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to submit for verification: ${errData.details || res.statusText}`);
      }
    } catch (e) {
      alert('An error occurred submitting for verification.');
    }
    setVerifyingTier(false);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requestedTier: (!formData.isVerified || formData.verificationStatus === 'PENDING' || isTierUpgradeOrRoleChange) ? formData.tier : formData.requestedTier
        })
      });
        if (res.ok) {
          const updated = await res.json();
          setFormData(prev => ({ ...prev, verificationStatus: updated.workerProfile?.verificationStatus || prev.verificationStatus, requestedTier: updated.workerProfile?.requestedTier || prev.requestedTier }));
          alert('Profile updated successfully!');
          window.dispatchEvent(new Event('profileUpdated'));
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(`Failed to update profile: ${errData.details || res.statusText}`);
        }
    } catch (err) {
      setMessage('An error occurred.');
    }
    setSaving(false);
  };

  const isUnderage = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) < 18 : false;
  
  const requiresTier1 = formData.tier === 'Tier 1';
  const isTier1Complete = agreements.infoAccurate && agreements.guidelines && agreements.bgCheck;
  const isSaveDisabled = saving || loading || isUnderage || (!formData.isVerified && !isTier1Complete);
  const isTierUpgradeOrRoleChange = formData.tier !== formData.originalTier || (['Tier 2', 'Tier 3'].includes(formData.tier) && JSON.stringify(formData.categories) !== JSON.stringify(formData.originalCategories));

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFormData({...formData, categories: val ? [val] : []});
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "yyfxsrjb";
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "zzfkegyd";
      
      if (!cloudName || !uploadPreset) throw new Error("Cloudinary not configured");

      let fileToUpload: File | Blob = file;
      if (file.type.startsWith('image/')) {
        const imageCompression = (await import('browser-image-compression')).default;
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        fileToUpload = await imageCompression(file, options);
      }

      // Convert to base64 to avoid CapacitorHttp Blob bugs on Android
      const base64File = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(fileToUpload);
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      const uploadData = new FormData();
      uploadData.append('file', base64File);
      uploadData.append('upload_preset', uploadPreset);
      
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

      const res = await fetch(url, {
        method: 'POST',
        body: uploadData,
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error?.message || 'Failed to upload to Cloudinary');

      setFormData({ ...formData, [field]: data.secure_url });
    } catch (error: any) {
      console.error('Error uploading file:', error.message);
      alert(`Error uploading file: ${error.message}. Please check your internet connection and try again.`);
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

            {/* Avatar, Trust Score & Action Row */}
            <div className="px-8 flex flex-col sm:flex-row justify-between items-start sm:items-end relative -mt-16 sm:-mt-20 mb-8 z-10 gap-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                <div className="relative mb-4 sm:mb-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 sm:border-[6px] border-white bg-gradient-to-br from-[#CD7F32] to-[#8a5522] shadow-2xl flex items-center justify-center overflow-hidden group/avatar cursor-pointer relative z-10 transition-transform duration-500 hover:scale-105" style={{ backgroundImage: formData.avatarUrl ? `url(${formData.avatarUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  {!formData.avatarUrl && (
                    <span className="text-5xl sm:text-6xl font-black text-white mix-blend-overlay shadow-sm">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : 'W'}
                    </span>
                  )}
                  <label htmlFor="avatarUpload" className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-[2px] cursor-pointer text-white">
                    <Camera size={28} className="mb-2 scale-75 group-hover/avatar:scale-100 transition-transform duration-300" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Change Image</span>
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

              {/* Gamified Trust Score */}
              <div className="bg-white p-3 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-[#CD7F32] animate-[strokeDash_2s_ease-out_forwards]" strokeWidth="3" strokeDasharray="98, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="absolute text-lg font-black text-gray-900">98</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Trust Score</p>
                  <p className="text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Gold Tier
                  </p>
                </div>
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
                <div>
                  <label className="text-sm font-bold text-gray-700">Location</label>
                  <input type="text" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} placeholder="e.g. Mumbai, India" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                </div>
              

              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between mt-6">
                <div>
                  <h3 className="font-bold text-gray-800">In-App Notifications</h3>
                  <p className="text-sm text-gray-500">Receive alerts when your applications are accepted, when you get a new review, etc.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={inAppNotifs} onChange={handleToggleInApp} />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#CD7F32]"></div>
                </label>
              </div>

              <div className="md:col-span-2">
              </div>
            

            
            <div className="pt-8 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={saving || loading || isUnderage} className="bg-gradient-to-r from-[#242424] to-[#1a1a1a] hover:from-[#CD7F32] hover:to-[#a86524] text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:transform-none flex items-center gap-2">
                {saving ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                ) : isUnderage ? 'Cannot Save (Under 18)' : 'Save Profile'}
              </button>
            </div>
              </form>
            </div>
          </div>

          {/* NEW TIER & VERIFICATION BOX */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EAE6DF] mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-2">Tier & Verification</h2>
                <p className="text-gray-500 font-medium">Verify your identity and unlock higher tiers to access better paying roles.</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {formData.isVerified ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest bg-green-100 text-green-700 flex items-center gap-1.5 border border-green-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      {formData.tier} Verified
                    </span>
                    {formData.verificationStatus === 'PENDING' && formData.requestedTier && formData.requestedTier !== formData.tier && (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Upgrade to {formData.requestedTier} Pending</span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest bg-gray-100 text-gray-600 flex items-center gap-1.5 border border-gray-200">
                      Not Verified
                    </span>
                    {formData.verificationStatus === 'PENDING' && (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Verification Pending</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-6 pt-6 border-t border-gray-100">
              {!showTierForm ? (
                <div className="flex justify-center py-4">
                  <button 
                    type="button" 
                    onClick={() => setShowTierForm(true)}
                    className="bg-[#CD7F32] hover:bg-[#a86524] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
                  >
                    Apply for Tier Upgrade / Verification
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-2">
                    <button 
                      type="button" 
                      onClick={() => setShowTierForm(false)}
                      className="text-sm font-bold text-gray-500 hover:text-gray-700 underline"
                    >
                      Hide Form
                    </button>
                  </div>
                  {/* Role Selection */}
                  <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Select Target Tier</label>
                <select 
                  value={formData.tier} 
                  onChange={e => setFormData({...formData, tier: e.target.value, categories: []})} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:border-[#CD7F32] outline-none font-medium"
                >
                  <option value="">-- Choose Tier --</option>
                  {Object.keys(TIER_CATEGORIES).map(tier => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
              </div>

              {formData.tier && (
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Specific Role(s)</label>
                  {formData.tier === 'Tier 1' ? (
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-3">
                      {TIER_CATEGORIES['Tier 1'].map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.categories.includes(cat)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({...formData, categories: [...formData.categories, cat]});
                              } else {
                                setFormData({...formData, categories: formData.categories.filter(c => c !== cat)});
                              }
                            }}
                            className="text-[#CD7F32] focus:ring-[#CD7F32]"
                          />
                          <span className="text-sm text-gray-700 font-medium">{cat}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <select 
                      value={formData.categories[0] || ''} 
                      onChange={handleRoleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:border-[#CD7F32] outline-none font-medium"
                    >
                      <option value="">-- Choose Role --</option>
                      {(TIER_CATEGORIES[formData.tier as keyof typeof TIER_CATEGORIES] || []).map((cat: string) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Requirements Box */}
              {formData.tier && (
                <div className="bg-[#fdfbf7] p-6 rounded-xl border border-[#e6decb] space-y-4">
                  <>
                    <h3 className="font-bold text-lg border-b border-[#e6decb] pb-2 text-[#8b6125]">Basic Verification (Required for all Tiers)</h3>
                    
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
                          <label className="text-sm font-bold text-gray-700">Phone Verification (Required)</label>
                          <div className="flex flex-col sm:flex-row gap-2 mt-1">
                            <input type="text" disabled value={formData.mobile} placeholder="Enter your mobile number above first" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 outline-none text-gray-500" />
                            {formData.isPhoneVerified ? (
                              <span className="px-6 py-2 rounded-lg font-bold text-sm bg-green-100 text-green-700 border border-green-200 flex items-center justify-center">Verified ✓</span>
                            ) : (
                              <button type="button" disabled={verifyingOtp || otpSent} onClick={handleSendOtp} className="px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap bg-[#242424] text-white hover:bg-black transition-colors disabled:opacity-50">
                                {verifyingOtp ? 'Sending...' : (otpSent ? 'OTP Sent' : 'Send OTP')}
                              </button>
                            )}
                          </div>
                          
                          {otpSent && !formData.isPhoneVerified && (
                            <div className="flex flex-col sm:flex-row gap-2 mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                              <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="Enter 6-digit OTP" className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-[#CD7F32]" />
                              <button type="button" disabled={verifyingOtp} onClick={handleVerifyOtp} className="px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap bg-[#CD7F32] text-white hover:bg-[#a86524] transition-colors disabled:opacity-50">
                                {verifyingOtp ? 'Verifying...' : 'Verify Code'}
                              </button>
                            </div>
                          )}
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
                    </>
                  
                  {/* Professional Requirements (Tier 2/3) */}
                  {formData.tier === 'Tier 2' && (
                    <div className="pt-2">
                      <h3 className="font-bold text-lg border-b border-[#e6decb] pb-2 mb-4 text-[#8b6125]">Tier 2 Requirements (Professional Details)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-sm font-bold text-gray-700">Specialization</label>
                          <input type="text" value={formData.specialization} onChange={e=>setFormData({...formData, specialization: e.target.value})} placeholder="e.g. Stage Manager, Lighting Tech" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-sm font-bold text-gray-700">Skills & Keywords</label>
                          <input type="text" value={formData.skills} onChange={e=>setFormData({...formData, skills: e.target.value})} placeholder="e.g. Ableton, Rigging, First Aid" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-sm font-bold text-gray-700">Experience / Bio</label>
                          <textarea rows={3} value={formData.experience} onChange={e=>setFormData({...formData, experience: e.target.value})} placeholder="Describe your relevant event experience..." className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none"></textarea>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Elite Requirements (Tier 3) */}
                  {formData.tier === 'Tier 3' && (
                    <div className="pt-2">
                      <h3 className="font-bold text-lg border-b border-[#e6decb] pb-2 mb-4 text-[#8b6125]">Tier 3 Requirements (Elite Portfolio)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-sm font-bold text-gray-700">Past Work (Notable Events)</label>
                          <textarea rows={2} value={formData.pastWork} onChange={e=>setFormData({...formData, pastWork: e.target.value})} placeholder="e.g. Coachella 2023, Local Food Market" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none"></textarea>
                        </div>

                        <div>
                          <label className="text-sm font-bold text-gray-700">Standard Rates</label>
                          <input type="text" value={formData.rates} onChange={e=>setFormData({...formData, rates: e.target.value})} placeholder="e.g. ₹30/hr or ₹250/day" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-gray-700">Portfolio / Social Links</label>
                          <input type="text" value={formData.portfolioLinks} onChange={e=>setFormData({...formData, portfolioLinks: e.target.value})} placeholder="LinkedIn, Instagram, Website..." className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                        </div>
                      </div>
                    </div>
                  )}


                  <div className="md:col-span-2 mt-4 space-y-3 bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-sm text-gray-800 mb-2">Required Agreements</h4>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={agreements.infoAccurate} onChange={e=>setAgreements({...agreements, infoAccurate: e.target.checked})} className="mt-1 w-4 h-4 text-[#CD7F32] focus:ring-[#CD7F32]" />
                      <span className="text-sm text-gray-700">I confirm that all information provided is accurate and true.</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={agreements.guidelines} onChange={e=>setAgreements({...agreements, guidelines: e.target.checked})} className="mt-1 w-4 h-4 text-[#CD7F32] focus:ring-[#CD7F32]" />
                      <span className="text-sm text-gray-700">I have read and agree to the Back Stage Worker Guidelines.</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={agreements.bgCheck} onChange={e=>setAgreements({...agreements, bgCheck: e.target.checked})} className="mt-1 w-4 h-4 text-[#CD7F32] focus:ring-[#CD7F32]" />
                      <span className="text-sm text-gray-700">I consent to a basic background check for identity verification.</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button 
                  onClick={handleApplyForVerification}
                  disabled={verifyingTier || isUnderage || !isTier1Complete || formData.categories.length === 0}
                  className="bg-[#CD7F32] hover:bg-[#a86524] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {verifyingTier ? 'Submitting...' : 'Apply for Verification'}
                </button>
              </div>
            </>
            )}
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
        {/* SMALL DELETE BUTTON */}
        <div className="lg:col-span-3 mt-4 mb-8 flex justify-end">
          <Link href="/delete-account" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-sm border border-red-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            Delete Account
          </Link>
        </div>

      </div>
    </div>
  );
}
