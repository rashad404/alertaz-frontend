"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from '@/lib/navigation';
import { Search, X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/providers/dictionary-provider";

interface SearchResult {
  id: number | string;
  title: string;
  subtitle?: string;
  url: string;
  image?: string;
  date?: string;
  author?: string;
  rate?: string;
  type?: string;
  category?: string;
}

interface SearchCategory {
  category: string;
  count: number;
  items: SearchResult[];
}

interface SearchResponse {
  success: boolean;
  query: string;
  total_results: number;
  results: {
    credits?: SearchCategory;
    banks?: SearchCategory;
    news?: SearchCategory;
    offers?: SearchCategory;
    insurance?: SearchCategory;
    guides?: SearchCategory;
    blogs?: SearchCategory;
  };
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export function SearchOverlay({ isOpen, onClose, locale }: SearchOverlayProps) {
  const dictionary = useDictionary();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Perform search
  const { data: searchResults, isLoading } = useQuery<SearchResponse>({
    queryKey: ["search", locale, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return {
          success: false,
          query: "",
          total_results: 0,
          results: {},
        };
      }
      const response = await apiClient.get(`/${locale}/search`, {
        params: { q: debouncedQuery },
      });
      return response.data;
    },
    enabled: debouncedQuery.length >= 2,
  });

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasResults = searchResults && searchResults.total_results > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Search panel */}
      <div className="relative min-h-screen" onClick={onClose}>
        <div 
          className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-w-4xl mx-auto p-4 sm:p-6">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dictionary.nav?.search || "Search..."}
                className="w-full pl-12 pr-12 py-4 text-lg rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
              <button
                onClick={onClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Search results */}
            <div className="mt-6 max-h-[70vh] overflow-y-auto">
              {isLoading && debouncedQuery.length >= 2 && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
                </div>
              )}

              {!isLoading && debouncedQuery.length >= 2 && !hasResults && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No results found for "{debouncedQuery}"
                  </p>
                </div>
              )}

              {hasResults && (
                <div className="space-y-6">
                  {Object.entries(searchResults.results).map(([key, category]) => {
                    if (!category || category.count === 0) return null;

                    return (
                      <div key={key} className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0">
                        <h3 className="font-bold text-sm text-gray-500 dark:text-gray-400 mb-3">
                          {category.category} ({category.count})
                        </h3>
                        <div className="space-y-3">
                          {category.items.map((item) => (
                            <Link
                              key={`${key}-${item.id}`}
                              href={item.url}
                              onClick={onClose}
                              className="block group"
                            >
                              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-orange transition-colors">
                                    {item.title}
                                  </h4>
                                  {item.subtitle && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                                      {item.subtitle}
                                    </p>
                                  )}
                                  <div className="flex items-center space-x-3 mt-1">
                                    {item.type && (
                                      <span className="text-xs text-gray-400">
                                        {item.type}
                                      </span>
                                    )}
                                    {item.rate && (
                                      <span className="text-xs font-semibold text-brand-orange">
                                        {item.rate}
                                      </span>
                                    )}
                                    {item.date && (
                                      <span className="text-xs text-gray-400">
                                        {item.date}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}