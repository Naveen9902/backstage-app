'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  
  const popularSearches = ['Concert', 'Festival', 'Live Music', 'Weekend'];

  useEffect(() => {

    const timer = setTimeout(() => {
      setLoading(true);
      let url = `/api/user/search?q=${encodeURIComponent(query)}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            let filtered = data;
            if (locationFilter) {
              filtered = filtered.filter(e => e.location?.toLowerCase().includes(locationFilter.toLowerCase()));
            }
            setResults(filtered);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 500); // debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-[#242424] font-sans">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">Search</h1>
        <p className="text-gray-600">Find events, artists, and venues near you.</p>
      </div>

      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
          </div>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for everything BackStage..."
            className="w-full bg-white border border-[#EAE6DF] rounded-2xl py-4 pl-12 pr-4 text-lg shadow-[0_4px_20px_rgb(0,0,0,0.03)] focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32] transition-all"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`w-14 h-14 shrink-0 rounded-2xl border flex items-center justify-center transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.03)] ${showFilters ? 'bg-[#CD7F32] border-[#CD7F32] text-white' : 'bg-white border-[#EAE6DF] text-gray-500 hover:border-[#CD7F32] hover:text-[#CD7F32]'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
        </button>
      </div>

      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white border border-[#EAE6DF] rounded-2xl p-6 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Filters</h3>
            <button onClick={() => { setLocationFilter(''); }} className="text-xs font-bold text-[#CD7F32] uppercase tracking-wider hover:underline">Clear Filters</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Location</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <input 
                  type="text" 
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="City, venue..." 
                  className="w-full bg-[#f8f6f0] border-transparent rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#CD7F32] focus:bg-white focus:ring-1 focus:ring-[#CD7F32] transition-all outline-none"
                />
              </div>
            </div>
            
            <div className="opacity-50 pointer-events-none">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Date (Coming Soon)</label>
              <select className="w-full bg-[#f8f6f0] border-transparent rounded-xl px-4 py-2.5 text-sm outline-none">
                <option>Any Date</option>
              </select>
            </div>
            
            <div className="opacity-50 pointer-events-none">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Genre (Coming Soon)</label>
              <select className="w-full bg-[#f8f6f0] border-transparent rounded-xl px-4 py-2.5 text-sm outline-none">
                <option>All Genres</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {!query && !locationFilter && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-4 pb-4 border-b border-[#EAE6DF]"
        >
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Popular Searches</h3>
          <div className="flex flex-wrap gap-3">
            {popularSearches.map((term, i) => (
              <button 
                key={i}
                onClick={() => setQuery(term)}
                className="px-4 py-2 bg-white border border-[#EAE6DF] rounded-xl text-sm font-semibold text-gray-600 hover:border-[#CD7F32] hover:text-[#CD7F32] transition-colors shadow-sm"
              >
                {term}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#CD7F32]/30 border-t-[#CD7F32] rounded-full animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#EAE6DF]"
        >
          <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
          </div>
          <h3 className="font-bold text-lg mb-2">No results for "{query}"</h3>
          <p className="text-gray-500 text-sm">Try searching for something else like "Rock" or "Jazz".</p>
        </motion.div>
      ) : (
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
            {query ? 'Events Found' : 'Upcoming Events'}
          </h3>
          {results.map((event, i) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/user/events/${event.id}`} className="block bg-white border border-[#EAE6DF] rounded-2xl p-4 flex gap-4 hover:border-[#CD7F32] transition-colors shadow-sm group">
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                  {event.coverImageUrl ? (
                    <img src={event.coverImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={event.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="font-bold text-lg text-gray-900 truncate pr-4">{event.title}</h2>
                    <span className="text-xs font-bold text-[#CD7F32] bg-[#f8f6f0] px-2 py-1 rounded-md whitespace-nowrap">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2 truncate">{event.location}</p>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{event.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
