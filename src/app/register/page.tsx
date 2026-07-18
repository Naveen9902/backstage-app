'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Register() {
  const [role, setRole] = useState<'WORKER' | 'MANAGER' | 'ADMIN'>('WORKER');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });
      if (res.ok) {
        window.location.href = '/login';
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#242424] relative overflow-x-hidden font-sans">
      <Navbar />
      <div className="flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
        {/* Background glow */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#CD7F32]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-[#CD7F32]/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-2xl shadow-black/50 border border-white/5 p-8 relative z-10 mt-8 mb-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#F5F5DC] mb-2 font-serif">Create Account</h2>
            <p className="text-[#F5F5DC]/60 text-sm">Join the premier event staffing network</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
          <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 mb-6">
            <button
              type="button"
              onClick={() => setRole('WORKER')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === 'WORKER' ? 'bg-[#CD7F32] text-white shadow-md' : 'text-[#F5F5DC]/60 hover:text-[#F5F5DC]'}`}
            >
              I'm a Talent
            </button>
            <button
              type="button"
              onClick={() => setRole('MANAGER')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === 'MANAGER' ? 'bg-[#CD7F32] text-white shadow-md' : 'text-[#F5F5DC]/60 hover:text-[#F5F5DC]'}`}
            >
              I'm a Manager
            </button>
          </div>

            <div>
              <label className="block text-sm font-medium text-[#F5F5DC]/80 mb-1.5">Full Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-[#F5F5DC] placeholder-[#F5F5DC]/30 focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32] transition-all"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

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
              <label className="block text-sm font-medium text-[#F5F5DC]/80 mb-1.5">Password</label>
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
                'Create Account'
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#F5F5DC]/60 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-[#CD7F32] font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
