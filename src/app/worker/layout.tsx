'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import NotificationBell from '@/components/NotificationBell';

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = () => {
    fetch('/api/worker/profile')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          if (data.role !== 'WORKER') {
            window.location.href = data.role === 'ADMIN' ? '/admin' : '/manager/dashboard';
            return;
          }
          setProfile(data);
        } else if (data.error === 'Unauthorized' || data.error === 'User not found') {
          window.location.href = '/login';
        }
      });
  };

  useEffect(() => {
    fetchProfile();
    window.addEventListener('profileUpdated', fetchProfile);
    return () => window.removeEventListener('profileUpdated', fetchProfile);
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/worker', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { name: 'Find Jobs', path: '/worker/jobs', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg> },
    { name: 'My Applications', path: '/worker/applications', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
    { name: 'My Schedule', path: '/worker/schedule', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg> },
    { name: 'Live Runner Tasks', path: '/worker/runners', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
    { name: 'Profile', path: '/worker/profile', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#242424] text-white flex-col fixed h-full border-r-4 border-[#CD7F32] z-40">
        
        {/* Logo */}
        <div className="px-6 py-8">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="BackStage Logo" className="h-10 w-auto object-contain rounded-md shadow-sm group-hover:opacity-90 transition-opacity bg-white" />
            <span className="text-xl font-bold font-serif tracking-wide group-hover:text-white transition-colors">Back <span className="text-[#CD7F32]">Stage</span></span>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="px-4 mb-6">
          <div className="bg-[#333333] rounded-xl p-3 flex items-center gap-3">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#CD7F32] flex items-center justify-center font-bold text-white shadow-sm">
                {profile ? profile.name.substring(0, 2).toUpperCase() : '...'}
              </div>
            )}
            <div>
              <p className="text-sm font-bold uppercase tracking-wide truncate max-w-[120px]">
                {profile ? profile.name : 'Loading...'}
              </p>
              <p className="text-xs text-white/50">Talent</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/worker' && pathname?.startsWith(item.path));
            return (
              <Link key={item.name} href={item.path}>
                <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#CD7F32]/10 text-[#CD7F32] font-semibold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 mt-auto border-t border-white/10">
          <button 
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/';
            }}
            className="flex w-full items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-white/60 hover:text-red-400 hover:bg-red-400/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#242424] border-t-2 border-[#CD7F32] z-50 overflow-x-auto no-scrollbar pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
        <div className="flex items-center h-16 px-2 gap-2 min-w-max">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/worker' && pathname?.startsWith(item.path));
            return (
              <Link key={item.name} href={item.path} className={`flex flex-col items-center justify-center w-16 h-full flex-shrink-0 ${isActive ? 'text-[#CD7F32]' : 'text-white/60 hover:text-white'}`}>
                <div className="mb-1">{item.icon}</div>
                <span className="text-[10px] font-medium leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 mb-16 md:mb-0 min-h-screen flex flex-col overflow-x-hidden">
        <header className="h-16 md:h-20 px-4 md:px-10 flex items-center justify-between md:justify-end bg-transparent">
          {/* Mobile Header Logo */}
          <Link href="/" className="md:hidden flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto rounded-sm" />
            <span className="font-serif font-bold tracking-wide">Back<span className="text-[#CD7F32]">Stage</span></span>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-4">
            <NotificationBell />
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/';
              }}
              className="md:hidden text-gray-500 hover:text-red-500 p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          </div>
        </header>
        <div className="p-4 md:p-10 md:pt-0 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
