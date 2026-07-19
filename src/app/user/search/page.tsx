'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const popularSearches = ['Concert', 'Festival', 'Live Music', 'Weekend'];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/user/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setResults(data);
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

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for everything BackStage..."
          className="w-full bg-white border border-[#EAE6DF] rounded-2xl py-4 pl-12 pr-4 text-lg shadow-sm focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32] transition-all"
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

      {!query ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-4"
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
      ) : loading ? (
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
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Events Found</h3>
          {results.map((event, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={event.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#EAE6DF] hover:border-[#CD7F32]/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <Link href={`/user/events/${event.id}`} className="hover:underline">
                  <h3 className="font-bold text-lg text-[#CD7F32]">{event.title}</h3>
                </Link>
                <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-600">{event.status}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  {new Date(event.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {event.location}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
