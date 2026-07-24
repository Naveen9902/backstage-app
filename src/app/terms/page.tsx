'use client';

import Navbar from '@/components/Navbar';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#242424] font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-[#1a1a1a] p-10 rounded-3xl border border-white/5">
          <h1 className="text-4xl font-bold font-serif text-[#CD7F32] mb-2">Terms of Service</h1>
          <p className="text-white/40 mb-10 pb-10 border-b border-white/10">Last Updated: July 19, 2026</p>
          
          <div className="prose prose-invert max-w-none text-white/70 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using BackStage, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. User Accounts</h2>
              <p>You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.</p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Platform Services</h2>
              <p>BackStage provides a marketplace for event managers and talent. We do not employ the talent directly, nor are we responsible for the execution of events. Any contracts or agreements are strictly between the Manager and the Worker.</p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Payment and Fees</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-[#CD7F32] mb-2">4.1 Terms for Event Managers</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Upfront Commitment:</strong> Managers are required to authorize or securely hold funds in escrow for the total estimated staffing cost before workers are confirmed for an event.</li>
                    <li><strong>Platform Fees:</strong> BackStage charges a standard service fee on top of the worker's payout. This fee covers platform maintenance, insurance, and payment processing and will be clearly itemized prior to payment.</li>
                    <li><strong>Cancellations:</strong> If a manager cancels a shift within 24 hours of the start time, a cancellation fee equivalent to a percentage of the agreed payout may be charged and distributed to the affected workers.</li>
                    <li><strong>Disputes:</strong> Managers have 48 hours after a shift concludes to file a dispute regarding worker hours or performance. If no dispute is filed, funds will automatically be released to the worker.</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-[#CD7F32] mb-2">4.2 Terms for Workers (Talent)</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Payout Timelines:</strong> Workers will typically receive their payouts within 3-5 business days after a shift is successfully completed and the manager has approved the hours.</li>
                    <li><strong>Stripe Connect:</strong> All payouts are processed via Stripe Connect. Workers must complete Stripe Identity Verification and provide valid bank details to receive payments.</li>
                    <li><strong>Platform Deductions:</strong> The agreed-upon hourly rate displayed when accepting a shift is the final rate the worker will earn. BackStage does not deduct hidden fees from this stated payout.</li>
                    <li><strong>No-Shows and Cancellations:</strong> Workers who fail to show up for an accepted shift or cancel with less than 24 hours' notice may face account penalties, suspension, or permanent banning from the BackStage platform.</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-[#CD7F32] mb-2">4.3 General Payment Terms</h3>
                  <p>All transactions are securely processed by third-party providers (e.g., Stripe). BackStage does not store sensitive credit card or banking information on our servers. By using the platform, both parties agree to abide by the terms of our payment processing partners.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
