'use client';

import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';

function MockStripeCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const applicationId = searchParams.get('applicationId');
  const amount = searchParams.get('amount');
  const eventId = searchParams.get('eventId');
  const [loading, setLoading] = useState(false);

  const handleSimulatePayment = async () => {
    if (!applicationId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/webhook/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'MOCK_CHECKOUT',
          applicationId,
          amountTotal: parseFloat(amount || '0')
        })
      });

      if (res.ok) {
        // Redirect back to event page with success param
        window.location.href = `/manager/events/${eventId}?payment_success=true`;
      } else {
        alert('Payment simulation failed.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Error during payment simulation');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row items-center justify-center p-4 gap-8">
      
      {/* Left side: Order Summary */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-sm w-full pt-8 md:pt-0"
      >
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Pay & Accept Worker
          </h2>
          <p className="text-slate-500 text-sm mt-1">Back Stage Platform</p>
        </div>
        
        <div className="text-4xl font-bold text-slate-800 mb-6">
          ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
        </div>

        <div className="space-y-4 text-sm text-slate-600 mb-8 border-y border-slate-200 py-6">
          <div className="flex justify-between">
            <span>Worker Pay (Escrow)</span>
            <span className="font-medium text-slate-800">${amount ? (parseFloat(amount) / 1.1).toFixed(2) : '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform Fee (10%)</span>
            <span className="font-medium text-slate-800">${amount ? (parseFloat(amount) - (parseFloat(amount) / 1.1)).toFixed(2) : '0.00'}</span>
          </div>
        </div>
      </motion.div>

      {/* Right side: Mock Payment Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-slate-200"
      >
        <div className="bg-[#111111] p-6 text-center border-b border-[#CD7F32]/20">
          <h3 className="text-[#CD7F32] font-bold text-lg mb-1">Stripe Simulation Mode</h3>
          <p className="text-gray-400 text-xs">No actual charges will be made</p>
        </div>
        
        <div className="p-8">
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Card Information</label>
            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-slate-400 flex items-center justify-between font-mono text-sm cursor-not-allowed">
              <span>•••• •••• •••• 4242</span>
              <div className="flex gap-2">
                <span>12/28</span>
                <span>CVC</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">This is a mock checkout page because you haven't provided Stripe API keys.</p>
          </div>

          <button 
            onClick={handleSimulatePayment}
            disabled={loading || !applicationId}
            className="w-full bg-[#111111] text-white font-bold py-4 px-4 rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 border border-slate-800"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </span>
            ) : (
              `Simulate Paying $${amount ? parseFloat(amount).toFixed(2) : '0.00'}`
            )}
          </button>
          
          <button 
            onClick={() => router.push(`/manager/events/${eventId}?payment_canceled=true`)}
            disabled={loading}
            className="w-full mt-4 bg-white text-slate-500 font-bold py-3 px-4 rounded-xl hover:text-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel Return to Event
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function MockStripeCheckout() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MockStripeCheckoutContent />
    </Suspense>
  );
}
