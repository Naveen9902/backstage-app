'use client';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface SwipeToToggleRunnerProps {
  isRunnerAvailable: boolean;
  onToggle: (newVal: boolean) => void;
  loading?: boolean;
}

export default function SwipeToToggleRunner({ isRunnerAvailable, onToggle, loading = false }: SwipeToToggleRunnerProps) {
  const isDraggingRef = useRef(false);

  const handleContainerClick = () => {
    if (!loading && !isDraggingRef.current) {
      if (typeof window !== 'undefined') {
        import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
          Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
        }).catch(() => {});
      }
      onToggle(!isRunnerAvailable);
    }
  };

  return (
    <div 
      onClick={handleContainerClick}
      className={`relative w-full max-w-[320px] sm:max-w-[340px] h-14 rounded-full overflow-hidden flex items-center justify-center border-2 transition-all duration-500 shadow-xl select-none mx-auto md:mx-0 cursor-pointer ${
      isRunnerAvailable 
        ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#121212] border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
        : 'bg-gradient-to-r from-[#1a1a1a] via-[#242424] to-[#121212] border-[#CD7F32] shadow-[0_0_15px_rgba(205,127,50,0.2)]'
    }`}>
      {/* Background Pulse Glow when Online */}
      {isRunnerAvailable && (
        <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none" />
      )}

      {/* Label Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 px-10 text-center">
        <span className={`text-[11px] sm:text-xs font-extrabold tracking-wider font-mono flex items-center justify-center gap-1.5 leading-tight ${
          isRunnerAvailable ? 'text-emerald-300' : 'text-[#CD7F32]'
        }`}>
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> UPDATING...</span>
          ) : isRunnerAvailable ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="whitespace-nowrap">SWIPE TO TURN OFF</span>
            </>
          ) : (
            <>
              <span className="whitespace-nowrap">SWIPE TO RUNNER</span>
            </>
          )}
        </span>
      </div>

      {/* Swipe Thumb */}
      {!loading && (
        <motion.div
          drag="x"
          dragConstraints={isRunnerAvailable ? { left: -260, right: 0 } : { left: 0, right: 260 }}
          dragElastic={0.05}
          dragSnapToOrigin
          onDragStart={() => { isDraggingRef.current = true; }}
          onDragEnd={(e, info) => {
            setTimeout(() => { isDraggingRef.current = false; }, 150);
            if (!isRunnerAvailable && info.offset.x > 45) {
              if (typeof window !== 'undefined') {
                import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
                  Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
                }).catch(() => {});
              }
              onToggle(true);
            } else if (isRunnerAvailable && info.offset.x < -45) {
              if (typeof window !== 'undefined') {
                import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
                  Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
                }).catch(() => {});
              }
              onToggle(false);
            }
          }}
          whileTap={{ scale: 0.95 }}
          className={`absolute top-1 w-11 h-11 rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10 border-2 transition-colors ${
            isRunnerAvailable 
              ? 'right-1 bg-gradient-to-br from-emerald-500 to-teal-700 border-white text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
              : 'left-1 bg-gradient-to-br from-[#CD7F32] to-amber-600 border-white text-white shadow-[0_0_10px_rgba(205,127,50,0.5)]'
          }`}
        >
          {isRunnerAvailable ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          )}
        </motion.div>
      )}
    </div>
  );
}
