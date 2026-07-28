'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

interface AnimatedSplashProps {
  onComplete: () => void;
  appFlavor: string;
}

export default function AnimatedSplash({ onComplete, appFlavor }: AnimatedSplashProps) {
  useEffect(() => {
    onComplete();
  }, [onComplete]);

  return null;
}
