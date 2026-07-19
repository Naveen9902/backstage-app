'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);

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
        if (data.role === 'ADMIN') {
          window.location.href = '/admin';
        } else if (data.role === 'MANAGER') {
          window.location.href = '/manager/dashboard';
        } else if (data.role === 'USER') {
          window.location.href = '/user';
        } else {
          window.location.href = '/worker';
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#242424] relative overflow-x-hidden font-sans">
      <Navbar />
      <div className="flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#CD7F32]/10 rounded-full blur-[120px] pointer-events-none" />

        <div 
          className="w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-2xl shadow-black/50 border border-white/5 p-8 relative z-10 mt-8 mb-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#F5F5DC] mb-2 font-serif">Welcome Back</h2>
            <p className="text-[#F5F5DC]/60 text-sm">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm px-4 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#F5F5DC]/80 mb-1.5">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-[#F5F5DC] placeholder-[#F5F5DC]/30 focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32] transition-all"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#F5F5DC]/80">Password</label>
                <Link href="#" className="text-xs text-[#CD7F32] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-[#F5F5DC] placeholder-[#F5F5DC]/30 focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32] transition-all pr-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#CD7F32] text-white rounded-xl py-3.5 font-bold shadow-lg shadow-[#CD7F32]/20 mt-4 disabled:opacity-70 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-4 text-sm text-[#F5F5DC]/50 uppercase tracking-widest font-semibold">Or</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            <a
              href={`/api/auth/google`}
              className="w-full bg-white text-[#242424] rounded-xl py-3.5 font-bold shadow-lg flex items-center justify-center gap-3 hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign in with Google
            </a>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[#F5F5DC]/60 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#CD7F32] font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
