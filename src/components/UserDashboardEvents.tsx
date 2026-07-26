'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ChevronDown, ChevronUp, Filter, Calendar, Clock, Globe, Ticket, Heart, Users, X, Sparkles, CheckCircle2 } from 'lucide-react';
import UserEventDetailView from './UserEventDetailView';

export default function UserDashboardEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Filter States (Matching Home Web exactly)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({
    Categories: true,
    Date: true,
    Venues: false,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const locations = ['All', 'Bangalore', 'Hyderabad', 'Delhi', 'Mumbai', 'Chennai'];
  
  const categories = [
    "Campus fests & culture nights",
    "Hackathons & tech meets",
    "Workshops & skill-ups",
    "Corporate & networking",
    "Career & job fairs",
    "Music & entertainment"
  ];

  const venues = ['Jio World Garden', 'Phoenix Marketcity', 'Pragati Maidan', 'Hard Rock Cafe', 'Palace Grounds'];

  useEffect(() => {
    // 1. Fetch current logged in user profile first to restrict saved & joined events to this account only!
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(profile => {
        if (profile && profile.id) {
          setCurrentUser(profile);
          const savedKey = `backstage_saved_events_${profile.id}`;
          const joinedKey = `backstage_joined_communities_${profile.id}`;
          if (typeof window !== 'undefined') {
            try {
              const saved = JSON.parse(localStorage.getItem(savedKey) || '[]');
              const joined = JSON.parse(localStorage.getItem(joinedKey) || '[]');
              if (Array.isArray(saved)) setSavedIds(saved);
              if (Array.isArray(joined)) setJoinedIds(joined);
            } catch (e) {
              console.error(e);
            }
          }
        } else {
          if (typeof window !== 'undefined') {
            try {
              const saved = JSON.parse(localStorage.getItem('backstage_saved_events_guest') || '[]');
              const joined = JSON.parse(localStorage.getItem('backstage_joined_communities_guest') || '[]');
              if (Array.isArray(saved)) setSavedIds(saved);
              if (Array.isArray(joined)) setJoinedIds(joined);
            } catch (e) {}
          }
        }
      })
      .catch(console.error);

    // Fetch all events
    fetch('/api/user/events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          // Fallback demo events if API returns empty/error
          setEvents([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleFilter = (section: string) => {
    setOpenFilters(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleSaveEvent = (eventId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedIds(prev => {
      const exists = prev.includes(eventId);
      const next = exists ? prev.filter(id => id !== eventId) : [...prev, eventId];
      if (typeof window !== 'undefined') {
        const savedKey = currentUser ? `backstage_saved_events_${currentUser.id}` : 'backstage_saved_events_guest';
        localStorage.setItem(savedKey, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleJoinCommunity = async (eventId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setJoinedIds(prev => {
      if (prev.includes(eventId)) return prev;
      const next = [...prev, eventId];
      if (typeof window !== 'undefined') {
        const joinedKey = currentUser ? `backstage_joined_communities_${currentUser.id}` : 'backstage_joined_communities_guest';
        localStorage.setItem(joinedKey, JSON.stringify(next));
      }
      return next;
    });

    // Also automatically add to saved upcoming events
    setSavedIds(prev => {
      if (prev.includes(eventId)) return prev;
      const next = [...prev, eventId];
      if (typeof window !== 'undefined') {
        const savedKey = currentUser ? `backstage_saved_events_${currentUser.id}` : 'backstage_saved_events_guest';
        localStorage.setItem(savedKey, JSON.stringify(next));
      }
      return next;
    });

    // Trigger API call in background
    try {
      await fetch(`/api/user/events/${eventId}/join`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLocation = selectedLocation === 'All' || (event.location && event.location.toLowerCase().includes(selectedLocation.toLowerCase()));
      const matchesCategory = selectedCategories.length === 0 || 
                              (event.attendeeCategory && selectedCategories.includes(event.attendeeCategory)) ||
                              (event.tags && selectedCategories.some(cat => event.tags.toLowerCase().includes(cat.toLowerCase())));
      
      let matchesDate = true;
      if (selectedDate) {
        if (!event.date) {
          matchesDate = false;
        } else if (selectedDate === 'Today') {
          const today = new Date();
          matchesDate = new Date(event.date).toDateString() === today.toDateString();
        } else if (selectedDate === 'Tomorrow') {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          matchesDate = new Date(event.date).toDateString() === tomorrow.toDateString();
        } else if (selectedDate === 'This Weekend') {
          const d = new Date(event.date);
          matchesDate = d.getDay() === 0 || d.getDay() === 6;
        } else {
          matchesDate = event.date.startsWith(selectedDate);
        }
      }

      const matchesVenue = !selectedVenue || (event.location && event.location.toLowerCase().includes(selectedVenue.toLowerCase()));

      return matchesSearch && matchesLocation && matchesCategory && matchesDate && matchesVenue;
    });
  }, [events, searchTerm, selectedLocation, selectedCategories, selectedDate, selectedVenue]);

  // Top Section: Upcoming & Saved Events
  const upcomingEvents = useMemo(() => {
    // Only show saved or joined events that are NOT COMPLETED
    const savedOrJoined = events.filter(e => 
      (savedIds.includes(e.id) || joinedIds.includes(e.id)) && 
      e.status !== 'COMPLETED'
    );
    return { list: savedOrJoined, isFeatured: false };
  }, [events, savedIds, joinedIds]);

  return (
    <div className="space-y-12 pb-20">
      
      {/* 1. TOP SECTION: UPCOMING & SAVED EVENTS */}
      <section className="bg-gradient-to-br from-[#1e1e24] via-[#24242e] to-[#18181c] text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#CD7F32]/15 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CD7F32]/20 border border-[#CD7F32]/40 text-[#CD7F32] text-xs font-extrabold font-mono uppercase tracking-widest mb-2">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Your Pinned Schedule
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif tracking-tight text-white flex items-center gap-2.5">
                <span>Upcoming Events &amp; Communities</span>
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-[#CD7F32]/30 border-t-[#CD7F32] rounded-full animate-spin" />
            </div>
          ) : upcomingEvents.list.length === 0 ? (
            <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-gray-400 text-sm">No pinned events yet. Click ♥ Save on any event below to add it to your schedule!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.list.map((event, idx) => {
                const isSaved = savedIds.includes(event.id);
                const isJoined = joinedIds.includes(event.id);

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    onClick={() => setSelectedEvent(event)}
                    className="group bg-white/5 hover:bg-white/10 rounded-2xl overflow-hidden border border-white/10 hover:border-[#CD7F32]/50 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-2xl hover:-translate-y-1"
                  >
                    <div className="relative aspect-[16/9] sm:aspect-[4/3] overflow-hidden bg-gray-900">
                      <img 
                        src={event.coverImageUrl || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000&auto=format&fit=crop"} 
                        alt={event.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      
                      {/* Status & Pin Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm ${
                          event.status === 'ONGOING' ? 'bg-emerald-500 text-black font-black animate-pulse' : 'bg-[#CD7F32] text-white'
                        }`}>
                          {event.status}
                        </span>
                        {isJoined && (
                          <span className="bg-blue-600/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                            <Users className="w-3 h-3" /> Joined
                          </span>
                        )}
                        {isSaved && !isJoined && (
                          <span className="bg-amber-500/90 text-black text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                            ♥ Saved
                          </span>
                        )}
                      </div>

                      {/* Quick Save Toggle Button */}
                      <button
                        onClick={(e) => toggleSaveEvent(event.id, e)}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-md ${
                          isSaved ? 'bg-red-500 text-white' : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/80'
                        }`}
                        title={isSaved ? "Remove from Saved" : "Save Event"}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                      </button>

                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-[#CD7F32]" />
                          {new Date(event.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {event.startTime && ` • ${event.startTime}`}
                        </span>
                        <h3 className="font-extrabold text-base text-white line-clamp-1 group-hover:text-[#CD7F32] transition-colors">
                          {event.title}
                        </h3>
                      </div>
                    </div>

                    <div className="p-4 bg-black/40 flex items-center justify-between gap-2 border-t border-white/5">
                      <span className="text-xs text-gray-400 font-medium truncate flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        {event.location}
                      </span>
                      <span className="text-xs font-bold text-[#CD7F32] group-hover:translate-x-1 transition-transform flex items-center gap-0.5 shrink-0">
                        View Details →
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 2. MAIN HOME WEB EVENTS SECTION: SEARCH BAR WITH FILTERS & LOCATION SELECTION */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900">
              Explore Events &amp; Communities
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Search by location, filter by category or date, and select any event to view details, join community, or save.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg w-fit">
            <span>SHOWING {filteredEvents.length} OF {events.length} EVENTS</span>
          </div>
        </div>

        {/* Top Search & Location Bar (Exactly identical to Home Web) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sticky top-4 z-30">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search for Events, Plays, Sports and Activities" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#CD7F32] focus:border-transparent outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center justify-between gap-4 w-full md:w-auto shrink-0 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 relative group cursor-pointer flex-1 md:flex-none">
                <MapPin className="w-4 h-4 text-[#CD7F32]" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">City:</span>
                <select 
                  value={selectedLocation} 
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="appearance-none bg-transparent font-bold text-gray-800 pr-7 cursor-pointer outline-none hover:text-[#CD7F32] transition-colors text-sm"
                >
                  {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`md:hidden flex items-center justify-center p-2 rounded-lg transition-colors ${showMobileFilters ? 'bg-[#CD7F32] text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar Filters & Event Grid */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Left Sidebar Filters (Exactly identical to Home Web) */}
          <div className={`w-full md:w-[280px] shrink-0 space-y-4 ${showMobileFilters ? 'block' : 'hidden'} md:block sticky top-28`}>
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-lg font-bold text-gray-900 font-serif flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#CD7F32]" /> Filters
              </h3>
              {(selectedCategories.length > 0 || selectedDate || selectedVenue || selectedLocation !== 'All' || searchTerm) && (
                <button 
                  onClick={() => { setSelectedCategories([]); setSelectedDate(''); setSelectedVenue(''); setSelectedLocation('All'); setSearchTerm(''); }}
                  className="text-xs font-bold text-[#CD7F32] hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Categories Accordion */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
              <button 
                onClick={() => toggleFilter('Categories')}
                className="w-full px-5 py-4 flex items-center justify-between bg-white text-gray-800 hover:bg-gray-50 transition-colors font-bold text-sm"
              >
                <span className="flex items-center gap-2">
                  {openFilters['Categories'] ? <ChevronUp className="w-4 h-4 text-[#CD7F32]" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  <span className={openFilters['Categories'] ? 'text-[#CD7F32]' : ''}>Categories</span>
                </span>
                {selectedCategories.length > 0 && (
                  <span className="bg-[#CD7F32] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{selectedCategories.length}</span>
                )}
              </button>
              {openFilters['Categories'] && (
                <div className="px-5 pb-5 pt-1 flex flex-wrap gap-1.5 border-t border-gray-100">
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all text-left font-medium ${
                        selectedCategories.includes(cat) 
                          ? 'bg-[#CD7F32] text-white shadow-sm font-bold' 
                          : 'bg-gray-50 border border-gray-200 text-gray-700 hover:border-[#CD7F32]/40 hover:bg-[#CD7F32]/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Accordion */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
              <button 
                onClick={() => toggleFilter('Date')}
                className="w-full px-5 py-4 flex items-center justify-between bg-white text-gray-800 hover:bg-gray-50 transition-colors font-bold text-sm"
              >
                <span className="flex items-center gap-2">
                  {openFilters['Date'] ? <ChevronUp className="w-4 h-4 text-[#CD7F32]" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  <span className={openFilters['Date'] ? 'text-[#CD7F32]' : ''}>Date</span>
                </span>
                {selectedDate && <span className="text-[10px] text-gray-400 font-normal">Active</span>}
              </button>
              {openFilters['Date'] && (
                <div className="px-5 pb-5 pt-2 flex flex-col gap-3 border-t border-gray-100">
                  <input 
                    type="date" 
                    value={selectedDate && !['Today', 'Tomorrow', 'This Weekend'].includes(selectedDate) ? selectedDate : ''}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-200 rounded-lg outline-none focus:border-[#CD7F32] text-gray-700 cursor-pointer bg-gray-50 font-medium"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {['Today', 'Tomorrow', 'This Weekend'].map(date => (
                      <button 
                        key={date} 
                        onClick={() => setSelectedDate(date === selectedDate ? '' : date)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
                          selectedDate === date ? 'bg-[#CD7F32] text-white font-bold shadow-sm' : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-[#CD7F32]/5'
                        }`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Venues Accordion */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
              <button 
                onClick={() => toggleFilter('Venues')}
                className="w-full px-5 py-4 flex items-center justify-between bg-white text-gray-800 hover:bg-gray-50 transition-colors font-bold text-sm"
              >
                <span className="flex items-center gap-2">
                  {openFilters['Venues'] ? <ChevronUp className="w-4 h-4 text-[#CD7F32]" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  <span className={openFilters['Venues'] ? 'text-[#CD7F32]' : ''}>Venues</span>
                </span>
              </button>
              {openFilters['Venues'] && (
                <div className="px-5 pb-5 pt-2 flex flex-col gap-1.5 border-t border-gray-100">
                  {venues.map(venue => (
                    <button 
                      key={venue} 
                      onClick={() => setSelectedVenue(venue === selectedVenue ? '' : venue)}
                      className={`text-xs px-3 py-2 rounded-lg transition-all text-left font-medium ${
                        selectedVenue === venue ? 'bg-[#CD7F32] text-white font-bold shadow-sm' : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-[#CD7F32]/5'
                      }`}
                    >
                      {venue}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Grid: Listed Events with Poster and Details */}
          <div className="flex-1 w-full">
            {filteredEvents.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-gray-500 shadow-sm flex flex-col items-center justify-center min-h-[350px]">
                <Filter className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Events Match Your Criteria</h3>
                <p className="max-w-md text-sm text-gray-500 mb-6">We couldn't find any events matching your selected filters in {selectedLocation === 'All' ? 'any city' : selectedLocation}.</p>
                <button 
                  onClick={() => { setSelectedCategories([]); setSearchTerm(''); setSelectedLocation('All'); setSelectedDate(''); setSelectedVenue(''); }}
                  className="bg-[#CD7F32] text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md hover:bg-[#b56e29] transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, idx) => {
                  const isSaved = savedIds.includes(event.id);
                  const isJoined = joinedIds.includes(event.id);

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedEvent(event)}
                      className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#CD7F32]/40 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-full hover:-translate-y-1"
                    >
                      <div>
                        {/* Event Poster Area */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                          <img 
                            src={event.coverImageUrl || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000&auto=format&fit=crop"} 
                            alt={event.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-90" />
                          
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm ${
                              event.status === 'ONGOING' ? 'bg-emerald-500 text-black font-black animate-pulse' : 'bg-white text-gray-900'
                            }`}>
                              {event.status}
                            </span>
                            {isJoined && (
                              <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-sm">
                                👥 Joined
                              </span>
                            )}
                          </div>

                          {/* Save Heart Button */}
                          <button
                            onClick={(e) => toggleSaveEvent(event.id, e)}
                            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-md ${
                              isSaved ? 'bg-red-500 text-white' : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/70'
                            }`}
                            title={isSaved ? "Remove from Saved" : "Save Event"}
                          >
                            <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                          </button>

                          {/* Date overlay on image bottom */}
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <span className="text-xs font-bold font-mono bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 inline-flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#CD7F32]" />
                              {new Date(event.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {event.startTime && ` • ${event.startTime}`}
                            </span>
                          </div>
                        </div>

                        {/* Details Area */}
                        <div className="p-5">
                          <h3 className="font-extrabold text-gray-900 text-base mb-1.5 leading-snug line-clamp-2 group-hover:text-[#CD7F32] transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1 truncate">
                            <MapPin className="w-3.5 h-3.5 text-[#CD7F32] shrink-0" />
                            {event.location}
                          </p>
                          <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed">
                            {event.description || "Join this exciting experience. Click to view full lineup, timings, and community access."}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
                        <span className="text-gray-600 truncate max-w-[140px]">
                          {event.attendeeCategory || event.tags || "General Event"}
                        </span>
                        <span className="text-[#CD7F32] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          View Details &amp; Join →
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </section>

      <AnimatePresence>
        {selectedEvent && (
          <UserEventDetailView
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            isSaved={savedIds.includes(selectedEvent.id)}
            hasJoined={joinedIds.includes(selectedEvent.id)}
            onToggleSave={() => toggleSaveEvent(selectedEvent.id)}
            onJoinCommunity={() => handleJoinCommunity(selectedEvent.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
