'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          router.push('/admin');
        } else if (data.role === 'MANAGER') {
          router.push('/manager/dashboard');
        } else {
          router.push('/worker');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
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

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#F5F5DC]/80 mb-1.5">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-[#F5F5DC] placeholder-[#F5F5DC]/30 focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32] transition-all"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#F5F5DC]/80">Password</label>
                <Link href="#" className="text-xs text-[#CD7F32] hover:underline">Forgot password?</Link>
              </div>
              <input 
                type="password" 
                required
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-[#F5F5DC] placeholder-[#F5F5DC]/30 focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32] transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-[#CD7F32] text-white rounded-xl py-3.5 font-bold shadow-lg shadow-[#CD7F32]/20 mt-4 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#F5F5DC]/60 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#CD7F32] font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
