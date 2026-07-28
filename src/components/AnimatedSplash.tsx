'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

import F1Background from './F1Background';

export default function AnimatedSplash({ onComplete }: { onComplete: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [appFlavor, setAppFlavor] = useState<string>('OPS');

  useEffect(() => {
    setMounted(true);
    let flavor = localStorage.getItem('appFlavor') || process.env.NEXT_PUBLIC_APP_FLAVOR || 'OPS';
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      if (ua.includes('BackstageFlavor/Ops')) {
        flavor = 'OPS';
      } else if (ua.includes('BackstageFlavor/User')) {
        flavor = 'USER';
      }
    }
    setAppFlavor(flavor);

    // Wait exactly 3 seconds, then call onComplete
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!mounted) {
    return <div className="fixed inset-0 z-[100] bg-[#121212]" />;
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[100] bg-[#121212] flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0 z-0">
          <F1Background />
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="mb-6 drop-shadow-[0_0_15px_rgba(205,127,50,0.5)]"
          >
            <Logo size="xl" showText={false} />
          </motion.div>
          
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl font-bold font-serif text-white tracking-tight mb-2 drop-shadow-lg"
          >
            Back<span className="text-[#CD7F32]">Stage</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-sm font-bold text-[#F5F5DC] uppercase tracking-[0.3em] drop-shadow-md"
          >
            {appFlavor === 'USER' ? 'Welcome to our App' : 'Event Operations'}
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
