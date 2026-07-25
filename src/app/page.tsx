'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AppGateway() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    // Check if user is already logged in and redirect to dashboard directly
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
  }, []);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
    setLoading(false);
  };

  const handleVerify2FA = async () => {
    if (!otpCode) return;
    setLoading(true);
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
    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-white font-sans p-4 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#CD7F32]/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center text-center max-w-sm"
        >
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-[#242424] border border-white/10 shadow-2xl flex items-center justify-center p-3 overflow-hidden relative">
              <img src="/logo.jpg" alt="BackStage Logo" className="w-full h-full object-contain drop-shadow-md relative z-10" />
            </div>
            <div className="absolute -inset-2 rounded-3xl border border-[#CD7F32]/40 animate-[spin_4s_linear_infinite]" />
            <div className="absolute -inset-4 rounded-3xl border border-[#CD7F32]/20 animate-[spin_6s_linear_infinite_reverse]" />
          </div>
          
          <h2 className="text-2xl font-bold font-serif text-white tracking-wide mb-2">Back<span className="text-[#CD7F32]">Stage</span> Portal</h2>
          <p className="text-sm font-mono text-[#CD7F32] uppercase tracking-widest animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Verifying Session & Redirecting...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col justify-between font-sans selection:bg-[#CD7F32]/30 relative overflow-hidden text-white">
      {/* Background Grid & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#CD7F32]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242424] border border-white/10 flex items-center justify-center p-1 shadow-md overflow-hidden">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold font-serif tracking-wide">Back<span className="text-[#CD7F32]">Stage</span></span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-widest bg-[#CD7F32]/20 text-[#CD7F32] px-2.5 py-0.5 rounded-full border border-[#CD7F32]/30 ml-2">
            <Sparkles className="w-3 h-3" /> App Gateway
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/register" className="text-gray-300 hover:text-white transition-colors">
            Create Account
          </Link>
          <Link href="/support" className="text-gray-300 hover:text-white transition-colors hidden sm:inline-block">
            Support
          </Link>
          <Link href="/register" className="bg-[#CD7F32] hover:bg-[#b06a29] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5">
            <span>Sign Up</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Login Portal Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#1a1a1a]/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/80 border border-white/10 p-8 sm:p-10 relative overflow-hidden"
        >
          {/* Subtle Accent Glow Top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#CD7F32] to-transparent opacity-75" />

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#242424] border border-white/10 mb-4 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-[#CD7F32]" />
            </div>
            <h1 className="text-3xl font-bold font-serif text-[#F5F5DC] mb-2">Operations Portal</h1>
            <p className="text-gray-400 text-sm">Enter your credentials to access your dashboard</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/15 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2.5 text-left"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}

          {requires2FA ? (
            <div className="space-y-5">
              <div className="text-center mb-6 bg-black/40 p-4 rounded-2xl border border-white/5">
                <p className="text-gray-300 text-sm font-medium">Two-Factor Authentication Required</p>
                <p className="text-gray-500 text-xs mt-1">Enter the 6-digit code from your authenticator app.</p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 font-mono">Authentication Code</label>
                <input 
                  type="text" 
                  maxLength={6}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32] transition-all text-center tracking-[0.5em] text-xl font-mono font-bold"
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
                disabled={loading || otpCode.length !== 6}
                className="w-full bg-gradient-to-r from-[#CD7F32] to-[#b06a29] hover:from-[#b06a29] hover:to-[#965820] text-white rounded-xl py-4 font-bold shadow-lg shadow-[#CD7F32]/20 mt-4 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Verify & Access Portal'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 font-mono">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  <input 
                    type="email" 
                    required
                    className="w-full bg-black/50 border border-white/15 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32] transition-all text-sm font-medium"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">Password</label>
                  <Link href="/forgot-password" className="text-xs text-[#CD7F32] hover:underline font-semibold">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    className="w-full bg-black/50 border border-white/15 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32] transition-all text-sm font-medium"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#CD7F32] to-[#b06a29] hover:from-[#b06a29] hover:to-[#965820] text-white rounded-xl py-4 font-bold shadow-lg shadow-[#CD7F32]/20 mt-2 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-white/10"></div>
                <span className="px-4 text-[11px] text-gray-500 uppercase tracking-widest font-mono font-bold">Or Continue With</span>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              <a
                href="/api/auth/google"
                className="w-full bg-[#242424] hover:bg-[#2a2a2a] border border-white/10 text-white rounded-xl py-3.5 font-bold shadow-md flex items-center justify-center gap-3 transition-all active:scale-[0.98] text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span>Sign in with Google</span>
              </a>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-xs">
              Don&apos;t have an operational account yet?{' '}
              <Link href="/register" className="text-[#CD7F32] font-bold hover:underline ml-1">
                Request Access / Sign Up
              </Link>
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} BackStage App Portal. All operational rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
          <Link href="/support" className="hover:text-gray-400 transition-colors">Help Center</Link>
        </div>
      </footer>
    </div>
  );
}
