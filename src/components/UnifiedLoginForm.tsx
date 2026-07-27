'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';

export default function UnifiedLoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const executeLoginWithEmail = async (emailToUse: string, passToUse: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse, password: passToUse })
      });
      const data = await res.json();
      if (res.ok) {
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('backstage_user_session', JSON.stringify(data)); } catch(e){}
        }
        if (data.role === 'ADMIN') window.location.href = '/admin';
        else if (data.role === 'MANAGER') window.location.href = '/manager/dashboard';
        else if (data.role === 'USER') window.location.href = '/user';
        else window.location.href = '/worker';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    executeLoginWithEmail(formData.email, formData.password);
  };

  const handleDemoLogin = (role: 'USER' | 'MANAGER' | 'WORKER') => {
    if (role === 'USER') executeLoginWithEmail('user@test.com', 'UserPass123!');
    else if (role === 'MANAGER') executeLoginWithEmail('manager@test.com', 'ManagerPass123!');
    else executeLoginWithEmail('worker@test.com', 'WorkerPass123!');
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl relative w-full max-w-md">
      <div className="absolute inset-0 bg-gradient-to-br from-[#CD7F32]/10 to-transparent rounded-2xl pointer-events-none" />
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold font-serif text-white mb-1">Unified Access</h3>
        <p className="text-xs text-gray-400 mb-6">Login for Managers, Workers & Users</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Email address"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#CD7F32] transition-colors"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#CD7F32] transition-colors"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#CD7F32] hover:bg-[#b06a29] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <LogIn className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3 text-center">Fast Demo Access</p>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => handleDemoLogin('MANAGER')}
              className="bg-white/5 hover:bg-[#CD7F32]/20 border border-white/5 hover:border-[#CD7F32]/50 text-white text-xs py-2 rounded-lg transition-all"
            >
              Manager
            </button>
            <button 
              onClick={() => handleDemoLogin('WORKER')}
              className="bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/50 text-white text-xs py-2 rounded-lg transition-all"
            >
              Worker
            </button>
            <button 
              onClick={() => handleDemoLogin('USER')}
              className="bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/50 text-white text-xs py-2 rounded-lg transition-all"
            >
              User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
