'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard } from 'lucide-react';

export default function MobileBottomNav() {
  const [session, setSession] = useState<{ loggedIn: boolean; role?: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data && data.loggedIn) {
          setSession({ loggedIn: true, role: data.user?.role?.toLowerCase() });
        } else {
          setSession({ loggedIn: false });
        }
      })
      .catch(() => setSession({ loggedIn: false }));
  }, [pathname]);

  if (!session?.loggedIn) return null;

  // Don't show on large screens, only on mobile (sm or smaller)
  const isHome = pathname === '/';
  const dashboardPath = session.role ? `/${session.role}` : '/';
  const isDashboard = pathname.startsWith(dashboardPath) && dashboardPath !== '/';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] border-t border-gray-800 flex justify-around items-center h-16 px-4 md:hidden pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
      <Link href="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isHome ? 'text-[#CD7F32]' : 'text-gray-400 hover:text-gray-200'}`}>
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold tracking-wider">Home</span>
      </Link>
      
      <Link href={dashboardPath} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isDashboard ? 'text-[#CD7F32]' : 'text-gray-400 hover:text-gray-200'}`}>
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] font-bold tracking-wider">Dashboard</span>
      </Link>
    </div>
  );
}
