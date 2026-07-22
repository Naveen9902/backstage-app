'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Film, Image as ImageIcon, Sparkles, MapPin, Calendar, Clock, Globe } from 'lucide-react';

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
    bands: ''
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

  const inputClasses = "w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#CD7F32] focus:ring-4 focus:ring-[#CD7F32]/10 transition-all text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.03)] hover:border-[#CD7F32]/40";
  const labelClasses = "text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block";

  return (
    <div className="relative text-[#242424] min-h-screen overflow-hidden pb-20">
      {/* Background Blooms */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#CD7F32]/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-[-200px] w-[500px] h-[500px] bg-[#CD7F32]/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 pt-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <Link href="/manager/dashboard" className="text-gray-500 hover:text-[#CD7F32] transition-colors p-2.5 bg-white shadow-sm hover:shadow-md border border-gray-100 rounded-xl group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <div>
              <h1 className="text-4xl font-bold font-serif tracking-tight mb-1 text-gray-900">Create New Event</h1>
              <p className="text-gray-500 text-sm">Design a beautiful, premium page for your fans and staff.</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[#CD7F32] bg-[#CD7F32]/10 px-4 py-2 rounded-full border border-[#CD7F32]/20 shadow-sm">
            <Sparkles className="w-4 h-4" />
            Premium Event Builder
          </div>
        </motion.div>

        <div className="flex flex-col-reverse xl:grid xl:grid-cols-12 gap-10 items-start">
          
          {/* Left Form (7 cols) */}
          <div className="xl:col-span-7 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#CD7F32] to-[#ffb163]" />
              
              {error && (
                <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                  
                  {/* Event Title */}
                  <div className="md:col-span-2">
                    <label className={labelClasses}>Event Title <span className="text-red-400">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className={inputClasses + " text-lg font-medium"} 
                      placeholder="e.g. Arijit Singh Live in Concert" 
                    />
                  </div>

                  {/* Attendee Category */}
                  <div>
                    <label className={labelClasses}>Category <span className="text-red-400">*</span></label>
                    <select 
                      value={formData.attendeeCategory}
                      onChange={e => setFormData({...formData, attendeeCategory: e.target.value})}
                      className={inputClasses + " appearance-none cursor-pointer"}
                    >
                      <option value="Campus fests & culture nights">Campus fests & culture nights</option>
                      <option value="Hackathons & tech meets">Hackathons & tech meets</option>
                      <option value="Workshops & skill-ups">Workshops & skill-ups</option>
                      <option value="Corporate & networking">Corporate & networking</option>
                      <option value="Career & job fairs">Career & job fairs</option>
                      <option value="Music & entertainment">Music & entertainment</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className={labelClasses}>Location / Venue <span className="text-red-400">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className={inputClasses} 
                      placeholder="e.g. Jio World Garden, Mumbai" 
                    />
                  </div>

                  {/* Event Date */}
                  <div>
                    <label className={labelClasses}>Event Date <span className="text-red-400">*</span></label>
                    <input 
                      type="date" 
                      required
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className={inputClasses} 
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className={labelClasses}>Start Time (24h) <span className="text-red-400">*</span></label>
                    <input 
                      type="time" 
                      required
                      value={formData.startTime}
                      onChange={e => setFormData({...formData, startTime: e.target.value})}
                      className={inputClasses} 
                    />
                  </div>

                  {/* Duration */}
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

                  {/* Language */}
                  <div>
                    <label className={labelClasses}>Language</label>
                    <input 
                      type="text" 
                      value={formData.language}
                      onChange={e => setFormData({...formData, language: e.target.value})}
                      className={inputClasses} 
                      placeholder="e.g. English, Hindi" 
                    />
                  </div>

                  {/* Tags */}
                  <div className="md:col-span-2">
                    <label className={labelClasses}>Tags / Genre</label>
                    <input 
                      type="text" 
                      value={formData.tags}
                      onChange={e => setFormData({...formData, tags: e.target.value})}
                      className={inputClasses} 
                      placeholder="e.g. Pop, Bollywood, Live (comma-separated)" 
                    />
                  </div>

                  <div className="md:col-span-2 my-2 border-t border-gray-100"></div>

                  {/* Featured Artists / Guests */}
                  <div>
                    <label className={labelClasses}>Featured Artists / Speakers</label>
                    <input 
                      type="text" 
                      value={formData.bands}
                      onChange={e => setFormData({...formData, bands: e.target.value})}
                      className={inputClasses} 
                      placeholder="e.g. Coldplay, Beyonce" 
                    />
                  </div>

                  {/* Artist Profile Image URL */}
                  <div>
                    <label className={labelClasses}>Artist Avatar URL</label>
                    <input 
                      type="url" 
                      value={(formData as any).artistAvatarUrl || ''}
                      onChange={e => setFormData({...formData, artistAvatarUrl: e.target.value} as any)}
                      className={inputClasses} 
                      placeholder="https://..." 
                    />
                  </div>

                  <div className="md:col-span-2 my-2 border-t border-gray-100"></div>

                  {/* Cover Image URL */}
                  <div className="md:col-span-2">
                    <label className={labelClasses}>Event Poster / Cover Image URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="url" 
                        value={formData.coverImageUrl}
                        onChange={e => setFormData({...formData, coverImageUrl: e.target.value})}
                        className={inputClasses + " pl-12"} 
                        placeholder="https://images.unsplash.com/..." 
                      />
                    </div>
                  </div>

                  {/* Video URL */}
                  <div className="md:col-span-2">
                    <label className={labelClasses}>Teaser Video URL</label>
                    <div className="relative">
                      <Film className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="url" 
                        value={formData.videoUrl}
                        onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                        className={inputClasses + " pl-12"} 
                        placeholder="https://www.w3schools.com/html/mov_bbb.mp4" 
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className={labelClasses}>Description <span className="text-red-400">*</span></label>
                    <textarea 
                      rows={4} 
                      required
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className={inputClasses + " resize-none leading-relaxed"} 
                      placeholder="Describe the experience, schedule, and what attendees can expect..."
                    ></textarea>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 mt-4 flex justify-end gap-4 border-t border-gray-100">
                  <Link href="/manager/dashboard" className="px-6 py-3.5 font-bold text-gray-500 hover:text-gray-900 transition-colors inline-block text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
                    Cancel
                  </Link>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-10 py-3.5 bg-gradient-to-r from-[#CD7F32] to-[#ffb163] text-white font-bold rounded-xl hover:shadow-[0_10px_20px_rgba(205,127,50,0.3)] transition-all disabled:opacity-50 text-sm active:scale-95 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Creating...
                      </>
                    ) : 'Publish Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right Preview Card (5 cols) */}
          <div className="xl:col-span-5 sticky top-8 space-y-4 w-full">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] border border-gray-100/50 overflow-hidden shadow-[0_20px_60px_-15px_rgba(205,127,50,0.15)] ring-1 ring-black/5"
            >
              {/* Aspect Ratio Banner */}
              <div className="aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden flex items-center justify-center">
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
                  <div className="flex flex-col items-center text-gray-400/80 gap-2">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-xs font-bold uppercase tracking-widest">Poster Preview</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md text-[#CD7F32] uppercase shadow-sm border border-white/20">
                    Live Preview
                  </span>
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#CD7F32] bg-[#CD7F32]/10 px-2.5 py-1 rounded-md">
                      {formData.attendeeCategory.split(' ')[0]}
                    </span>
                    {formData.language && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                        {formData.language}
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-2xl text-gray-900 leading-tight line-clamp-2">{formData.title || 'Your Event Title'}</h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-3 leading-relaxed">{formData.description || 'Add a compelling description to attract attendees and staff.'}</p>
                </div>

                {/* Location & Time Grid */}
                <div className="bg-gray-50/80 rounded-2xl p-4 grid grid-cols-2 gap-4 text-xs font-medium text-gray-600 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[#CD7F32]">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="truncate">{formData.date ? new Date(formData.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Select Date'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[#CD7F32]">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="truncate">{formData.startTime || 'Time'} {formData.duration && `(${formData.duration})`}</span>
                  </div>
                  <div className="flex items-center gap-3 col-span-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[#CD7F32]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="line-clamp-1">{formData.location || 'Venue / City'}</span>
                  </div>
                </div>

                {/* Video Player Preview */}
                {formData.videoUrl && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Film className="w-3.5 h-3.5" /> Teaser Video
                    </h4>
                    <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-md">
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
                  <div className="space-y-3 pt-2">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" /> Featuring
                    </h4>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {formData.bands.split(',').map((band, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 shrink-0 w-[72px]">
                          <div className="w-[60px] h-[60px] rounded-full bg-white shadow-md border-2 border-white overflow-hidden relative group">
                            <img 
                              src={(formData as any).artistAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(band.trim())}&background=random`}
                              alt={band}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                          </div>
                          <span className="text-[10px] text-gray-800 font-bold truncate w-full text-center leading-tight">{band.trim()}</span>
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
