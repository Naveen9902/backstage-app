'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

export default function Logo({ size = 'md', showText = true, className = '', textClassName = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 md:w-11 md:h-11 rounded-xl',
    lg: 'w-16 h-16 md:w-20 md:h-20 rounded-2xl',
    xl: 'w-24 h-24 md:w-28 md:h-28 rounded-3xl'
  };

  const textSizes = {
    sm: 'text-base font-bold tracking-wide font-serif',
    md: 'text-lg md:text-xl font-bold tracking-wide font-serif',
    lg: 'text-2xl md:text-3xl font-extrabold tracking-wide font-serif',
    xl: 'text-3xl md:text-4xl font-extrabold tracking-wide font-serif'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <div className="relative flex shrink-0 items-center justify-center">
        {/* Ambient Gold/Copper Glow Ring */}
        <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#CD7F32] via-amber-400 to-[#CD7F32] rounded-[inherit] blur-[3px] opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 pointer-events-none" />
        
        {/* Luxury Badge Container */}
        <div className={`relative bg-white border border-[#CD7F32]/50 shadow-xl flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-[1.02] ${sizeClasses[size]}`}>
          <img 
            src="/logo.jpg" 
            alt="BackStage Logo" 
            className="w-full h-full object-cover object-center scale-[1.08] transition-transform duration-500 group-hover:scale-[1.12]" 
          />
          {/* Internal Glass Shine Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/25 pointer-events-none" />
        </div>
      </div>

      {showText && (
        <span className={`${textSizes[size]} text-[#CD7F32] font-black tracking-wide font-serif transition-colors group-hover:text-[#e59445] drop-shadow-[0_0_12px_rgba(205,127,50,0.4)] ${textClassName}`}>
          BackStage
        </span>
      )}
    </div>
  );
}
