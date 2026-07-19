'use client';

import Navbar from '@/components/Navbar';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#242424] font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-[#1a1a1a] p-10 rounded-3xl border border-white/5">
          <h1 className="text-4xl font-bold font-serif text-[#CD7F32] mb-2">Privacy Policy</h1>
          <p className="text-white/40 mb-10 pb-10 border-b border-white/10">Last Updated: July 19, 2026</p>
          
          <div className="prose prose-invert max-w-none text-white/70 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.</p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Information</h2>
              <p>We may use the information we collect about you to: Provide, maintain, and improve our Services; Process or facilitate payments for Services; Send you important notices; and Personalize the Services.</p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing</h2>
              <p>We may share your information with event managers if you apply for a job, or with third party service providers who need access to such information to carry out work on our behalf (such as payment processing).</p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Security</h2>
              <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
