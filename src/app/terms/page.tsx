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
              <p>Payments for services rendered are processed through our secure third-party provider. BackStage charges a standard platform fee on transactions which will be clearly displayed before any commitments are made.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
