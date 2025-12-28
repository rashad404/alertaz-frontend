"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Link } from '@/lib/navigation';
import { useDictionary } from "@/providers/dictionary-provider";
import { newsApi } from "@/lib/api/endpoints";
import { UnifiedNewsCard } from "@/components/ui/unified-news-card";
import { Pagination } from "@/components/ui/pagination";
import { getTranslation } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface LatestNewsProps {
  locale: string;
}

export function LatestNews({ locale }: LatestNewsProps) {
  const dictionary = useDictionary();
  const t = dictionary.home;
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fetch categories
  const { data: categoriesResponse } = useQuery({
    queryKey: ["news-categories", locale],
    queryFn: () => newsApi.getCategories(locale),
  });

  const categories = categoriesResponse?.data || categoriesResponse;

  // Fetch news
  const { data: newsData, isLoading } = useQuery({
    queryKey: ["latest-news", locale, selectedCategory, currentPage],
    queryFn: () => newsApi.getByCategory(selectedCategory, locale, { per_page: 30, page: currentPage }),
  });

  const tabs = [
    { id: "", label: t.allNews },
    ...(Array.isArray(categories)
      ? categories.map(cat => ({
          id: cat.slug,
          label: cat.title || getTranslation(cat.title, locale),
        }))
      : []),
  ];

  const news = newsData?.data?.data || [];
  const totalPages = newsData?.data?.last_page || 1;

  return (
    <div className="mb-8" id="latest-news">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-black dark:text-white">
          {t.latestNews}
        </h2>
        <Link
          href={'/xeberler'}
          className="flex items-center space-x-1 border border-black/50 dark:border-gray-600 text-black dark:text-white px-3 py-2 rounded-lg text-sm opacity-50 hover:opacity-100 transition-opacity"
        >
          <span>{t.moreNews}</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex items-center space-x-2 lg:space-x-4 mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedCategory(tab.id);
              setCurrentPage(1); // Reset to page 1 when changing category
            }}
            className={cn(
              "px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
              selectedCategory === tab.id
                ? "border border-black dark:border-white text-black dark:text-white"
                : "text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* News grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl h-80 animate-pulse" />
          ))}
        </div>
      ) : news.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {news.map((newsItem) => (
              <UnifiedNewsCard key={newsItem.id} news={newsItem} locale={locale} variant="compact" />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            locale={locale}
            onPageChange={setCurrentPage}
            scrollToId="latest-news"
          />
        </>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {locale === 'az'
              ? 'Bu kateqoriyada xəbər yoxdur'
              : locale === 'ru'
              ? 'В этой категории нет новостей'
              : 'No news in this category'}
          </p>
        </div>
      )}
    </div>
  );
}