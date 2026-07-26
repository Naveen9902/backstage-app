'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { X, Sparkles, Heart, Users, Play, Film, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

type UserEventDetailViewProps = {
  event: any;
  onClose: () => void;
  isSaved: boolean;
  hasJoined: boolean;
  onToggleSave: () => void;
  onJoinCommunity: () => void;
  isJoining?: boolean;
};

export default function UserEventDetailView({
  event,
  onClose,
  isSaved,
  hasJoined,
  onToggleSave,
  onJoinCommunity,
  isJoining = false,
}: UserEventDetailViewProps) {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0); // 0 = Cover Image Slide, 1 = Video Teaser
  
  const videoUrl = event.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4";
  const coverImage = event.coverImageUrl || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000&auto=format&fit=crop";
  const tagsList = event.tags ? event.tags.split(',').map((t: string) => t.trim()) : ['Music', 'Live Concert', 'Entertainment'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1a1a20] text-white rounded-3xl overflow-hidden border border-white/10 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col relative"
      >
        {/* Close X Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white/80 hover:text-white flex items-center justify-center border border-white/10 transition-colors shadow-lg backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          
          {/* IMAGE SLIDE OPTION AND VIDEO TEASER HEADER */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-black select-none">
            {activeSlide === 0 ? (
              <div className="w-full h-full relative animate-fadeIn">
                <img 
                  src={coverImage} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a20] via-black/40 to-black/20" />
                <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between z-10">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-md bg-[#CD7F32] text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-md">
                      {event.status || "UPCOMING"}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-white leading-tight drop-shadow-md">
                      {event.title}
                    </h2>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full relative animate-fadeIn bg-black">
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  muted 
                  loop
                  className="w-full h-full object-cover"
                  poster={coverImage}
                />
                <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#1a1a20] to-transparent pointer-events-none" />
              </div>
            )}

            {/* Slide Navigation Arrows */}
            <button 
              onClick={() => setActiveSlide(prev => (prev === 0 ? 1 : 0))}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/10 transition-all backdrop-blur-sm"
              title="Next Slide / Teaser"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setActiveSlide(prev => (prev === 0 ? 1 : 0))}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/10 transition-all backdrop-blur-sm"
              title="Next Slide / Teaser"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Slide Option Switcher Bar */}
          <div className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white/[0.03] border-b border-white/10">
            <button
              onClick={() => setActiveSlide(0)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                activeSlide === 0
                  ? 'bg-[#CD7F32] text-white border-[#CD7F32] shadow-md shadow-[#CD7F32]/20'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Cover Photo Slide
            </button>
            <button
              onClick={() => setActiveSlide(1)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                activeSlide === 1
                  ? 'bg-[#CD7F32] text-white border-[#CD7F32] shadow-md shadow-[#CD7F32]/20'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Watch Video Teaser
            </button>
          </div>

          {/* Body Content - Exactly matching Screenshot 3 Pattern */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* 4-Info Box Grid (Date / Time / Location / Category) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DATE</div>
                <div className="text-sm font-extrabold text-white mt-1">
                  {new Date(event.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TIME</div>
                <div className="text-sm font-extrabold text-white mt-1">{event.startTime || "19:00"}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">LOCATION</div>
                <div className="text-sm font-extrabold text-white mt-1 truncate px-1" title={event.location}>{event.location}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CATEGORY</div>
                <div className="text-sm font-extrabold text-[#CD7F32] mt-1 truncate px-1">{event.attendeeCategory || "Music & entertainment"}</div>
              </div>
            </div>

            {/* About This Event */}
            <div>
              <h3 className="text-lg font-bold text-white mb-2 font-serif flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#CD7F32]" /> About This Event
              </h3>
              <p className="text-gray-300 text-sm sm:text-[15px] leading-relaxed whitespace-pre-line">
                {event.description || "Experience the soulful voice of Arijit Singh live. A mesmerizing evening of romance, heartbreak, and pure melody."}
              </p>
            </div>

            {/* Event Tags */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">EVENT TAGS</h4>
              <div className="flex flex-wrap gap-2">
                {tagsList.map((tag: string, i: number) => (
                  <span key={i} className="text-xs bg-white/10 text-gray-200 px-3.5 py-1 rounded-xl border border-white/10 font-medium">
                    #{tag.replace(/^#/, '')}
                  </span>
                ))}
              </div>
            </div>

            {/* Featured Lineup & Highlights (if bands/artists exist) */}
            {event.bands && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#CD7F32]" /> FEATURED LINEUP
                </h4>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                  {event.bands.split(',').map((band: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl shrink-0">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(band.trim())}&background=CD7F32&color=fff&size=64&bold=true`} 
                        alt={band.trim()} 
                        className="w-7 h-7 rounded-full object-cover border border-white/20" 
                      />
                      <span className="text-xs text-white font-bold">{band.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="p-4 sm:p-6 bg-[#121216] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] sm:text-xs text-gray-400 text-center sm:text-left leading-tight">
            <span className="font-bold text-white">No tickets required here.</span><br className="sm:hidden" /> Join the community or save to your upcoming list.
          </div>
          
          <div className="flex items-stretch gap-2.5 w-full sm:w-auto">
            {/* Save Event Button */}
            <button
              onClick={onToggleSave}
              className={`flex-1 sm:flex-none px-3 sm:px-5 py-2.5 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-1.5 border whitespace-nowrap ${
                isSaved
                  ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-400 text-red-400' : ''}`} />
              {isSaved ? "Saved" : "Save"}
            </button>

            {/* Join Community Button */}
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (!hasJoined) {
                  await onJoinCommunity();
                }
                onClose();
                router.push(`/user/community/${event.id}`);
              }}
              disabled={isJoining}
              className="flex-[2] sm:flex-none bg-gradient-to-r from-[#CD7F32] to-amber-600 hover:from-[#b56e29] hover:to-amber-700 text-white px-4 py-2.5 rounded-xl font-extrabold text-[13px] shadow-md shadow-[#CD7F32]/20 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
            >
              {isJoining ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : hasJoined ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Enter Hub →
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Join Chat →
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
