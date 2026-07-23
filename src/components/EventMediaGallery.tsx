'use client';

import { useState } from 'react';
import { Play, Film } from 'lucide-react';
import Image from 'next/image';

type EventMediaGalleryProps = {
  coverImage: string;
  videoUrl?: string;
  title: string;
};

export default function EventMediaGallery({ coverImage, videoUrl, title }: EventMediaGalleryProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const hasVideo = Boolean(videoUrl);
  const totalSlides = hasVideo ? 2 : 1;

  return (
    <div className="mb-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col relative">
      {/* Media Container */}
      <div className="relative aspect-[21/9] w-full bg-black">
        {activeSlide === 0 ? (
          <div className="w-full h-full relative">
            <Image 
              src={coverImage} 
              alt={title} 
              fill
              className="object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-6 text-white">
              <span className="bg-[#CD7F32] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider shadow-sm mb-1.5 inline-block">
                Event Cover
              </span>
              <h2 className="text-xl md:text-2xl font-bold font-serif leading-tight drop-shadow-md">{title}</h2>
            </div>
          </div>
        ) : (
          <div className="w-full h-full">
            <video 
              src={videoUrl} 
              className="w-full h-full object-contain" 
              controls 
              muted
              poster={coverImage}
            />
          </div>
        )}

        {/* Carousel Navigation Arrows */}
        {hasVideo && (
          <>
            <button 
              onClick={() => setActiveSlide((prev) => (prev === 0 ? 1 : 0))}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors shadow-lg backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button 
              onClick={() => setActiveSlide((prev) => (prev === 0 ? 1 : 0))}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors shadow-lg backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails / Indicators */}
      {hasVideo && (
        <div className="flex gap-2 p-3 bg-gray-50 border-t border-gray-100 overflow-x-auto">
          <button 
            onClick={() => setActiveSlide(0)}
            className={`relative w-24 aspect-video rounded-md overflow-hidden border-2 transition-all ${activeSlide === 0 ? 'border-[#CD7F32] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
          >
            <Image src={coverImage} alt="Cover Thumbnail" fill className="object-cover" />
          </button>
          <button 
            onClick={() => setActiveSlide(1)}
            className={`relative w-24 aspect-video rounded-md overflow-hidden border-2 transition-all flex items-center justify-center bg-gray-200 ${activeSlide === 1 ? 'border-[#CD7F32] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
          >
            <Image src={coverImage} alt="Video Thumbnail" fill className="object-cover blur-[2px]" />
            <Play className="absolute w-6 h-6 text-white drop-shadow-md" fill="white" />
          </button>
        </div>
      )}
    </div>
  );
}
