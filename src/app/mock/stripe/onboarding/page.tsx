'use client';

import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';

function MockStripeOnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const workerId = searchParams.get('workerId');
  const [loading, setLoading] = useState(false);

  const handleSimulateConnection = async () => {
    if (!workerId) return;
    setLoading(true);
    try {
      // We will create a local API to just update the worker's stripeAccountId
      const res = await fetch('/api/stripe/webhook/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'MOCK_ONBOARDING',
          workerId
        })
      });

      if (res.ok) {
        // Redirect back to worker profile with success flag
        window.location.href = '/worker/profile?stripe_return=true';
      } else {
        alert('Simulation failed.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Error during simulation');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-slate-100"
      >
        <div className="bg-[#635BFF] p-8 text-center text-white">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Stripe Connect (Simulation)</h1>
          <p className="text-blue-100 text-sm">
            You are seeing this page because no STRIPE_SECRET_KEY was found in your environment variables.
          </p>
        </div>
        
        <div className="p-8">
          <h3 className="font-bold text-slate-800 text-lg mb-2">Simulate Stripe Onboarding</h3>
          <p className="text-slate-600 text-sm mb-6">
            In production, this would be a secure Stripe-hosted form where the worker enters their bank details and SSN. Clicking the button below will instantly simulate a successful onboarding completion.
          </p>

          <button 
            onClick={handleSimulateConnection}
            disabled={loading || !workerId}
            className="w-full bg-[#635BFF] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#5249E5] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Simulating...' : 'Simulate Successful Connection'}
          </button>
          
          <button 
            onClick={() => router.push('/worker/profile')}
            disabled={loading}
            className="w-full mt-3 bg-white text-slate-600 border border-slate-200 font-bold py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Cancel & Return
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function MockStripeOnboarding() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MockStripeOnboardingContent />
    </Suspense>
  );
}
