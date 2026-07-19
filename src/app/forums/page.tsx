'use client';

import Navbar from '@/components/Navbar';

export default function Forums() {
  return (
    <div className="min-h-screen bg-[#242424] font-sans">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-bold font-serif text-[#CD7F32] mb-4">Community Forums</h1>
            <p className="text-white/60 text-lg">Connect, share, and discuss with event professionals worldwide.</p>
          </div>
          <button className="bg-[#CD7F32] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#b06a29] transition-colors">
            New Topic
          </button>
        </div>
        
        <div className="space-y-4">
          {[
            { title: "Best practices for large music festivals?", replies: 142, category: "Event Management" },
            { title: "Looking for reliable AV technicians in NYC", replies: 28, category: "Job Board" },
            { title: "How to handle last-minute staff cancellations", replies: 89, category: "Advice & Support" },
            { title: "Introduce yourself! (Monthly Thread)", replies: 456, category: "General Discussion" }
          ].map((topic, i) => (
            <div key={i} className="bg-[#1a1a1a] p-6 rounded-xl border border-white/5 flex items-center justify-between hover:bg-[#2a2a2a] transition-colors cursor-pointer group">
              <div>
                <span className="text-xs font-bold text-[#CD7F32] uppercase tracking-wider mb-2 block">{topic.category}</span>
                <h3 className="text-xl font-bold text-white group-hover:text-[#CD7F32] transition-colors">{topic.title}</h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white/80">{topic.replies}</div>
                <div className="text-xs text-white/40 uppercase tracking-widest">Replies</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
