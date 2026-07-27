'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function F1Background() {
  const [mounted, setMounted] = useState(false);
  const [lines, setLines] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setLines(Array.from({ length: 30 }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      const duration = 1 + Math.random() * 2;
      const height = 100 + Math.random() * 200;
      const opacity = 0.2 + Math.random() * 0.5;
      return { id: i, left, delay, duration, height, opacity };
    }));
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none perspective-[1000px]">
        <div className="absolute inset-0 bg-[#121212] z-0" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none perspective-[1000px]">
      <div className="absolute inset-0 bg-[#121212] z-0" />
      
      {/* 3D Grid / Warp effect container */}
      <div className="absolute inset-0 z-10 [transform-style:preserve-3d] rotate-12 scale-150">
        {lines.map((l) => (
          <motion.div
            key={l.id}
            initial={{ y: '-100vh', opacity: 0 }}
            animate={{ y: '200vh', opacity: [0, l.opacity, 0] }}
            transition={{
              duration: l.duration,
              delay: l.delay,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-[2px] bg-gradient-to-b from-transparent via-[#CD7F32] to-transparent shadow-[0_0_15px_#CD7F32]"
            style={{ 
              left: `${l.left}%`, 
              height: `${l.height}px`,
              filter: `blur(${Math.random()}px)`
            }}
          />
        ))}
      </div>
    </div>
  );
}
