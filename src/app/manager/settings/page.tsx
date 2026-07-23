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
        if (data.isTwoFactorEnabled !== undefined) {
          setIs2FaEnabled(data.isTwoFactorEnabled);
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

  // 2FA State
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [setupOtp, setSetupOtp] = useState('');
  const [setup2FaStatus, setSetup2FaStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [generating2Fa, setGenerating2Fa] = useState(false);
  const [verifying2Fa, setVerifying2Fa] = useState(false);

  const handleGenerate2FA = async () => {
    setGenerating2Fa(true);
    try {
      const res = await fetch('/api/auth/2fa/generate', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setQrCodeUrl(data.qrCodeUrl);
      } else {
        setSetup2FaStatus({ type: 'error', message: data.error || 'Failed to generate 2FA' });
      }
    } catch (err) {
      setSetup2FaStatus({ type: 'error', message: 'An unexpected error occurred' });
    }
    setGenerating2Fa(false);
  };

  const handleVerify2FA = async () => {
    if (!setupOtp || setupOtp.length !== 6) return;
    setVerifying2Fa(true);
    setSetup2FaStatus(null);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: setupOtp })
      });
      const data = await res.json();
      if (res.ok) {
        setSetup2FaStatus({ type: 'success', message: 'Two-Factor Authentication enabled successfully!' });
        setIs2FaEnabled(true);
        setQrCodeUrl(null);
      } else {
        setSetup2FaStatus({ type: 'error', message: data.error || 'Invalid 2FA code' });
      }
    } catch (err) {
      setSetup2FaStatus({ type: 'error', message: 'An unexpected error occurred' });
    }
    setVerifying2Fa(false);
  };

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

          {/* Two Factor Auth */}
          <div className="mt-8 pt-8 border-t border-gray-100 max-w-md">
            <h3 className="text-xl font-bold font-serif mb-2">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500 mb-4">Secure your account with a time-based one-time password (TOTP) from an authenticator app.</p>
            
            {setup2FaStatus && (
              <div className={`p-3 rounded-lg text-sm font-semibold mb-4 ${setup2FaStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {setup2FaStatus.message}
              </div>
            )}

            {is2FaEnabled ? (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                2FA is currently active
              </div>
            ) : qrCodeUrl ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center">
                <p className="text-sm font-bold text-center mb-4">1. Scan this QR code with Google Authenticator or Authy</p>
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 bg-white border border-gray-200 p-2 rounded-lg shadow-sm mb-6" />
                <p className="text-sm font-bold text-center mb-2">2. Enter the 6-digit code below</p>
                <div className="flex gap-2 w-full max-w-xs">
                  <input 
                    type="text" 
                    maxLength={6}
                    value={setupOtp}
                    onChange={(e) => setSetupOtp(e.target.value)}
                    placeholder="000000"
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-center tracking-[0.25em] font-mono focus:border-[#CD7F32] outline-none"
                  />
                  <button 
                    onClick={handleVerify2FA}
                    disabled={verifying2Fa || setupOtp.length !== 6}
                    className="bg-[#CD7F32] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#a86524] disabled:opacity-50 transition-colors"
                  >
                    {verifying2Fa ? '...' : 'Verify'}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleGenerate2FA}
                disabled={generating2Fa}
                className="bg-[#242424] text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition-colors disabled:opacity-50"
              >
                {generating2Fa ? 'Loading...' : 'Enable 2FA'}
              </button>
            )}
          </div>
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
