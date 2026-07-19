'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  const [topEvents, setTopEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events/top')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTopEvents(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#242424] font-sans selection:bg-[#CD7F32]/30">
      <Navbar />

      {/* Hero Section (Screenshot 2) */}
      <main className="max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight font-serif text-[#CD7F32]"
          >
            Event Staffing
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/80 max-w-lg leading-relaxed"
          >
            Connect with top-tier event professionals, find the perfect opportunities, and build your career in the events industry. BackStage is the all-in-one platform for event staffing and community building.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/register" className="bg-[#CD7F32] hover:bg-[#b06a29] text-white px-8 py-3 rounded-lg font-bold transition-colors">
              Start Free Trial
            </Link>
            <button className="bg-transparent border border-white/20 hover:border-white/50 text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              See How It Works
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-10 pt-8"
          >
            <div>
              <div className="text-3xl font-bold text-white mb-1">10K+</div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Events Hosted</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#CD7F32] mb-1">4.8★</div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Average Rating</div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 w-full max-w-md lg:max-w-none"
        >
          <div className="bg-[#2D2D2D] rounded-2xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#CD7F32]/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <path d="m9 16 2 2 4-4"/>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3 font-serif">Your Event Hub</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Discover events, find jobs, connect with professionals, and grow your network.
            </p>

            <div className="flex items-center gap-4 text-xs font-bold text-white/80">
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                1.2K MEMBERS
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                LIVE NOW
              </div>
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                4.8/5
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Features Section (Screenshot 3) */}
      <section className="py-24 bg-white text-[#242424]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#CD7F32] mb-4">Succeed in Events</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-16">
            BackStage provides all the tools you need to find talent, manage events, and build your professional network.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              {
                title: "Smart Staffing",
                desc: "Find the perfect candidates for your events with our intelligent matching algorithm.",
                icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>
              },
              {
                title: "Community Hub",
                desc: "Connect with other event professionals in dedicated community spaces.",
                icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              },
              {
                title: "Ratings & Reviews",
                desc: "Build your reputation with transparent ratings and detailed reviews.",
                icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              },
              {
                title: "Real-time Updates",
                desc: "Stay in the loop with instant notifications for applications and updates.",
                icon: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              },
              {
                title: "Runners Services",
                desc: "Hire dedicated on-site runners for seamless event execution and logistics support.",
                icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 16 14"/></>
              },
              {
                title: "Analytics Dashboard",
                desc: "Gain powerful insights into your event performance with real-time data analytics.",
                icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>
              }
            ].map((feature, i) => (
              <div key={i} className="group bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-[#CD7F32]/40 transition-all duration-300 flex flex-col items-center text-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </svg>
                <h3 className="text-xl font-bold mb-3 font-serif group-hover:text-[#CD7F32] transition-colors">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Top Events Section */}
      <section className="py-24 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-bold font-serif text-white mb-2">Live & Upcoming</h2>
              <p className="text-white/50">Join these active events happening right now.</p>
            </div>
            <Link href="/register" className="text-[#CD7F32] font-bold hover:underline">View All Events &rarr;</Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-[#242424] rounded-2xl border border-white/5 animate-pulse"></div>
              ))}
            </div>
          ) : topEvents.length === 0 ? (
            <div className="bg-[#242424] p-12 rounded-2xl border border-white/5 text-center text-white/50">
              No upcoming events at the moment. Check back soon!
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {topEvents.map(event => (
                <Link href={`/events/${event.id}`} key={event.id} className="bg-[#242424] p-6 rounded-2xl border border-white/5 hover:border-[#CD7F32]/50 hover:shadow-[0_0_20px_rgba(205,127,50,0.1)] transition-all group flex flex-col h-full cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase ${event.status === 'ONGOING' ? 'bg-green-500/20 text-green-400' : 'bg-[#CD7F32]/20 text-[#CD7F32]'}`}>
                      {event.status}
                    </span>
                    <span className="text-sm text-white/40">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 font-serif group-hover:text-[#CD7F32] transition-colors">{event.title}</h3>
                  <p className="text-white/60 text-sm mb-6 line-clamp-2">{event.description}</p>
                  
                  <div className="mt-auto space-y-3 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3 text-sm text-white/70">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {event.location}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white/70">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      {event.manager?.managerProfile?.company || 'Independent Manager'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white text-[#242424]">
        <div className="max-w-7xl mx-auto px-6">
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
              <Link href="/register" className="w-full block text-center bg-white border-2 border-gray-200 hover:border-[#CD7F32] text-[#242424] px-6 py-3 rounded-xl font-bold transition-colors">
                Get Started
              </Link>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="bg-[#242424] rounded-3xl p-8 border border-[#CD7F32]/50 shadow-2xl transform md:-translate-y-4 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#CD7F32] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">MOST POPULAR</div>
              <h3 className="text-xl font-bold font-serif text-white mb-2">Manager Pro</h3>
              <div className="text-4xl font-bold text-white mb-6">$49<span className="text-sm text-white/50 font-normal">/month</span></div>
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
              <Link href="/register" className="w-full block text-center bg-[#CD7F32] hover:bg-[#b06a29] text-white px-6 py-3 rounded-xl font-bold transition-colors">
                Start 14-Day Trial
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-shadow flex flex-col">
              <h3 className="text-xl font-bold font-serif mb-2">Enterprise</h3>
              <div className="text-4xl font-bold mb-6">$199<span className="text-sm text-gray-500 font-normal">/month</span></div>
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
              <button className="w-full block text-center bg-white border-2 border-gray-200 hover:border-[#CD7F32] text-[#242424] px-6 py-3 rounded-xl font-bold transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA & Footer Section (Screenshot 1) */}
      <section className="bg-[#D68D46] pt-20">
        <div className="max-w-4xl mx-auto px-6 text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-white mb-4">Ready to Join the Community?</h2>
          <p className="text-white/90 text-lg mb-10">
            Join thousands of event professionals already using BackStage.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="bg-[#242424] hover:bg-[#1a1a1a] text-white px-8 py-3.5 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              Create Free Account
            </Link>
            <button className="bg-transparent border border-white hover:bg-white/10 text-white px-8 py-3.5 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              Watch Demo
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#242424] py-16 border-t-[6px] border-[#a66a2e]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
            <div>
              <Link href="/" className="flex items-center gap-2 font-serif text-2xl font-bold text-white mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#CD7F32] flex items-center justify-center shadow-lg shadow-[#CD7F32]/20">
                  <span className="text-[#242424]">B</span>
                </div>
                Back<span className="text-[#CD7F32]">Stage</span>
              </Link>
              <p className="text-white/40">The ultimate platform for event staffing and community building.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">Platform</h4>
              <ul className="space-y-3 text-white/50">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#events" className="hover:text-white transition-colors">Events</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">Community</h4>
              <ul className="space-y-3 text-white/50">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/forums" className="hover:text-white transition-colors">Forums</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/login?role=ADMIN" className="text-[#CD7F32] font-bold hover:underline flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Admin Access
                </Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">Contact</h4>
              <ul className="space-y-3 text-white/50">
                <li>support@backstage.com</li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </footer>
      </section>
      
    </div>
  );
}
