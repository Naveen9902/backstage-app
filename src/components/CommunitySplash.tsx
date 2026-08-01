'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessagesSquare, Globe2 } from 'lucide-react';

interface CommunitySplashProps {
  onComplete: () => void;
  appFlavor: string;
}

export default function CommunitySplash({ onComplete, appFlavor }: CommunitySplashProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 600); // Wait for exit animation
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.2, filter: "blur(15px)" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f3efe5] overflow-hidden"
        >
          {/* Animated Background Elements */}
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[400px] h-[400px] bg-[#CD7F32]/10 rounded-full blur-[100px] -top-20 -left-20"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[80px] -bottom-20 -right-20"
          />
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 80, delay: 0.1 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Beautiful Community Logo Composition */}
            <div className="relative mb-8">
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 100, delay: 0.3 }}
                className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#CD7F32] to-[#b06a29] flex items-center justify-center shadow-[0_10px_40px_rgba(205,127,50,0.4)] relative z-10"
              >
                <MessagesSquare className="w-12 h-12 text-white" />
              </motion.div>
              
              <motion.div
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 35, y: -20, opacity: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.7 }}
                className="absolute top-0 right-0 w-12 h-12 rounded-full bg-white border-2 border-[#f3efe5] flex items-center justify-center shadow-lg z-0"
              >
                <Globe2 className="w-6 h-6 text-[#CD7F32]" />
              </motion.div>
              
              <motion.div
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: -30, y: 20, opacity: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.9 }}
                className="absolute bottom-0 left-0 w-14 h-14 rounded-full bg-[#242424] border-2 border-[#f3efe5] flex items-center justify-center shadow-lg z-20"
              >
                <Users className="w-7 h-7 text-white" />
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.7 }}
              className="mt-4 flex flex-col items-center text-center"
            >
              <h2 className="text-4xl font-serif font-extrabold text-[#242424] tracking-tight mb-3">Community Chat</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#CD7F32] animate-pulse"></span>
                <p className="text-[#8c5620] uppercase tracking-[0.25em] text-xs font-black">
                  {appFlavor === 'OPS' ? 'Manager Operations' : 'Global Network'}
                </p>
                <span className="w-2 h-2 rounded-full bg-[#CD7F32] animate-pulse"></span>
              </div>
            </motion.div>
            
            {/* Loading Indicator */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="mt-12 flex gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  className="w-2.5 h-2.5 rounded-full bg-[#CD7F32]"
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
