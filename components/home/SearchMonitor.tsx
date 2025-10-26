'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Sparkles, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import alertsService from '@/lib/api/alerts';

export default function SearchMonitor() {
  const t = useTranslations();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const placeholders = [
    t('search.placeholder1'),
    t('search.placeholder2'),
    t('search.placeholder3'),
    t('search.placeholder4'),
    t('search.placeholder5')
  ];

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsAnimating(true);
    setError(null);

    try {
      // Call AI to parse the alert
      const result = await alertsService.parseAlert(query);

      // Check if service is available
      const availableServices = ['crypto', 'website'];
      if (!availableServices.includes(result.service)) {
        setError(`${result.service.charAt(0).toUpperCase() + result.service.slice(1)} alerts coming soon!`);
        setIsAnimating(false);
        return;
      }

      // Redirect with parsed data
      const params = new URLSearchParams({
        service: result.service,
        from_ai: 'true',
        description: query, // Pass the original query as description
      });

      // Add parsed data for crypto
      if (result.service === 'crypto' && result.crypto_id) {
        params.append('crypto_id', result.crypto_id);
        params.append('crypto_symbol', result.crypto_symbol || '');
        params.append('operator', result.operator || 'above');
        params.append('value', result.value?.toString() || '');
      }

      // Add parsed data for website
      if (result.service === 'website' && result.url) {
        params.append('url', result.url);
        params.append('condition', result.condition || 'down');
      }

      router.push(`/alerts/quick-setup?${params.toString()}`);
    } catch (err: any) {
      console.error('Parse error:', err);
      // If AI fails, redirect to manual setup
      router.push(`/alerts/quick-setup?ai_failed=true`);
      setIsAnimating(false);
    }
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
                placeholder={`${t('search.monitorWhen')} ${placeholders[currentPlaceholder]}...`}
                className="flex-1 px-4 py-4 bg-transparent text-lg font-light text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                style={{
                  background: 'transparent'
                }}
              />

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={!query.trim() || isAnimating}
                className={`
                  relative group px-3 sm:px-6 py-3 mr-2 rounded-2xl font-medium text-white
                  bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                  transition-all duration-300 overflow-hidden flex-shrink-0
                  ${query.trim() && !isAnimating
                    ? 'opacity-100 hover:shadow-lg hover:scale-105'
                    : 'opacity-50 cursor-not-allowed'
                  }
                  ${isAnimating ? 'animate-pulse' : ''}
                `}
                title="Create Smart Alert"
              >
                {/* Button Shine Effect */}
                <span className="absolute inset-0 w-full h-full">
                  <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:animate-shine" />
                </span>

                <span className="relative flex items-center gap-2">
                  {isAnimating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {isAnimating ? 'Creating...' : t('search.createSmartAlert')}
                  </span>
                  {!isAnimating && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform hidden sm:inline" />}
                </span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Quick Suggestions */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              { label: t('search.suggestion1'), service: 'crypto' },
              { label: t('search.suggestion2'), service: 'website' },
              { label: t('search.suggestion3'), service: 'stocks' },
              { label: t('search.suggestion4'), service: 'weather' }
            ].map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  router.push(`/alerts/quick-setup?service=${suggestion.service}`);
                }}
                className="group px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300"
              >
                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-purple-500 transition-colors">
                  {suggestion.label}
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