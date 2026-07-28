'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Film, Image as ImageIcon, Sparkles, MapPin, Calendar, Clock, Globe, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function CreateEvent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    location: '',
    description: '',
    coverImageUrl: '',
    videoUrl: '',
    attendeeCategory: 'Music & entertainment',
    tags: '',
    language: 'English',
    duration: '2 Hours',
    bands: '',
    socialLink: '',
    artistAvatarUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/manager/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        router.push('/manager/my-events');
      } else {
        setError(data.error || 'Failed to create event');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
    setLoading(false);
  };

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#CD7F32] focus:ring-4 focus:ring-[#CD7F32]/20 transition-all text-sm text-white placeholder-gray-500 hover:border-white/20";
  const labelClasses = "text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImageUrl' | 'videoUrl' | 'artistAvatarUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative text-white min-h-screen bg-[#050505] overflow-x-hidden font-sans selection:bg-[#CD7F32]/30">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#CD7F32]/10 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#CD7F32]/5 blur-[120px] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

      {/* Navbar Minimal */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/manager/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-[#CD7F32] bg-[#CD7F32]/10 px-4 py-1.5 rounded-full border border-[#CD7F32]/20 shadow-[0_0_15px_rgba(205,127,50,0.15)]">
            <Sparkles className="w-3.5 h-3.5" />
            Premium Event Builder
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        
        {/* Header section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mb-12"
        >
          <h1 className="text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
            Create an Experience.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Design a stunning landing page for your upcoming event. This page will be visible to your attendees, guests, and staff members.
          </p>
        </motion.div>

        <div className="flex flex-col-reverse xl:grid xl:grid-cols-12 gap-12 items-start">
          
          {/* Form Side (7 cols) */}
          <div className="xl:col-span-7 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111111]/80 backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden"
            >
              {/* Subtle top border gradient */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#CD7F32] to-transparent opacity-50" />
              
              {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Section 1: Core Details */}
                <div>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs text-gray-300">1</span>
                    Core Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    
                    <div className="md:col-span-2 group">
                      <label className={labelClasses}>Event Title <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className={`${inputClasses} text-lg font-bold placeholder-gray-600`} 
                        placeholder="e.g. Arijit Singh Live in Concert" 
                      />
                    </div>

                    <div>
                      <label className={labelClasses}>Category <span className="text-red-500">*</span></label>
                      <select 
                        value={formData.attendeeCategory}
                        onChange={e => setFormData({...formData, attendeeCategory: e.target.value})}
                        className={`${inputClasses} appearance-none cursor-pointer [&>option]:bg-[#1a1a1a]`}
                      >
                        <option value="Campus fests & culture nights">Campus fests & culture nights</option>
                        <option value="Hackathons & tech meets">Hackathons & tech meets</option>
                        <option value="Workshops & skill-ups">Workshops & skill-ups</option>
                        <option value="Corporate & networking">Corporate & networking</option>
                        <option value="Career & job fairs">Career & job fairs</option>
                        <option value="Music & entertainment">Music & entertainment</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClasses}>Location / Venue <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type="text" 
                          required
                          value={formData.location}
                          onChange={e => setFormData({...formData, location: e.target.value})}
                          className={`${inputClasses} pl-11`} 
                          placeholder="e.g. Jio World Garden, Mumbai" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-white/5" />

                {/* Section 2: Date & Time */}
                <div>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs text-gray-300">2</span>
                    Date & Time
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className={labelClasses}>Event Date <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type="date" 
                          required
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                          className={`${inputClasses} pl-11 [color-scheme:dark]`} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClasses}>Start Time <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type="time" 
                          required
                          value={formData.startTime}
                          onChange={e => setFormData({...formData, startTime: e.target.value})}
                          className={`${inputClasses} pl-11 [color-scheme:dark]`} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClasses}>Duration</label>
                      <input 
                        type="text" 
                        value={formData.duration}
                        onChange={e => setFormData({...formData, duration: e.target.value})}
                        className={inputClasses} 
                        placeholder="e.g. 3 Hours" 
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-white/5" />

                {/* Section 3: Media & Graphics */}
                <div>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs text-gray-300">3</span>
                    Media & Graphics
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className={labelClasses}>Event Poster / Cover Image</label>
                      <div className="relative group cursor-pointer">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CD7F32] group-hover:scale-110 transition-transform" />
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'coverImageUrl')}
                          className={`${inputClasses} pl-12 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#CD7F32] file:text-white hover:file:bg-[#a06227] cursor-pointer file:cursor-pointer file:transition-colors`} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClasses}>Teaser Video <span className="text-gray-500 normal-case tracking-normal ml-2 font-normal">(Optional)</span></label>
                      <div className="relative group cursor-pointer">
                        <Film className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:scale-110 transition-transform" />
                        <input 
                          type="file" 
                          accept="video/*"
                          onChange={(e) => handleFileUpload(e, 'videoUrl')}
                          className={`${inputClasses} pl-12 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer file:cursor-pointer file:transition-colors`} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-white/5" />

                {/* Section 4: Extra Details */}
                <div>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs text-gray-300">4</span>
                    Extra Details
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className={labelClasses}>Featured Artists / Guests</label>
                      <input 
                        type="text" 
                        value={formData.bands}
                        onChange={e => setFormData({...formData, bands: e.target.value})}
                        className={inputClasses} 
                        placeholder="e.g. Coldplay, Beyonce" 
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Artist/Guest Image (Optional)</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'artistAvatarUrl')}
                        className={`${inputClasses} file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white cursor-pointer`} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className={labelClasses}>Tags / Genre</label>
                      <input 
                        type="text" 
                        value={formData.tags}
                        onChange={e => setFormData({...formData, tags: e.target.value})}
                        className={inputClasses} 
                        placeholder="e.g. Pop, Live (comma-separated)" 
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Language</label>
                      <input 
                        type="text" 
                        value={formData.language}
                        onChange={e => setFormData({...formData, language: e.target.value})}
                        className={inputClasses} 
                        placeholder="e.g. English" 
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className={labelClasses}>Social Link</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        type="url" 
                        value={formData.socialLink}
                        onChange={e => setFormData({...formData, socialLink: e.target.value})}
                        className={`${inputClasses} pl-11`} 
                        placeholder="https://instagram.com/..." 
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Description <span className="text-red-500">*</span></label>
                    <textarea 
                      rows={5} 
                      required
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className={`${inputClasses} resize-none leading-relaxed`} 
                      placeholder="Describe the experience, schedule, and what attendees can expect..."
                    ></textarea>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-8 mt-4 flex items-center justify-end gap-4 border-t border-white/5">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full md:w-auto px-10 py-4 bg-[#CD7F32] hover:bg-[#b06a25] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(205,127,50,0.4)] hover:shadow-[0_0_30px_rgba(205,127,50,0.6)] transition-all disabled:opacity-50 text-sm active:scale-95 flex items-center justify-center gap-2 border border-[#CD7F32]/50"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Creating Event...
                      </>
                    ) : (
                      <>
                        Publish Event <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right Preview Card (5 cols) */}
          <div className="xl:col-span-5 sticky top-28 space-y-4 w-full perspective-[1000px]">
            <motion.div
              initial={{ opacity: 0, rotateY: -10, x: 20 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className="bg-[#1a1a1a] rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative"
            >
              {/* Glossy overlay reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />

              {/* Aspect Ratio Banner */}
              <div className="aspect-[16/9] bg-[#0f0f0f] relative overflow-hidden flex items-center justify-center border-b border-white/5">
                {formData.coverImageUrl ? (
                  <motion.img 
                    key={formData.coverImageUrl}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    src={formData.coverImageUrl} 
                    alt="Live Cover Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-600 gap-3">
                    <ImageIcon className="w-12 h-12" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Poster Preview</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 z-10">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-xl uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Live Preview
                  </span>
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-8 space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#CD7F32] bg-[#CD7F32]/10 border border-[#CD7F32]/20 px-3 py-1 rounded-full">
                      {formData.attendeeCategory.split(' ')[0]}
                    </span>
                    {formData.language && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                        {formData.language}
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-3xl text-white leading-tight line-clamp-2">
                    {formData.title || 'Your Awesome Event Title'}
                  </h3>
                  <p className="text-sm text-gray-400 mt-3 line-clamp-3 leading-relaxed">
                    {formData.description || 'Add a compelling description to attract attendees and staff. This preview updates in real-time as you type.'}
                  </p>
                </div>

                {/* Location & Time Grid */}
                <div className="bg-black/40 rounded-2xl p-4 grid grid-cols-2 gap-4 text-xs font-medium text-gray-300 border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-[#CD7F32]">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="truncate">{formData.date ? new Date(formData.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Select Date'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-[#CD7F32]">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="truncate">{formData.startTime || 'Time'} {formData.duration && `(${formData.duration})`}</span>
                  </div>
                  <div className="flex items-center gap-3 col-span-2">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-[#CD7F32]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="line-clamp-1">{formData.location || 'Venue / City'}</span>
                  </div>
                </div>

                {/* Video Player Preview */}
                {formData.videoUrl && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Film className="w-3.5 h-3.5" /> Teaser Video
                    </h4>
                    <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-lg border border-white/10">
                      <video 
                        src={formData.videoUrl} 
                        className="w-full h-full object-cover" 
                        controls 
                        muted
                        key={formData.videoUrl} 
                      />
                    </div>
                  </div>
                )}

                {/* Artists Preview */}
                {formData.bands && (
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" /> Featuring
                    </h4>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {formData.bands.split(',').map((band, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 shrink-0 w-[72px]">
                          <div className="w-[60px] h-[60px] rounded-full bg-[#222] shadow-xl border border-white/20 overflow-hidden relative group">
                            <img 
                              src={(formData as any).artistAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(band.trim())}&background=111&color=fff`}
                              alt={band}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <span className="text-[10px] text-gray-300 font-bold truncate w-full text-center leading-tight">
                            {band.trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
