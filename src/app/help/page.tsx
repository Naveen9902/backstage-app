'use client';

import Navbar from '@/components/Navbar';

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-[#242424] font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-bold font-serif text-[#CD7F32] mb-12 text-center">Help Center</h1>
        
        <div className="relative mb-16">
          <input 
            type="text" 
            placeholder="Search for articles, guides, and FAQs..." 
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-6 py-5 text-lg text-white focus:outline-none focus:border-[#CD7F32] shadow-xl"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#CD7F32] text-white px-6 py-2.5 rounded-lg font-bold">
            Search
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: "Getting Started", icon: "🚀", items: ["Creating your profile", "Verifying your account", "Navigating the dashboard"] },
            { title: "For Managers", icon: "🏢", items: ["Posting a new event", "Reviewing applicants", "Processing payments"] },
            { title: "For Talent", icon: "⭐", items: ["Applying for shifts", "Setting your availability", "Understanding ratings"] },
            { title: "Account & Billing", icon: "💳", items: ["Updating payment methods", "Subscription plans", "Tax documents"] }
          ].map((cat, i) => (
            <div key={i} className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5">
              <div className="text-4xl mb-4">{cat.icon}</div>
              <h2 className="text-2xl font-bold text-white mb-6">{cat.title}</h2>
              <ul className="space-y-3">
                {cat.items.map((item, j) => (
                  <li key={j}>
                    <a href="#" className="text-white/60 hover:text-[#CD7F32] transition-colors flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
