'use client';
import { apiFetch } from '@/lib/apiFetch';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function DeleteAccountPage() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/profile`, { method: 'DELETE' });
      if (res.ok) {
        alert("Your account has been deleted.");
        window.location.href = '/';
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete account.");
        setDeleting(false);
      }
    } catch (e) {
      setError("An unexpected error occurred.");
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcf9] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-red-100 p-8 text-center"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-4">Confirm Account Deletion</h1>
        
        <p className="text-gray-600 mb-6 font-medium">
          Are you absolutely sure you want to delete your account? 
          <br /><br />
          <span className="text-red-600 font-bold">You will lose all your data, messages, and events. This action cannot be undone.</span>
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm font-bold rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button 
            onClick={handleDelete}
            disabled={deleting}
            className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting Account...' : 'Yes, Delete My Account'}
          </button>
          <button 
            onClick={() => router.back()}
            disabled={deleting}
            className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel and Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
