'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#F5F5DC] font-sans selection:bg-[#CD7F32]/30">
      <Navbar />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#CD7F32]/30 bg-[#CD7F32]/10 text-[#CD7F32] text-xs font-bold tracking-widest uppercase"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Launching Soon
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-white"
          >
            The Future of <br/>
            <span className="text-[#CD7F32]">Event Staffing</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/70 max-w-lg leading-relaxed"
          >
            Connect with top-tier event professionals, find the perfect opportunities, and build your career in the events industry. BackStage is the all-in-one platform for event staffing and community building.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-1 w-full max-w-md lg:max-w-none"
        >
          <div className="bg-[#242424] rounded-2xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#CD7F32]/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="w-16 h-16 bg-[#CD7F32] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#CD7F32]/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#242424" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 font-serif">Your Event Hub</h2>
            <p className="text-white/60 leading-relaxed">
              Discover events, find jobs, connect with professionals, and grow your network.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold font-serif text-white mb-12 text-center">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {['Smart Matching', 'Instant Payments', 'Verified Ratings'].map((f) => (
              <div key={f} className="bg-[#242424] p-8 rounded-2xl border border-white/5 shadow-lg">
                <h3 className="text-xl font-bold text-[#CD7F32] mb-3">{f}</h3>
                <p className="text-white/60 text-sm leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold font-serif text-white mb-6">Upcoming Events</h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-12">Discover the hottest events hiring right now across the globe.</p>
          <div className="h-64 bg-[#242424] rounded-2xl border border-white/5 flex items-center justify-center">
            <span className="text-white/40">Event Listing Map / Cards</span>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold font-serif text-white mb-12 text-center">What People Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#242424] p-8 rounded-2xl border border-[#CD7F32]/20">
              <p className="italic text-white/80 mb-6">"BackStage completely transformed how we staff our festivals. The quality of talent is unmatched."</p>
              <div className="font-bold text-[#CD7F32]">- Sarah J., Event Manager</div>
            </div>
            <div className="bg-[#242424] p-8 rounded-2xl border border-[#CD7F32]/20">
              <p className="italic text-white/80 mb-6">"I found the best bartending gigs through this platform. The fast payments are a game changer!"</p>
              <div className="font-bold text-[#CD7F32]">- Mike T., Verified Talent</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold font-serif text-white mb-6">Simple Pricing</h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-12">No hidden fees. Transparent pricing for both talents and managers.</p>
          <div className="flex justify-center gap-8 flex-wrap">
            <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 w-80 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-2">Talent</h3>
              <div className="text-4xl font-bold text-[#CD7F32] mb-6">Free</div>
              <ul className="text-left text-white/60 space-y-3 mb-8">
                <li>✓ Create Profile</li>
                <li>✓ Apply to Jobs</li>
                <li>✓ Instant Payouts</li>
              </ul>
              <button className="w-full bg-[#242424] text-white py-2 rounded-lg hover:bg-black transition-colors border border-white/10">Sign Up</button>
            </div>
            <div className="bg-[#242424] p-8 rounded-2xl border border-[#CD7F32] w-80 shadow-2xl shadow-[#CD7F32]/10 relative">
              <div className="absolute top-0 right-0 bg-[#CD7F32] text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase">Popular</div>
              <h3 className="text-2xl font-bold text-white mb-2">Manager</h3>
              <div className="text-4xl font-bold text-[#CD7F32] mb-6">$49<span className="text-lg text-white/40">/mo</span></div>
              <ul className="text-left text-white/60 space-y-3 mb-8">
                <li>✓ Unlimited Events</li>
                <li>✓ Verified Talent Pool</li>
                <li>✓ Advanced Analytics</li>
              </ul>
              <button className="w-full bg-[#CD7F32] text-white py-2 rounded-lg hover:bg-[#a06227] transition-colors font-bold shadow-lg shadow-[#CD7F32]/20">Get Started</button>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
