'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, MapPin, ChevronDown, ChevronUp, Filter, Calendar, Globe, Ticket } from 'lucide-react';

export default function EventsFilters({ events }: { events: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({
    Categories: true,
    Date: false,
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

  const toggleFilter = (section: string) => {
    setOpenFilters(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = selectedLocation === 'All' || (event.location && event.location.toLowerCase().includes(selectedLocation.toLowerCase()));
      const matchesCategory = selectedCategories.length === 0 || (event.attendeeCategory && selectedCategories.includes(event.attendeeCategory));
      return matchesSearch && matchesLocation && matchesCategory;
    });
  }, [events, searchTerm, selectedLocation, selectedCategories]);

  return (
    <div className="bg-[#F5F5F5] min-h-screen pb-20">
      {/* Top Search & Location Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search for Events, Plays, Sports and Activities" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#CD7F32] outline-none transition-all"
            />
          </div>
          <div className="flex items-center justify-between gap-4 w-full md:w-auto shrink-0">
            <div className="flex items-center gap-2 relative group cursor-pointer flex-1 md:flex-none">
              <MapPin className="w-4 h-4 text-gray-500" />
              <select 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="appearance-none w-full bg-transparent font-medium text-gray-700 pr-8 py-2 cursor-pointer outline-none hover:text-[#CD7F32] transition-colors text-sm"
              >
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`md:hidden flex items-center justify-center p-2 rounded-lg transition-colors ${showMobileFilters ? 'bg-[#CD7F32] text-white' : 'bg-gray-100 text-gray-600 hover:text-[#CD7F32] hover:bg-[#CD7F32]/10'}`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Filters */}
        <div className={`w-full md:w-[300px] shrink-0 space-y-4 ${showMobileFilters ? 'block' : 'hidden'} md:block`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-serif">Filters</h2>
            {showMobileFilters && (
               <button onClick={() => setShowMobileFilters(false)} className="md:hidden text-gray-400 hover:text-gray-600">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
               </button>
            )}
          </div>

          {/* Categories Accordion */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <button 
              onClick={() => toggleFilter('Categories')}
              className="w-full px-5 py-4 flex items-center justify-between bg-white text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2 font-semibold">
                {openFilters['Categories'] ? <ChevronUp className="w-4 h-4 text-[#CD7F32]" /> : <ChevronDown className="w-4 h-4" />}
                <span className={openFilters['Categories'] ? 'text-[#CD7F32]' : ''}>Categories</span>
              </span>
              <span className="text-xs text-gray-400 hover:text-[#CD7F32] transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedCategories([]); }}>Clear</span>
            </button>
            {openFilters['Categories'] && (
              <div className="px-5 pb-5 pt-2 flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`text-xs px-3 py-2 rounded-md transition-all text-left ${selectedCategories.includes(cat) ? 'bg-[#CD7F32] text-white shadow-md shadow-[#CD7F32]/20 scale-105' : 'bg-white border border-gray-200 text-[#CD7F32] hover:bg-[#CD7F32]/10 hover:border-[#CD7F32]/30'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Accordion */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <button 
              onClick={() => toggleFilter('Date')}
              className="w-full px-5 py-4 flex items-center justify-between bg-white text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2 font-semibold">
                {openFilters['Date'] ? <ChevronUp className="w-4 h-4 text-[#CD7F32]" /> : <ChevronDown className="w-4 h-4" />}
                <span className={openFilters['Date'] ? 'text-[#CD7F32]' : ''}>Date</span>
              </span>
              <span className="text-xs text-gray-400 hover:text-[#CD7F32] transition-colors">Clear</span>
            </button>
            {openFilters['Date'] && (
              <div className="px-5 pb-5 pt-2 flex flex-wrap gap-2">
                {['Today', 'Tomorrow', 'This Weekend'].map(date => (
                  <button key={date} className="text-xs px-3 py-2 rounded-md bg-white border border-gray-200 text-[#CD7F32] hover:bg-[#CD7F32]/10 hover:border-[#CD7F32]/30 transition-all">
                    {date}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="w-full mt-4 bg-transparent border-2 border-[#CD7F32] text-[#CD7F32] hover:bg-[#CD7F32] hover:text-white py-3 rounded-lg font-bold transition-all shadow-sm hover:shadow-md hover:shadow-[#CD7F32]/20 active:scale-95">
            Browse by Venues
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Events in {selectedLocation === 'All' ? 'Your Area' : selectedLocation}</h1>
            {selectedCategories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {selectedCategories.map(cat => (
                  <span key={cat} className="bg-[#CD7F32] text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm font-medium">
                    {cat}
                    <button onClick={() => toggleCategory(cat)} className="hover:text-gray-200 transition-colors">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {filteredEvents.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-500 shadow-sm flex flex-col items-center">
              <Filter className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">No Events Found</h3>
              <p>We couldn't find any events matching your filters in {selectedLocation}.</p>
              <button 
                onClick={() => { setSelectedCategories([]); setSearchTerm(''); setSelectedLocation('All'); }}
                className="mt-6 text-[#CD7F32] font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredEvents.map(event => (
                <Link href={`/events/${event.id}`} key={event.id} className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgba(205,127,50,0.15)] hover:-translate-y-1 border border-gray-100 hover:border-[#CD7F32]/30 transition-all duration-300">
                  <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative">
                    <img 
                      src={event.coverImageUrl || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000&auto=format&fit=crop"} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md bg-white/95 backdrop-blur-md uppercase shadow-sm ${event.status === 'ONGOING' ? 'text-green-600' : 'text-[#CD7F32]'}`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 text-[15px] leading-snug line-clamp-2 group-hover:text-[#CD7F32] transition-colors">{event.title}</h3>
                    <p className="text-[13px] text-gray-500 line-clamp-1 mb-1">{event.location}</p>
                    <p className="text-[12px] text-gray-400 font-medium line-clamp-1 mb-2">{event.tags || event.attendeeCategory || 'General Event'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
