'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, ArrowRight } from 'lucide-react';

export default function SearchMonitor() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const placeholders = [
    'Bitcoin reaches $100,000',
    'Website goes down',
    'Stock price drops 5%',
    'Weather alert in my area',
    'Currency rate changes'
  ];

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;

    setIsAnimating(true);
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let service = 'crypto';

      if (lowerQuery.includes('bitcoin') || lowerQuery.includes('btc') || lowerQuery.includes('crypto')) {
        service = 'crypto';
      } else if (lowerQuery.includes('stock') || lowerQuery.includes('apple')) {
        service = 'stock';
      } else if (lowerQuery.includes('usd') || lowerQuery.includes('eur')) {
        service = 'currency';
      } else if (lowerQuery.includes('weather')) {
        service = 'weather';
      } else if (lowerQuery.includes('website')) {
        service = 'website';
      }

      router.push(`/alerts/quick-setup?service=${service}&description=${encodeURIComponent(query)}`);
    }, 300);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className={`relative transition-all duration-500 ${isFocused ? 'scale-105' : ''}`}>
        {/* Main Search Container */}
        <div className="relative">
          <div
            className={`rounded-3xl p-2 transition-all duration-500 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 ${
              isFocused
                ? 'shadow-[0_0_80px_20px_rgba(168,85,247,0.3)]'
                : 'shadow-lg'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* AI Indicator */}
              <div className="ml-2">
                <div className="relative">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <div className="absolute inset-0 w-5 h-5 animate-ping">
                    <Sparkles className="w-5 h-5 text-purple-500 opacity-40" />
                  </div>
                </div>
              </div>

              {/* Input Field */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={`Monitor when ${placeholders[currentPlaceholder]}...`}
                className="flex-1 px-4 py-4 bg-transparent text-lg font-light text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                style={{
                  background: 'transparent'
                }}
              />

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={!query.trim()}
                className={`
                  relative group px-6 py-3 mr-2 rounded-2xl font-medium text-white
                  bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                  transition-all duration-300 overflow-hidden
                  ${query.trim()
                    ? 'opacity-100 hover:shadow-lg hover:scale-105'
                    : 'opacity-50 cursor-not-allowed'
                  }
                  ${isAnimating ? 'animate-pulse' : ''}
                `}
              >
                {/* Button Shine Effect */}
                <span className="absolute inset-0 w-full h-full">
                  <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:animate-shine" />
                </span>

                <span className="relative flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span>Create Alert</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['Bitcoin $100k', 'Website Monitor', 'Stock Alerts', 'Weather Updates'].map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(suggestion);
                  setTimeout(handleSearch, 100);
                }}
                className="group px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300"
              >
                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-purple-500 transition-colors">
                  {suggestion}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }

        .animate-shine {
          animation: shine 1s ease-out;
        }
      `}</style>
    </div>
  );
}