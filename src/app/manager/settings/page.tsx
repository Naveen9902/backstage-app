'use client';
import { motion } from 'framer-motion';
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
          <form className="space-y-4 max-w-md">
            <div>
              <label className="text-sm font-bold text-gray-700">Current Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
            </div>
            <button type="button" className="bg-[#242424] text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition-colors">
              Update Password
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
