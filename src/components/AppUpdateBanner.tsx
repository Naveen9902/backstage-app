'use client';

import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Download, X } from 'lucide-react';

export default function AppUpdateBanner() {
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/version`)
      .then(res => res.json())
      .then(data => {
        if (data && data.build) {
          const storedBuild = localStorage.getItem('userAppBuildVersion');
          if (!storedBuild || parseInt(storedBuild) < data.build) {
            setUpdateInfo(data);
            setShowModal(true);
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleApplyUpdate = () => {
    setUpdating(true);
    if (updateInfo?.build) {
      localStorage.setItem('userAppBuildVersion', String(updateInfo.build));
    }
    
    // Clear application caches if browser supports cacheStorage
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      }).catch(console.error);
    }

    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  if (!showModal || !updateInfo) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#1f1f23] border border-[#CD7F32]/40 rounded-3xl p-6 md:p-8 max-w-md w-full text-white shadow-[0_0_50px_rgba(205,127,50,0.25)] relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#CD7F32]/30 rounded-full blur-3xl pointer-events-none" />
        
        {!updateInfo.mandatory && (
          <button 
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#CD7F32] to-[#ffb163] flex items-center justify-center mb-5 shadow-lg shadow-[#CD7F32]/30">
          <Sparkles className="w-7 h-7 text-white animate-pulse" />
        </div>

        <span className="text-[11px] font-bold tracking-widest text-[#CD7F32] uppercase bg-[#CD7F32]/10 px-3 py-1 rounded-full border border-[#CD7F32]/30 inline-block mb-3">
          Version {updateInfo.version} Available
        </span>

        <h2 className="text-2xl font-bold font-serif text-white mb-2 leading-tight">
          {updateInfo.title || 'New App Update Ready!'}
        </h2>

        <p className="text-sm text-gray-300 mb-6 leading-relaxed font-light">
          {updateInfo.description}
        </p>

        <div className="space-y-3">
          <button
            onClick={handleApplyUpdate}
            disabled={updating}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-[#CD7F32] to-[#e08e3d] hover:from-[#b56e29] hover:to-[#CD7F32] text-white font-bold text-sm rounded-xl shadow-xl flex items-center justify-center gap-2.5 transition-all transform active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
            {updating ? 'Updating App...' : '⚡ Apply Live Update Now'}
          </button>

          <a
            href={updateInfo.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors block text-center"
          >
            <Download className="w-4 h-4" />
            Download Updated APK (Optional)
          </a>
        </div>
      </div>
    </div>
  );
}
