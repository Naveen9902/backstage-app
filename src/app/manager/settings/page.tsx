'use client';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [inAppNotifs, setInAppNotifs] = useState(true);

  useEffect(() => {
    fetch('/api/user/settings')
      .then(res => res.json())
      .then(data => {
        if (data.notificationsEnabled !== undefined) {
          setInAppNotifs(data.notificationsEnabled);
        }
      })
      .catch(err => console.error('Failed to load settings', err));
  }, []);

  const handleToggleInApp = async () => {
    const newVal = !inAppNotifs;
    setInAppNotifs(newVal);
    try {
      await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationsEnabled: newVal })
      });
    } catch (error) {
      console.error('Failed to update settings', error);
      setInAppNotifs(!newVal); // revert on error
    }
  };

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordStatus({ type: 'error', message: 'Both fields are required' });
      return;
    }
    
    setUpdatingPassword(true);
    setPasswordStatus(null);
    
    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setPasswordStatus({ type: 'error', message: data.error || 'Update failed' });
      } else {
        setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setPasswordStatus({ type: 'error', message: 'An unexpected error occurred' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="text-[#242424] max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">Settings</h1>
        <p className="text-lg text-gray-700">Configure your manager account preferences</p>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white rounded-xl p-8 border border-gray-100 space-y-8" 
        style={{ boxShadow: '-6px 6px 0px rgba(205, 127, 50, 0.9)' }}
      >
        {/* Notifications */}
        <div>
          <h2 className="text-2xl font-bold font-serif mb-4 pb-2 border-b border-gray-100">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold">In-App Notifications</h4>
                <p className="text-sm text-gray-500">Receive alerts within the platform</p>
              </div>
              <button 
                onClick={handleToggleInApp}
                className={`w-12 h-6 rounded-full transition-colors relative ${inAppNotifs ? 'bg-[#CD7F32]' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${inAppNotifs ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold">Email Notifications</h4>
                <p className="text-sm text-gray-500">Receive application updates via email</p>
              </div>
              <button 
                onClick={() => setEmailNotifs(!emailNotifs)}
                className={`w-12 h-6 rounded-full transition-colors relative ${emailNotifs ? 'bg-[#CD7F32]' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${emailNotifs ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold">SMS Notifications</h4>
                <p className="text-sm text-gray-500">Get text alerts for runner dispatches</p>
              </div>
              <button 
                onClick={() => setSmsNotifs(!smsNotifs)}
                className={`w-12 h-6 rounded-full transition-colors relative ${smsNotifs ? 'bg-[#CD7F32]' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${smsNotifs ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div>
          <h2 className="text-2xl font-bold font-serif mb-4 pb-2 border-b border-gray-100">Security</h2>
          <form className="space-y-4 max-w-md" onSubmit={handleUpdatePassword}>
            {passwordStatus && (
              <div className={`p-3 rounded-lg text-sm font-semibold ${passwordStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {passwordStatus.message}
              </div>
            )}
            <div>
              <label className="text-sm font-bold text-gray-700">Current Password</label>
              <div className="relative mt-1">
                <input 
                  type={showCurrentPassword ? "text" : "password"} 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:border-[#CD7F32] outline-none pr-10" 
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700">New Password</label>
              <div className="relative mt-1">
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:border-[#CD7F32] outline-none pr-10" 
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={updatingPassword}
              className={`bg-[#242424] text-white px-6 py-2 rounded-lg font-bold transition-colors ${updatingPassword ? 'opacity-50' : 'hover:bg-black'}`}
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Billing */}
        <div>
          <h2 className="text-2xl font-bold font-serif mb-4 pb-2 border-b border-gray-100">Billing</h2>
          <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 bg-blue-900 rounded flex items-center justify-center text-white text-xs font-bold italic">VISA</div>
              <div>
                <p className="font-bold">•••• •••• •••• 4242</p>
                <p className="text-xs text-gray-500">Expires 12/28</p>
              </div>
            </div>
            <button className="text-[#CD7F32] font-bold text-sm hover:underline">Edit</button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
