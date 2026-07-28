'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

interface AnimatedSplashProps {
  onComplete: () => void;
  appFlavor: string;
}

export default function AnimatedSplash({ onComplete, appFlavor }: AnimatedSplashProps) {
  const [phase, setPhase] = useState<'gathering' | 'flash' | 'reveal'>('gathering');
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);
  const [f1Lines, setF1Lines] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    // Reduced from 200 to 40 to prevent mobile lag
    setParticles(Array.from({ length: 40 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 300 + Math.random() * 800; // start far away
      const startX = Math.cos(angle) * distance;
      const startY = Math.sin(angle) * distance;
      const startZ = -1000 - Math.random() * 1500; // start deep in 3D space
      return { id: i, startX, startY, startZ, size: Math.random() * 4 + 1 };
    }));
    // Reduced from 60 to 15 to prevent mobile lag
    setF1Lines(Array.from({ length: 15 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 400; 
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const startZ = -2000 - Math.random() * 2000;
      return { id: i, x, y, startZ, angle: (angle * 180) / Math.PI };
    }));

    // Sequence timing
    const t1 = setTimeout(() => setPhase('flash'), 2200); // F1 gathering
    const t2 = setTimeout(() => setPhase('reveal'), 2400); // Flash happens, reveal logo
    const t3 = setTimeout(() => onComplete(), 5000); // Stay on logo, then unmount

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center overflow-hidden font-sans perspective-[800px]" />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center overflow-hidden font-sans perspective-[800px]">
      
      {/* Background ambient light */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
         <motion.div 
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ 
              opacity: phase === 'reveal' ? 0.3 : (phase === 'flash' ? 1 : 0),
              scale: phase === 'flash' ? 4 : (phase === 'reveal' ? 2 : 0.1)
            }}
            transition={{ duration: phase === 'flash' ? 0.15 : 1.5, ease: "easeOut" }}
            className="w-[400px] h-[400px] bg-[#CD7F32] rounded-full blur-[150px]"
         />
      </div>

      <div className="relative z-10 flex items-center justify-center w-full h-full [transform-style:preserve-3d]">
        
        {/* PARTICLES & F1 LINES */}
        <AnimatePresence>
          {phase === 'gathering' && (
            <>
              {/* 200 3D Particles */}
              {particles.map((p) => (
                <motion.div
                  key={`p-${p.id}`}
                  initial={{ x: p.startX, y: p.startY, z: p.startZ, opacity: 0 }}
                  animate={{ x: 0, y: 0, z: 200, opacity: [0, 1, 0.8, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1.5 + Math.random() * 0.7,
                    ease: "easeInOut",
                  }}
                  className="absolute rounded-full bg-white shadow-[0_0_15px_3px_#CD7F32]"
                  style={{ width: p.size, height: p.size }}
                />
              ))}

              {/* F1 Glowing Lines Fly-by */}
              {f1Lines.map((l) => (
                <motion.div
                  key={`f1-${l.id}`}
                  initial={{ x: l.x, y: l.y, z: l.startZ, scaleZ: 0.1, opacity: 0 }}
                  animate={{ z: 800, scaleZ: 5, opacity: [0, 1, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.8 + Math.random() * 1.2,
                    ease: "easeIn",
                    repeat: Infinity
                  }}
                  className="absolute h-[2px] w-[150px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#CD7F32]"
                  style={{ rotate: `${l.angle}deg`, transformOrigin: 'center' }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* LOGO REVEAL */}
        <AnimatePresence>
          {phase === 'reveal' && (
            <motion.div 
              initial={{ scale: 0.2, opacity: 0, z: -500, filter: "blur(20px)" }}
              animate={{ scale: 1, opacity: 1, z: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
              transition={{ duration: 1.5, type: "spring", bounce: 0.4 }}
              className="flex flex-col items-center justify-center [transform-style:preserve-3d]"
            >
              <div className="relative mb-8 group perspective-[1000px]">
                <motion.div
                  animate={{ scale: [1, 1.05, 1], rotate: [0, 1.5, -1.5, 0] }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <Logo size="xl" showText={false} />
                </motion.div>
                
                {/* 3D-like spinning rings around logo */}
                <motion.div 
                  initial={{ rotateX: 75, rotateY: 0 }}
                  animate={{ rotateY: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border-[3px] border-amber-500/30 border-t-amber-400 pointer-events-none [transform-style:preserve-3d] shadow-[0_0_30px_rgba(205,127,50,0.4)]"
                />
                 <motion.div 
                  initial={{ rotateX: -70, rotateY: 0 }}
                  animate={{ rotateY: -360 }}
                  transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border-[1px] border-[#CD7F32]/40 border-b-amber-200 pointer-events-none [transform-style:preserve-3d]"
                />
                
                <motion.div 
                  initial={{ opacity: 0.8, scale: 1 }}
                  animate={{ opacity: [0.8, 0.3, 0.8], scale: [1.5, 1.6, 1.5] }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 bg-[#CD7F32]/40 blur-[50px] rounded-full pointer-events-none" 
                />
              </div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 1, type: "spring" }}
                className="text-6xl font-bold font-serif text-white tracking-tight mb-2 drop-shadow-[0_0_25px_rgba(205,127,50,0.9)]"
              >
                Back<span className="text-[#CD7F32]">Stage</span>
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex flex-col items-center"
              >
                <p className="text-sm font-bold text-[#F5F5DC] uppercase tracking-[0.3em] mb-6 drop-shadow-lg">
                  {appFlavor === 'USER' ? 'Welcome to our App' : 'Event Operations'}
                </p>

                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="flex items-center gap-3 px-6 py-2 rounded-full bg-[#CD7F32]/10 border border-[#CD7F32]/30 backdrop-blur-md shadow-[0_0_20px_rgba(205,127,50,0.2)]"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399] animate-[ping_1.5s_infinite]" />
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-[0.4em] font-bold">
                    {appFlavor === 'OPS' ? 'System Online' : 'Experience Ready'}
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
