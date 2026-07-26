'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function FlavorSetter() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const flavor = searchParams.get('appFlavor');
    if (flavor) {
      localStorage.setItem('appFlavor', flavor);
    }
  }, [searchParams]);

  return null;
}
