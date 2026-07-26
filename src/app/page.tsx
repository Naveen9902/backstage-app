'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import Navbar from '@/components/Navbar';

export default function AppGateway() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isNativeApp, setIsNativeApp] = useState(false);

  // App Selection & Splash State
  const [activeAppMode, setActiveAppMode] = useState<'USER' | 'OPS'>('USER');
  const [showSplash, setShowSplash] = useState(true);

  // Login Form States (for Mobile Boxed Portal)
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Web App Home Page States (for Desktop View)
  const [topEvents, setTopEvents] = useState<any[]>([]);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    // Load saved app mode preference if any
    try {
      const savedMode = localStorage.getItem('backstage_app_mode');
      if (savedMode === 'OPS' || savedMode === 'USER') {
        setActiveAppMode(savedMode);
      }
    } catch(e){}

    // Hide Splash Intro after 1.6s
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 1600);

    // Check if running inside native Capacitor APK
    import('@capacitor/core').then(({ Capacitor }) => {
      if (Capacitor.isNativePlatform()) {
        setIsNativeApp(true);
      }
    }).catch(() => {});

    // 1. Auth Check - Redirect directly to dashboard if already logged in
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          const role = data.user.role || data.role;
          if (role === 'ADMIN') window.location.href = '/admin';
          else if (role === 'MANAGER') window.location.href = '/manager/dashboard';
          else if (role === 'USER') window.location.href = '/user';
          else window.location.href = '/worker';
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        setCheckingAuth(false);
      });

    // 2. Fetch Events for Web Application Landing Page
    Promise.all([
      fetch('/api/events/top').then(res => res.json()),
      fetch('/api/events/live').then(res => res.json())
    ]).then(([topData, liveData]) => {
      if (Array.isArray(topData)) setTopEvents(topData);
      if (Array.isArray(liveData)) setLiveEvents(liveData);
    }).catch(() => {})
      .finally(() => setEventsLoading(false));

    return () => clearTimeout(splashTimer);
  }, []);

  const executeLoginWithEmail = async (emailToUse: string, passToUse: string) => {
    setLoginLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse, password: passToUse })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.requires2FA) {
          setRequires2FA(true);
        } else if (data.role === 'ADMIN') {
          window.location.href = '/admin';
        } else if (data.role === 'MANAGER') {
          window.location.href = '/manager/dashboard';
        } else if (data.role === 'USER') {
          window.location.href = '/user';
        } else {
          window.location.href = '/worker';
        }
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    }
    setLoginLoading(false);
  };

  const switchAppMode = (mode: 'USER' | 'OPS') => {
    setActiveAppMode(mode);
    try {
      localStorage.setItem('backstage_app_mode', mode);
    } catch(e){}
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) return;
    executeLoginWithEmail(formData.email, formData.password);
  };

  const handleDemoLogin = (role: 'USER' | 'MANAGER' | 'WORKER') => {
    if (role === 'USER') {
      executeLoginWithEmail('user@test.com', 'UserPass123!');
    } else if (role === 'MANAGER') {
      executeLoginWithEmail('manager@test.com', 'ManagerPass123!');
    } else {
      executeLoginWithEmail('worker@test.com', 'WorkerPass123!');
    }
  };

  const handleVerify2FA = async () => {
    if (!otpCode) return;
    setLoginLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otpCode })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.role === 'ADMIN') window.location.href = '/admin';
        else if (data.role === 'MANAGER') window.location.href = '/manager/dashboard';
        else if (data.role === 'USER') window.location.href = '/user';
        else window.location.href = '/worker';
      } else {
        setError(data.error || 'Invalid 2FA code');
      }
    } catch (err) {
      setError('An error occurred during verification');
    }
    setLoginLoading(false);
  };

  if (checkingAuth || showSplash) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-white font-sans p-4 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#CD7F32]/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center text-center max-w-sm"
        >
          <div className="relative mb-8">
            <motion.div
              animate={{ scale: [1, 1.06, 1], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Logo size="xl" showText={false} />
            </motion.div>
            <div className="absolute -inset-3 rounded-3xl border border-[#CD7F32]/40 animate-[spin_4s_linear_infinite] pointer-events-none" />
            <div className="absolute -inset-6 rounded-3xl border border-[#CD7F32]/20 animate-[spin_7s_linear_infinite_reverse] pointer-events-none" />
          </div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold font-serif text-white tracking-tight mb-2"
          >
            Back<span className="text-[#CD7F32]">Stage</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs font-mono text-[#CD7F32] uppercase tracking-[0.25em] flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Launching Experience...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] font-sans selection:bg-[#CD7F32]/30 text-white relative overflow-hidden">
      
      {/* =========================================================================
          1. MOBILE / NATIVE APK DIRECT DUAL-APP PORTAL
          Visible on mobile/tablet (< 768px) OR when running inside Capacitor APK.
          Shows: App Selector Tabs (User App vs Manager/Worker App) -> Login -> Launch.
         ========================================================================= */}
      <div className={isNativeApp ? "block w-full min-h-screen flex flex-col justify-between p-4 sm:p-6" : "md:hidden w-full min-h-screen flex flex-col justify-between p-4 sm:p-6"}>
        {/* Ambient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#CD7F32]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header with App Selector */}
        <header className="relative z-10 flex flex-col gap-3 py-2 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} />
            <Link href="/register" className="text-xs font-extrabold text-[#CD7F32] bg-[#CD7F32]/15 px-3.5 py-1.5 rounded-full border border-[#CD7F32]/40 flex items-center gap-1 shadow-sm transition-all hover:scale-105 active:scale-95">
              <span>Sign Up</span>
            </Link>
          </div>

          {/* DUAL APP SELECTOR TABS */}
          <div className="bg-black/60 p-1 rounded-2xl border border-white/10 flex items-center gap-1 relative">
            <button
              onClick={() => switchAppMode('USER')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 relative z-10 ${
                activeAppMode === 'USER' ? 'text-white shadow-md' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {activeAppMode === 'USER' && (
                <motion.div layoutId="activeAppTab" className="absolute inset-0 bg-[#CD7F32] rounded-xl -z-10" />
              )}
              <span>📱 Fan Community App</span>
            </button>

            <button
              onClick={() => switchAppMode('OPS')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 relative z-10 ${
                activeAppMode === 'OPS' ? 'text-white shadow-md' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {activeAppMode === 'OPS' && (
                <motion.div layoutId="activeAppTab" className="absolute inset-0 bg-[#b06a29] rounded-xl -z-10" />
              )}
              <span>⚡ Manager & Staff App</span>
            </button>
          </div>
        </header>

        {/* Boxed Dual Login Form */}
        <main className="relative z-10 my-auto py-4 flex items-center justify-center w-full">
          <motion.div 
            key={activeAppMode}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm sm:max-w-md bg-[#1a1a1a]/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/80 border-2 border-[#CD7F32]/50 p-5 sm:p-7 relative overflow-hidden"
          >
            {/* Top Luxury Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#CD7F32] to-transparent opacity-90" />

            {/* App Subtitle Badge */}
            <div className="flex flex-col items-center text-center mb-5 pb-4 border-b border-white/10">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#CD7F32] bg-[#CD7F32]/10 px-3 py-1 rounded-full border border-[#CD7F32]/30 mb-2">
                {activeAppMode === 'USER' ? '📱 Fan & Attendee Portal' : '🏢 Event Manager & Crew Portal'}
              </span>
              <p className="text-gray-400 text-xs font-medium">
                {activeAppMode === 'USER' ? 'Access event communities, chat rooms, and fan perks' : 'Manage live events, dispatch runners, and staff shifts'}
              </p>
            </div>

            {/* 1-Tap Quick Demo Account Buttons */}
            <div className="mb-5 bg-black/40 p-3 rounded-2xl border border-white/5 space-y-2">
              <p className="text-[10px] font-mono text-gray-400 uppercase font-bold text-center tracking-wider">Quick Demo Login (1-Tap)</p>
              {activeAppMode === 'USER' ? (
                <button
                  type="button"
                  onClick={() => handleDemoLogin('USER')}
                  className="w-full bg-[#CD7F32]/20 hover:bg-[#CD7F32]/30 border border-[#CD7F32]/40 text-white rounded-xl py-2 px-3 text-xs font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">🎟️ Demo Fan User</span>
                  <span className="text-[10px] font-mono text-[#CD7F32] uppercase">Launch App &rarr;</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('MANAGER')}
                    className="bg-[#CD7F32]/20 hover:bg-[#CD7F32]/30 border border-[#CD7F32]/40 text-white rounded-xl py-2 px-2.5 text-[11px] font-bold flex items-center justify-between transition-all"
                  >
                    <span>🏢 Organizer</span>
                    <span className="text-[9px] text-[#CD7F32]">&rarr;</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('WORKER')}
                    className="bg-[#CD7F32]/20 hover:bg-[#CD7F32]/30 border border-[#CD7F32]/40 text-white rounded-xl py-2 px-2.5 text-[11px] font-bold flex items-center justify-between transition-all"
                  >
                    <span>🏃 Event Crew</span>
                    <span className="text-[9px] text-[#CD7F32]">&rarr;</span>
                  </button>
                </div>
              )}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs px-3.5 py-2.5 rounded-xl mb-4 flex items-center gap-2 text-left"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </motion.div>
            )}

            {requires2FA ? (
              <div className="space-y-4">
                <div className="text-center mb-4 bg-black/40 p-3.5 rounded-2xl border border-white/5">
                  <p className="text-gray-300 text-xs font-bold uppercase tracking-wider font-mono">2FA Verification Required</p>
                  <p className="text-gray-400 text-[11px] mt-1">Enter the 6-digit code from your authenticator app.</p>
                </div>
                <div>
                  <input 
                    type="text" 
                    maxLength={6}
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32] transition-all text-center tracking-[0.5em] text-xl font-mono font-bold"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify2FA()}
                    autoFocus
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVerify2FA}
                  disabled={loginLoading || otpCode.length !== 6}
                  className="w-full bg-gradient-to-r from-[#CD7F32] to-[#b06a29] hover:from-[#b06a29] hover:to-[#965820] text-white rounded-xl py-3.5 font-bold shadow-lg shadow-[#CD7F32]/20 mt-2 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
                >
                  {loginLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Verify & Launch Dashboard'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1 font-mono">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <input 
                      type="email" 
                      required
                      className="w-full bg-black/60 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32] transition-all text-sm font-medium"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">Password</label>
                    <Link href="/forgot-password" className="text-[11px] text-[#CD7F32] hover:underline font-semibold">Forgot?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      className="w-full bg-black/60 border border-white/20 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32] transition-all text-sm font-medium"
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loginLoading}
                  className="w-full bg-gradient-to-r from-[#CD7F32] to-[#b06a29] hover:from-[#b06a29] hover:to-[#965820] text-white rounded-xl py-3 font-bold shadow-lg shadow-[#CD7F32]/25 mt-1 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
                >
                  {loginLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Launch {activeAppMode === 'USER' ? 'Community App' : 'Operations App'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center my-3">
                  <div className="flex-1 border-t border-white/10"></div>
                  <span className="px-3 text-[10px] text-gray-500 uppercase tracking-widest font-mono font-bold">Or Continue With</span>
                  <div className="flex-1 border-t border-white/10"></div>
                </div>

                <a
                  href="/api/auth/google"
                  className="w-full bg-[#242424] hover:bg-[#2a2a2a] border border-white/15 text-white rounded-xl py-2.5 font-bold shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] text-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <span>Sign in with Google</span>
                </a>
              </div>
            )}
          </motion.div>
        </main>

        {/* Minimal Mobile Footer */}
        <footer className="relative z-10 text-center py-2 border-t border-white/5 text-[11px] text-gray-500 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <span>&copy; {new Date().getFullYear()} BackStage Apps</span>
          <Link href="/terms" className="hover:text-gray-400">Terms</Link>
          <Link href="/privacy" className="hover:text-gray-400">Privacy</Link>
          <Link href="/support" className="hover:text-gray-400">Support</Link>
        </footer>
      </div>


      {/* =========================================================================
          2. DESKTOP / WEB APPLICATION MARKETING HOME PAGE
          Visible only on large desktop screens (>= 768px) and non-native web.
          Shows: Full Marketing Home Page with Hero, Events, Features, Pricing.
         ========================================================================= */}
      <div className={isNativeApp ? "hidden" : "hidden md:block w-full min-h-screen bg-[#242424] text-white selection:bg-[#CD7F32]/30"}>
        <Navbar />

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight font-serif text-[#CD7F32]"
            >
              Event Staffing & On-Ground Operations
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/80 max-w-lg leading-relaxed"
            >
              Connect with top-tier event professionals, find the perfect opportunities, and build your career in the events industry. BackStage is the all-in-one platform for event staffing, runners, and community building.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 pt-2"
            >
              <Link href="/register" className="bg-[#CD7F32] hover:bg-[#b06a29] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#CD7F32]/30 flex items-center gap-2 text-base">
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-8 py-4 rounded-xl font-bold transition-all text-base">
                Sign In to Dashboard
              </Link>
            </motion.div>

            <div className="pt-8 border-t border-white/10 flex items-center gap-8 text-sm text-white/60">
              <div className="flex items-center gap-2 font-semibold text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                Live Staffing Active
              </div>
              <div>• 10,000+ Verified Workers</div>
              <div>• Instant Errand Dispatch</div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#121212] p-8 rounded-3xl border border-white/10 shadow-2xl">
              <div className="absolute -top-6 -right-6 bg-[#CD7F32] text-white font-mono text-xs font-bold px-4 py-2 rounded-full shadow-lg uppercase tracking-wider">
                ⚡ Live Dispatch Portal
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <Logo size="md" showText={false} />
                    <div>
                      <h4 className="font-bold text-white font-serif">BackStage Network</h4>
                      <p className="text-xs text-gray-400">Real-Time Event Operations</p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 font-mono px-3 py-1 rounded-full font-bold border border-emerald-500/30">ONLINE</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <div className="text-2xl font-bold text-[#CD7F32] font-mono">500+</div>
                    <div className="text-xs text-gray-400 font-medium uppercase mt-1">Active Runners</div>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <div className="text-2xl font-bold text-white font-mono">100%</div>
                    <div className="text-xs text-gray-400 font-medium uppercase mt-1">Payment Guarantee</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500/10 to-[#CD7F32]/10 p-4 rounded-2xl border border-[#CD7F32]/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#CD7F32] flex items-center gap-2 font-serif">
                      <Sparkles className="w-4 h-4" /> Why BackStage?
                    </span>
                    <Link href="/register" className="text-xs font-bold text-white underline">Join Now &rarr;</Link>
                  </div>
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                    Zero middlemen. Direct transparent dispatches between event managers and on-ground talent with instant payment confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Live Right Now Section */}
        {liveEvents.length > 0 && (
          <section className="py-16 bg-black border-y border-white/10 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-[#CD7F32]/10 blur-[120px] pointer-events-none rounded-full" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                  <h2 className="text-3xl font-bold font-serif text-white tracking-tight">Live Right Now</h2>
                </div>
                <Link href="/events" className="text-sm font-bold text-[#CD7F32] hover:underline">View All &rarr;</Link>
              </div>

              <div className="flex overflow-x-auto pb-6 -mx-6 px-6 gap-6 snap-x hide-scrollbar">
                {liveEvents.map((event, i) => (
                  <Link href={`/events/${event.id}`} key={event.id} className="min-w-[320px] md:min-w-[400px] snap-start shrink-0 group">
                    <div className="bg-[#1a1a1a] border border-white/10 hover:border-[#CD7F32]/50 rounded-2xl overflow-hidden transition-all duration-300 relative h-full flex flex-col shadow-lg">
                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          ONGOING
                        </span>
                      </div>
                      
                      <div className="h-48 w-full overflow-hidden bg-gray-800 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                        <img 
                          src={event.coverImageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-0"
                        />
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-[#CD7F32] transition-colors">{event.title}</h3>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                          <span className="text-xs text-gray-400 font-medium">By {event.managerProfile?.user?.name || 'Manager'}</span>
                          <span className="text-xs font-bold text-[#CD7F32] uppercase tracking-wider group-hover:underline">View Live →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Discover Events Section */}
        <section id="features" className="py-24 bg-white text-[#242424]">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold font-serif text-[#CD7F32] mb-4">Discover Event Opportunities</h2>
            <p className="text-gray-500 max-w-2xl mx-auto mb-16 text-base">
              Find the perfect events that match your skills and interests. From campus fests to corporate networking, we have it all.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {[
                { title: "Campus Fests & Culture Nights", desc: "Cultural fests, culture nights, fresher's and farewell events" },
                { title: "Hackathons & Tech Meets", desc: "Hackathons, tech talks, startup meetups, and conferences" },
                { title: "Workshops & Skill-ups", desc: "Hands-on workshops, training sessions, skill-building bootcamps" },
                { title: "Corporate & Networking", desc: "Offsites, product launches, mixers and industry summits" },
                { title: "Career & Job Fairs", desc: "Campus placements, job fairs, and internship summits" },
                { title: "Music & Entertainment", desc: "College gigs, DJ nights, open mics, and cultural performances" }
              ].map((category, i) => (
                <div key={i} className="group bg-[#f8f9fa] p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-[#CD7F32]/50 transition-all duration-300 flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-[#CD7F32]/10 flex items-center justify-center mb-6 text-[#CD7F32] group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-serif group-hover:text-[#CD7F32] transition-colors">{category.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{category.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Top Events Grid */}
        <section className="py-24 bg-[#F5F5F5] text-[#242424]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold font-serif text-gray-900 mb-2">Featured Staffing Events</h2>
                <p className="text-gray-600 text-base">Explore top opportunities currently hiring on-ground talent.</p>
              </div>
              <Link href="/events" className="text-[#CD7F32] font-bold text-base hover:underline flex items-center gap-1">
                <span>View All Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {eventsLoading ? (
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-[4/5] bg-white rounded-2xl shadow-sm border border-gray-200 animate-pulse" />
                ))}
              </div>
            ) : topEvents.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm text-center text-gray-500 font-medium">
                No featured events available at the moment.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                {topEvents.slice(0, 6).map(event => (
                  <Link href={`/events/${event.id}`} key={event.id} className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 border border-gray-200 hover:border-[#CD7F32]/40 transition-all duration-300">
                    <div className="aspect-[4/3] rounded-t-2xl overflow-hidden bg-gray-100 relative">
                      <img 
                        src={event.coverImageUrl || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000&auto=format&fit=crop"} 
                        alt={event.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#CD7F32] shadow-sm uppercase">
                          {event.status || 'UPCOMING'}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg leading-snug line-clamp-2 group-hover:text-[#CD7F32] transition-colors">{event.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1 mb-4 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span>{event.location || 'Online / India'}</span>
                      </p>
                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
                        <span className="text-gray-500 uppercase">{event.bands || 'Staffing'}</span>
                        <span className="text-[#CD7F32]">View Roles &rarr;</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-white text-[#242424] border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold font-serif text-[#CD7F32] mb-4">Simple, Transparent Pricing</h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-base">
                Whether you are an independent talent or an event production company, we have a plan designed for your growth.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
              {/* Free Tier */}
              <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all flex flex-col">
                <h3 className="text-2xl font-bold font-serif mb-2">Talent / Starter</h3>
                <div className="text-4xl font-bold mb-6">₹0<span className="text-sm text-gray-500 font-normal">/forever</span></div>
                <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-600">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Apply to unlimited event jobs</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Access Live Runner Errand board</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Direct peer-to-peer messaging</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Digital staffing pass & reviews</li>
                </ul>
                <Link href="/register" className="w-full block text-center bg-white border-2 border-gray-300 hover:border-[#CD7F32] text-[#242424] px-6 py-3.5 rounded-xl font-bold transition-all">
                  Join for Free
                </Link>
              </div>

              {/* Pro Tier */}
              <div className="bg-[#242424] text-white rounded-3xl p-8 border-2 border-[#CD7F32] shadow-2xl flex flex-col relative transform lg:-translate-y-4">
                <div className="absolute -top-4 right-8 bg-[#CD7F32] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider font-mono">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold font-serif mb-2 text-[#CD7F32]">Manager Pro</h3>
                <div className="text-4xl font-bold mb-6">₹4,999<span className="text-sm text-gray-400 font-normal">/month</span></div>
                <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-300">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Host up to 15 active events/month</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Broadcast live runner errands</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Advanced talent filtering & badges</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Dispute resolution & rating controls</li>
                </ul>
                <Link href="/register" className="w-full block text-center bg-[#CD7F32] hover:bg-[#b06a29] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-[#CD7F32]/30">
                  Start 14-Day Trial
                </Link>
              </div>

              {/* Enterprise Tier */}
              <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all flex flex-col">
                <h3 className="text-2xl font-bold font-serif mb-2">Enterprise</h3>
                <div className="text-4xl font-bold mb-6">₹14,999<span className="text-sm text-gray-500 font-normal">/month</span></div>
                <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-600">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Unlimited events & broadcasts</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Dedicated 24/7 account manager</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Custom runner API integrations</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Custom branding & SSO access</li>
                </ul>
                <Link href="/support" className="w-full block text-center bg-white border-2 border-gray-300 hover:border-[#CD7F32] text-[#242424] px-6 py-3.5 rounded-xl font-bold transition-all">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section & Luxury Footer */}
        <section className="bg-gradient-to-br from-[#D68D46] to-[#b06a29] pt-20 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold font-serif mb-4">Ready to Transform Event Operations?</h2>
            <p className="text-white/90 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of event professionals, managers, and runners already building on BackStage.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="bg-[#242424] hover:bg-[#1a1a1a] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 text-base">
                <span>Create Free Account</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-base">
                Sign In to Portal
              </Link>
            </div>
          </div>

          {/* Footer with Luxury Logo */}
          <footer className="bg-[#1a1a1a] py-16 border-t-[6px] border-[#a66a2e] text-sm text-gray-400">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
              <div>
                <div className="mb-6">
                  <Logo size="lg" showText={true} />
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  The ultimate platform for event staffing, real-time runner errands, and community collaboration.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs font-mono">Platform</h4>
                <ul className="space-y-3 text-gray-400 text-xs">
                  <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="/events" className="hover:text-white transition-colors">Events Portal</Link></li>
                  <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing Tiers</Link></li>
                  <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs font-mono">Operations</h4>
                <ul className="space-y-3 text-gray-400 text-xs">
                  <li><Link href="/worker" className="hover:text-white transition-colors">Talent Dashboard</Link></li>
                  <li><Link href="/manager/dashboard" className="hover:text-white transition-colors">Manager Portal</Link></li>
                  <li><Link href="/worker/runners" className="hover:text-white transition-colors">Live Errand Board</Link></li>
                  <li><Link href="/support" className="hover:text-white transition-colors">Help Center</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs font-mono">Legal & Contact</h4>
                <ul className="space-y-3 text-gray-400 text-xs">
                  <li>support@backstage-app.com</li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li>&copy; {new Date().getFullYear()} BackStage App. All rights reserved.</li>
                </ul>
              </div>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
