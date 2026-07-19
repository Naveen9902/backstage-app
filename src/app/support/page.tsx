'use client';

import Navbar from '@/components/Navbar';

export default function Support() {
  return (
    <div className="min-h-screen bg-[#242424] font-sans">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-bold font-serif text-[#CD7F32] mb-6 text-center">Contact Support</h1>
        <p className="text-white/60 text-center mb-12 text-lg">We're here to help. Send us a message and we'll respond within 24 hours.</p>
        
        <form className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">First Name</label>
              <input type="text" className="w-full bg-[#242424] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#CD7F32]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">Last Name</label>
              <input type="text" className="w-full bg-[#242424] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#CD7F32]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-white/80 mb-2">Email Address</label>
            <input type="email" className="w-full bg-[#242424] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#CD7F32]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-white/80 mb-2">How can we help you?</label>
            <textarea rows={5} className="w-full bg-[#242424] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#CD7F32] resize-none"></textarea>
          </div>
          <button type="submit" className="w-full bg-[#CD7F32] text-white py-4 rounded-lg font-bold hover:bg-[#b06a29] transition-colors text-lg">
            Send Message
          </button>
        </form>
      </main>
    </div>
  );
}
