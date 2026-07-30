'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import Navbar from '@/components/Navbar';
import AnimatedSplash from '@/components/AnimatedSplash';
import F1Background from '@/components/F1Background';
import UnifiedLoginForm from '@/components/UnifiedLoginForm';

export default function AppGateway() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isNativeApp, setIsNativeApp] = useState(false);

  // App Selection & Splash State
  const [showSplash, setShowSplash] = useState(true);

  const [appFlavor, setAppFlavor] = useState<string>('USER');
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    let flavor = localStorage.getItem('appFlavor') || process.env.NEXT_PUBLIC_APP_FLAVOR || 'USER';
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      if (ua.includes('BackstageFlavor/Ops')) {
        flavor = 'OPS';
      } else if (ua.includes('BackstageFlavor/User')) {
        flavor = 'USER';
      }
    }
    setAppFlavor(flavor);
  }, []);
  
  const activeAppMode = appFlavor === 'OPS' ? 'OPS' : 'USER';

  const [topEvents, setTopEvents] = useState<any[]>([]);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {

    // Check if running inside native Capacitor APK
    import('@capacitor/core').then(({ Capacitor }) => {
      if (Capacitor.isNativePlatform()) {
        setIsNativeApp(true);
      }
    }).catch(() => {});

    // 1. Auth Check - Store redirect URL instead of redirecting instantly
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/me`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          const role = data.user.role || data.role;
          if (role === 'ADMIN') setRedirectUrl('/admin');
          else if (role === 'MANAGER') setRedirectUrl('/manager/dashboard');
          else if (role === 'USER') setRedirectUrl('/user');
          else setRedirectUrl('/worker');
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));

    // 2. Fetch Events for Web Application Landing Page
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/events/top`).then(res => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/events/live`).then(res => res.json())
    ]).then(([topData, liveData]) => {
      if (Array.isArray(topData)) setTopEvents(topData);
      if (Array.isArray(liveData)) setLiveEvents(liveData);
    }).catch(() => {})
      .finally(() => setEventsLoading(false));
  }, []);

  const handleSplashComplete = () => {
    // If the animation finishes and we have a redirect ready, go there!
    if (redirectUrl && !checkingAuth) {
      router.replace(redirectUrl);
    } else if (!checkingAuth) {
      setShowSplash(false);
    }
    // If still checking auth when splash ends, we wait.
    // We handle the edge case in a useEffect below.
  };

  useEffect(() => {
    // Edge case: Auth check took longer than the 5-second splash screen
    if (!showSplash && !checkingAuth && redirectUrl) {
      router.replace(redirectUrl);
    }
  }, [showSplash, checkingAuth, redirectUrl]);

  if (showSplash || checkingAuth) {
    return <AnimatedSplash onComplete={handleSplashComplete} appFlavor={appFlavor} />;
  }

  return (
    <div className="min-h-screen bg-[#121212] font-sans selection:bg-[#CD7F32]/30 text-white relative overflow-hidden">
      
      {/* =========================================================================
          1. MOBILE / NATIVE APK DIRECT DUAL-APP PORTAL
          Visible on mobile/tablet (< 768px) OR when running inside Capacitor APK.
          Shows: Attractive Welcome Screen -> Login -> Launch.
         ========================================================================= */}
      <div className={isNativeApp ? "block w-full min-h-screen flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden" : "md:hidden w-full min-h-screen flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden"}>
        <F1Background />
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[#CD7F32]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header */}
        <header className="relative z-10 flex flex-col gap-3 py-2">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} />
            <Link href="/login" className="text-xs font-bold text-white bg-white/10 px-4 py-2 rounded-full border border-white/20 transition-all hover:bg-white/20">
              Sign In
            </Link>
          </div>
        </header>

        {/* Attractive Welcome Screen */}
        <main className="relative z-10 flex flex-col items-center justify-center flex-1 w-full text-center mt-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-full bg-[#CD7F32]/10 flex items-center justify-center border border-[#CD7F32]/30 mb-8 shadow-[0_0_50px_rgba(205,127,50,0.2)]">
              <Sparkles className="w-10 h-10 text-[#CD7F32]" />
            </div>
            
            <h1 className="text-4xl font-bold font-serif text-white tracking-tight leading-tight mb-4 drop-shadow-lg">
              Experience Events <br /> Like Never Before
            </h1>
            
            <p className="text-gray-400 text-sm mb-10 leading-relaxed px-4">
              {activeAppMode === 'OPS' 
                ? 'Join the premier network for event managers and ground staff. Manage your operations seamlessly.' 
                : 'Get exclusive access to top cultural fests, concerts, and VIP communities instantly.'}
            </p>

            <div className="w-full flex flex-col gap-4">
              <Link href="/register" className="w-full bg-gradient-to-r from-[#CD7F32] to-[#b06a29] text-white rounded-2xl py-4 font-bold shadow-[0_10px_30px_rgba(205,127,50,0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-base">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link href="/login" className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 font-bold transition-all hover:bg-white/10 active:scale-[0.98] text-base">
                I already have an account
              </Link>
            </div>
          </motion.div>
        </main>

        {/* Minimal Mobile Footer */}
        <footer className="relative z-10 text-center py-2 border-t border-white/5 text-[11px] text-gray-500 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <span>&copy; {new Date().getFullYear()} BackStage Apps</span>
          <Link href="/terms" className="hover:text-gray-400">Terms</Link>
          <Link href="/privacy" className="hover:text-gray-400">Privacy</Link>
          <Link href="/support" className="hover:text-gray-400">Support</Link>
        </footer>
      </div>


      {/* =========================================================================
          2. DESKTOP / WEB APPLICATION MARKETING HOME PAGE
          Visible only on large desktop screens (>= 768px) and non-native web.
          Shows: Full Marketing Home Page with Hero, Events, Features, Pricing.
         ========================================================================= */}
      <div className={isNativeApp ? "hidden" : "hidden md:block w-full bg-[#242424] text-white selection:bg-[#CD7F32]/30"}>
        <div className="relative min-h-screen overflow-hidden">
          <F1Background />
          <Navbar />

          {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10">
          
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#CD7F32]/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen animate-pulse" />
          <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex-1 space-y-8 relative z-10"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight font-serif text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#CD7F32]"
            >
              Event Staffing & On-Ground Operations
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg text-white/80 max-w-lg leading-relaxed font-medium"
            >
              Connect with top-tier event professionals, find the perfect opportunities, and build your career in the events industry. BackStage is the all-in-one platform for event staffing, runners, and community building.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex items-center gap-4 pt-4"
            >
              <Link href="/register" className="relative group overflow-hidden bg-[#CD7F32] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_40px_rgba(205,127,50,0.4)] hover:shadow-[0_0_60px_rgba(205,127,50,0.6)] hover:-translate-y-1 flex items-center gap-2 text-base">
                <span className="relative z-10">Start Free Trial</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
              </Link>
              <Link href="/login" className="bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-[#CD7F32]/50 px-8 py-4 rounded-xl font-bold transition-all text-base hover:-translate-y-1">
                Sign In to Dashboard
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="pt-10 border-t border-white/10 flex items-center gap-8 text-sm text-white/60"
            >
              <div className="flex items-center gap-2 font-semibold text-white bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-[ping_2s_infinite] shadow-[0_0_10px_#22c55e]" />
                Live Staffing Active
              </div>
              <div className="hover:text-white transition-colors cursor-default">• 10,000+ Verified Workers</div>
              <div className="hover:text-white transition-colors cursor-default">• Instant Errand Dispatch</div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            className="flex-1 w-full max-w-lg lg:max-w-none perspective-1000"
          >
            <motion.div 
              whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden group"
            >
              {/* Glass Glare Effect */}
              <div className="absolute -inset-full bg-gradient-to-b from-transparent via-white/5 to-transparent rotate-45 group-hover:animate-[glare_2s_ease-in-out_infinite] pointer-events-none" />
              
              <div className="absolute -top-6 -right-6 bg-gradient-to-r from-[#CD7F32] to-[#b06a29] text-white font-mono text-xs font-bold px-5 py-2.5 rounded-full shadow-[0_10px_30px_rgba(205,127,50,0.5)] uppercase tracking-wider z-20">
                ⚡ Live Dispatch Portal
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:border-[#CD7F32]/50 transition-colors">
                      <Logo size="md" showText={false} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white font-serif text-lg">BackStage Network</h4>
                      <p className="text-xs text-[#CD7F32] uppercase tracking-wider mt-0.5">Real-Time Operations</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-black px-3 py-1.5 rounded-full border border-emerald-500/20 tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)]">ONLINE</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/60 backdrop-blur-md p-5 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#CD7F32]/10 rounded-bl-full pointer-events-none" />
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 font-mono">500+</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Active Runners</div>
                  </div>
                  <div className="bg-black/60 backdrop-blur-md p-5 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full pointer-events-none" />
                    <div className="text-3xl font-black text-white font-mono flex items-start gap-1">100<span className="text-xl text-[#CD7F32]">%</span></div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Payment Guarantee</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500/10 via-[#CD7F32]/5 to-transparent p-5 rounded-2xl border border-[#CD7F32]/30 group-hover:bg-[#CD7F32]/10 transition-colors relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-bold text-[#CD7F32] flex items-center gap-2 font-serif">
                      <Sparkles className="w-4 h-4 animate-pulse" /> Why BackStage?
                    </span>
                    <Link href="/register" className="text-xs font-black text-white hover:text-[#CD7F32] transition-colors flex items-center gap-1">
                      Join Now <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-sm text-gray-300 mt-3 leading-relaxed relative z-10">
                    Zero middlemen. Direct transparent dispatches between event managers and on-ground talent with instant payment confirmation.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
        </div>

        {/* Live Right Now Section */}
        {liveEvents.length > 0 && (
          <section className="py-20 bg-black border-y border-white/10 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[400px] bg-[#CD7F32]/10 blur-[150px] pointer-events-none rounded-full" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center justify-between mb-10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_20px_rgba(34,197,94,0.8)]"></div>
                  <h2 className="text-4xl font-bold font-serif text-white tracking-tight">Live Right Now</h2>
                </div>
                <Link href="/events" className="text-sm font-bold text-[#CD7F32] hover:text-white transition-colors flex items-center gap-1 group">
                  View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <div className="flex overflow-x-auto pb-8 -mx-6 px-6 gap-8 snap-x hide-scrollbar">
                {liveEvents.map((event, i) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="min-w-[320px] md:min-w-[420px] snap-start shrink-0"
                  >
                    <Link href={`/events/${event.id}`} className="group block relative h-full">
                      <div className="bg-[#1a1a1a] border border-white/5 group-hover:border-[#CD7F32]/60 rounded-3xl overflow-hidden transition-all duration-500 relative h-full flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_20px_50px_rgba(205,127,50,0.2)] group-hover:-translate-y-2">
                        
                        <div className="absolute top-5 left-5 z-20">
                          <span className="bg-black/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            ONGOING
                          </span>
                        </div>
                        
                        <div className="h-56 w-full overflow-hidden bg-black relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent z-10"></div>
                          <img 
                            src={event.coverImageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'} 
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 relative z-0 opacity-90 group-hover:opacity-100"
                          />
                        </div>
                        
                        <div className="p-8 flex flex-col flex-grow bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
                          <h3 className="text-2xl font-bold text-white mb-3 line-clamp-1 group-hover:text-[#CD7F32] transition-colors">{event.title}</h3>
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                          
                          <div className="mt-auto pt-5 border-t border-white/10 flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">By {event.managerProfile?.user?.name || 'Manager'}</span>
                            <span className="text-xs font-black text-[#CD7F32] uppercase tracking-wider flex items-center gap-1 group-hover:underline">
                              View Live <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Discover Events Section */}
        <section id="features" className="py-24 bg-[#0a0a0a] text-white relative border-t border-white/5 overflow-hidden">
          <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#CD7F32]/5 rounded-[100%] blur-[100px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-4xl lg:text-5xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-4"
            >
              Discover Event Opportunities
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 max-w-2xl mx-auto mb-20 text-lg"
            >
              Find the perfect events that match your skills and interests. From campus fests to corporate networking, we have it all.
            </motion.p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {[
                { title: "Campus Fests & Culture Nights", desc: "Cultural fests, culture nights, fresher's and farewell events" },
                { title: "Hackathons & Tech Meets", desc: "Hackathons, tech talks, startup meetups, and conferences" },
                { title: "Workshops & Skill-ups", desc: "Hands-on workshops, training sessions, skill-building bootcamps" },
                { title: "Corporate & Networking", desc: "Offsites, product launches, mixers and industry summits" },
                { title: "Career & Job Fairs", desc: "Campus placements, job fairs, and internship summits" },
                { title: "Music & Entertainment", desc: "College gigs, DJ nights, open mics, and cultural performances" }
              ].map((category, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="group relative bg-[#121212] p-8 rounded-3xl border border-white/5 hover:border-[#CD7F32]/50 transition-all duration-500 flex flex-col overflow-hidden shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_20px_40px_rgba(205,127,50,0.1)] hover:-translate-y-2 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#CD7F32]/0 via-[#CD7F32]/0 to-[#CD7F32]/0 group-hover:from-[#CD7F32]/10 group-hover:to-transparent transition-all duration-700 pointer-events-none" />
                  
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 text-[#CD7F32] group-hover:scale-110 group-hover:bg-[#CD7F32]/20 transition-all duration-500 border border-white/5 group-hover:border-[#CD7F32]/30 shadow-lg relative z-10">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 font-serif group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#CD7F32] transition-colors relative z-10">{category.title}</h3>
                  <p className="text-base text-gray-500 leading-relaxed group-hover:text-gray-300 transition-colors relative z-10">{category.desc}</p>
                  
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-500">
                    <ArrowRight className="w-6 h-6 text-[#CD7F32]" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Top Events Grid */}
        <section className="py-24 bg-[#050505] text-white relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl lg:text-4xl font-bold font-serif text-white mb-2 tracking-tight">Featured Staffing Events</h2>
                <p className="text-gray-400 text-base">Explore top opportunities currently hiring on-ground talent.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Link href="/events" className="text-[#CD7F32] font-bold text-base hover:text-white transition-colors flex items-center gap-2 group">
                  <span>View All Events</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            {eventsLoading ? (
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-[4/5] bg-white/5 rounded-3xl border border-white/10 animate-pulse" />
                ))}
              </div>
            ) : topEvents.length === 0 ? (
              <div className="bg-white/5 p-12 rounded-3xl border border-white/10 text-center text-gray-500 font-medium">
                No featured events available at the moment.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                {topEvents.slice(0, 6).map((event, idx) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                  >
                    <Link href={`/events/${event.id}`} className="group cursor-pointer flex flex-col h-full bg-[#121212] rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(205,127,50,0.15)] border border-white/5 hover:border-[#CD7F32]/40 transition-all duration-500 hover:-translate-y-2">
                      <div className="aspect-[4/3] overflow-hidden bg-black relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent z-10" />
                        <img 
                          src={event.coverImageUrl || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000&auto=format&fit=crop"} 
                          alt={event.title} 
                          className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute top-4 left-4 z-20">
                          <span className="text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-lg uppercase">
                            {event.status || 'UPCOMING'}
                          </span>
                        </div>
                      </div>
                      <div className="p-8 flex flex-col flex-1 relative bg-gradient-to-b from-[#121212] to-[#0a0a0a]">
                        <h3 className="font-bold text-white mb-3 text-xl leading-snug line-clamp-2 group-hover:text-[#CD7F32] transition-colors">{event.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-1 mb-6 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{event.location || 'Online / India'}</span>
                        </p>
                        <div className="mt-auto pt-5 border-t border-white/10 flex items-center justify-between text-xs font-bold">
                          <span className="text-gray-500 uppercase tracking-wider">{event.bands || 'Staffing'}</span>
                          <span className="text-[#CD7F32] group-hover:underline flex items-center gap-1">
                            View Roles <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-white text-[#242424] border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold font-serif text-[#CD7F32] mb-4">Simple, Transparent Pricing</h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-base">
                Whether you are an independent talent or an event production company, we have a plan designed for your growth.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
              {/* Free Tier */}
              <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all flex flex-col">
                <h3 className="text-2xl font-bold font-serif mb-2">Talent / Starter</h3>
                <div className="text-4xl font-bold mb-6">₹0<span className="text-sm text-gray-500 font-normal">/forever</span></div>
                <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-600">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Apply to unlimited event jobs</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Access Live Runner Errand board</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Direct peer-to-peer messaging</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Digital staffing pass & reviews</li>
                </ul>
                <Link href="/register" className="w-full block text-center bg-white border-2 border-gray-300 hover:border-[#CD7F32] text-[#242424] px-6 py-3.5 rounded-xl font-bold transition-all">
                  Join for Free
                </Link>
              </div>

              {/* Pro Tier */}
              <div className="bg-[#242424] text-white rounded-3xl p-8 border-2 border-[#CD7F32] shadow-2xl flex flex-col relative transform lg:-translate-y-4">
                <div className="absolute -top-4 right-8 bg-[#CD7F32] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider font-mono">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold font-serif mb-2 text-[#CD7F32]">Manager Pro</h3>
                <div className="text-4xl font-bold mb-6">₹4,999<span className="text-sm text-gray-400 font-normal">/month</span></div>
                <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-300">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Host up to 15 active events/month</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Broadcast live runner errands</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Advanced talent filtering & badges</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Dispute resolution & rating controls</li>
                </ul>
                <Link href="/register" className="w-full block text-center bg-[#CD7F32] hover:bg-[#b06a29] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-[#CD7F32]/30">
                  Start 14-Day Trial
                </Link>
              </div>

              {/* Enterprise Tier */}
              <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all flex flex-col">
                <h3 className="text-2xl font-bold font-serif mb-2">Enterprise</h3>
                <div className="text-4xl font-bold mb-6">₹14,999<span className="text-sm text-gray-500 font-normal">/month</span></div>
                <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-600">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Unlimited events & broadcasts</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Dedicated 24/7 account manager</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Custom runner API integrations</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#CD7F32] shrink-0" /> Custom branding & SSO access</li>
                </ul>
                <Link href="/support" className="w-full block text-center bg-white border-2 border-gray-300 hover:border-[#CD7F32] text-[#242424] px-6 py-3.5 rounded-xl font-bold transition-all">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section & Luxury Footer */}
        <section className="bg-gradient-to-br from-[#D68D46] to-[#b06a29] pt-20 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold font-serif mb-4">Ready to Transform Event Operations?</h2>
            <p className="text-white/90 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of event professionals, managers, and runners already building on BackStage.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="bg-[#242424] hover:bg-[#1a1a1a] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 text-base">
                <span>Create Free Account</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-base">
                Sign In to Portal
              </Link>
            </div>
          </div>

          {/* Footer with Luxury Logo */}
          <footer className="bg-[#1a1a1a] py-16 border-t-[6px] border-[#a66a2e] text-sm text-gray-400">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
              <div>
                <div className="mb-6">
                  <Logo size="lg" showText={true} />
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  The ultimate platform for event staffing, real-time runner errands, and community collaboration.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs font-mono">Platform</h4>
                <ul className="space-y-3 text-gray-400 text-xs">
                  <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="/events" className="hover:text-white transition-colors">Events Portal</Link></li>
                  <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing Tiers</Link></li>
                  <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs font-mono">Operations</h4>
                <ul className="space-y-3 text-gray-400 text-xs">
                  <li><Link href="/worker" className="hover:text-white transition-colors">Talent Dashboard</Link></li>
                  <li><Link href="/manager/dashboard" className="hover:text-white transition-colors">Manager Portal</Link></li>
                  <li><Link href="/worker/runners" className="hover:text-white transition-colors">Live Errand Board</Link></li>
                  <li><Link href="/support" className="hover:text-white transition-colors">Help Center</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs font-mono">Legal & Contact</h4>
                <ul className="space-y-3 text-gray-400 text-xs">
                  <li>support@backstage-app.com</li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li>&copy; {new Date().getFullYear()} BackStage App. All rights reserved.</li>
                </ul>
              </div>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
