'use client';

import Navbar from '@/components/Navbar';

export default function Blog() {
  return (
    <div className="min-h-screen bg-[#242424] font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-bold font-serif text-[#CD7F32] mb-8">Blog</h1>
        <div className="space-y-12">
          {[1, 2, 3].map(i => (
            <article key={i} className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 hover:border-[#CD7F32]/30 transition-colors">
              <div className="text-[#CD7F32] text-sm font-bold mb-3 uppercase tracking-widest">Industry News</div>
              <h2 className="text-3xl font-bold text-white mb-4">How to Source the Best Event Staff in 2026</h2>
              <p className="text-white/70 leading-relaxed mb-6">
                Discover the latest strategies and tools for finding top-tier event professionals. From leveraging new platform features to conducting better interviews, this guide covers everything you need to know about modern event staffing.
              </p>
              <button className="text-[#CD7F32] font-bold hover:underline">Read Full Article &rarr;</button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
