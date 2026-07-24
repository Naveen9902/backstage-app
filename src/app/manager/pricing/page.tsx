'use client';

import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
      <section className="py-16 md:py-24 text-[#242424]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#CD7F32] mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Whether you are an independent talent or a large event production company, we have a plan for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-shadow flex flex-col">
              <h3 className="text-xl font-bold font-serif mb-2">Talent / Worker</h3>
              <div className="text-4xl font-bold mb-6">Free<span className="text-sm text-gray-500 font-normal">/forever</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Create professional profile
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Apply to unlimited events
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Receive ratings & reviews
                </li>
              </ul>
              <button className="w-full text-center bg-white border-2 border-gray-200 hover:border-[#CD7F32] text-[#242424] px-6 py-3 rounded-xl font-bold transition-colors">
                Current Plan
              </button>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="bg-[#242424] rounded-3xl p-8 border border-[#CD7F32]/50 shadow-2xl transform md:-translate-y-4 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#CD7F32] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">MOST POPULAR</div>
              <h3 className="text-xl font-bold font-serif text-white mb-2">Manager Pro</h3>
              <div className="text-4xl font-bold text-white mb-6">₹3999<span className="text-sm text-white/50 font-normal">/month</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-white/80">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Host up to 10 events/month
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Advanced talent filtering
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  In-app messaging & dispatch
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Basic analytics dashboard
                </li>
              </ul>
              <button className="w-full text-center bg-[#CD7F32] hover:bg-[#b06a29] text-white px-6 py-3 rounded-xl font-bold transition-colors">
                Start 14-Day Trial
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-shadow flex flex-col">
              <h3 className="text-xl font-bold font-serif mb-2">Enterprise</h3>
              <div className="text-4xl font-bold mb-6">₹14999<span className="text-sm text-gray-500 font-normal">/month</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Unlimited events
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Dedicated account manager
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Custom runner integrations
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  API access & SSO
                </li>
              </ul>
              <button className="w-full text-center bg-white border-2 border-gray-200 hover:border-[#CD7F32] text-[#242424] px-6 py-3 rounded-xl font-bold transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
