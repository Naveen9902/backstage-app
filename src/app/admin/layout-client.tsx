'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AdminLayoutClient({ children, user }: { children: React.ReactNode, user: any }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg> },
    { name: 'Verify Talents', path: '/admin/verify', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg> },
    { name: 'Manage Disputes', path: '/admin/disputes', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#242424] text-white flex-col fixed h-full border-r-4 border-[#CD7F32] z-40">
        
        {/* Logo */}
        <div className="px-6 py-8 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="BackStage Logo" className="h-10 w-auto object-contain rounded-md shadow-sm group-hover:opacity-90 transition-opacity bg-white" />
            <span className="text-xl font-bold font-serif tracking-wide group-hover:text-white transition-colors">Back <span className="text-[#CD7F32]">Stage</span></span>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="px-4 mb-6">
          <div className="bg-[#333333] rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#CD7F32] flex items-center justify-center font-bold text-white shadow-sm">
              AD
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide">{user?.name || 'Sys Admin'}</p>
              <p className="text-xs text-white/50">Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
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
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#242424] border-t-2 border-[#CD7F32] z-50 flex items-center justify-around pb-safe h-16 px-1 shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.name} href={item.path} className={`flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-[#CD7F32]' : 'text-white/60 hover:text-white'}`}>
              <div className="mb-1">{item.icon}</div>
              <span className="text-[10px] font-medium leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 mb-16 md:mb-0 min-h-screen flex flex-col overflow-x-hidden">
        <header className="h-16 md:h-20 px-4 md:px-10 flex items-center justify-between md:justify-end bg-transparent">
          {/* Mobile Header Logo */}
          <div className="md:hidden flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto rounded-sm" />
            <span className="font-serif font-bold tracking-wide">Back<span className="text-[#CD7F32]">Stage</span></span>
          </div>
        </header>
        <div className="p-4 md:p-10 pt-0 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
