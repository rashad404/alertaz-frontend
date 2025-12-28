'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { Link } from '@/lib/navigation';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';
import { UnifiedNewsCard } from '@/components/ui/unified-news-card';
import { Pagination } from '@/components/ui/pagination';

interface NewsItem {
  id: number;
  title: string;
  sub_title?: string;
  slug: string;
  body: string;
  thumbnail_image: string | null;
  publish_date: string;
  views: number;
  author: string;
  hashtags: string[];
  category: {
    id: number;
    title: string;
    slug: string;
  };
}

interface Category {
  id: number;
  title: string;
  slug: string;
}

interface NewsClientProps {
  params: { lang: string };
  initialCategory?: string;
  initialPage?: string;
  initialTag?: string;
}

const NewsClient = ({ params, initialCategory, initialPage, initialTag }: NewsClientProps) => {
  const locale = params.lang || 'az';
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedTag] = useState<string | undefined>(initialTag);

  // Get current page directly from URL params
  const currentPage = Number(searchParams.get('page')) || 1;

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['newsCategories', locale],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/xeberler/kategoriler`);
      return response.data as Category[];
    }
  });

  // Fetch news
  const { data: newsData, isLoading } = useQuery({
    queryKey: ['news', locale, selectedCategory, currentPage, selectedTag],
    queryFn: async () => {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/xeberler`;

      const params: any = {
        page: currentPage,
        per_page: 30
      };

      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (selectedTag) {
        params.tag = selectedTag;
      }

      const response = await axios.get(endpoint, { params });
      return response.data;
    }
  });

  // Translations
  const translations = {
    az: {
      title: 'Xəbərlər',
      breadcrumbHome: 'Ana səhifə',
      breadcrumbCurrent: 'Xəbərlər',
      allCategories: 'Hamısı',
      loading: 'Yüklənir...',
      noNews: 'Xəbər tapılmadı',
      previousPage: 'Əvvəlki',
      nextPage: 'Növbəti',
      filteringByTag: 'Etiketə görə süzülür:',
      clearFilter: 'Filtri təmizlə'
    },
    en: {
      title: 'News',
      breadcrumbHome: 'Home',
      breadcrumbCurrent: 'News',
      allCategories: 'All',
      loading: 'Loading...',
      noNews: 'No news found',
      previousPage: 'Previous',
      nextPage: 'Next',
      filteringByTag: 'Filtering by tag:',
      clearFilter: 'Clear filter'
    },
    ru: {
      title: 'Новости',
      breadcrumbHome: 'Главная',
      breadcrumbCurrent: 'Новости',
      allCategories: 'Все',
      loading: 'Загрузка...',
      noNews: 'Новости не найдены',
      previousPage: 'Предыдущая',
      nextPage: 'Следующая',
      filteringByTag: 'Фильтр по тегу:',
      clearFilter: 'Очистить фильтр'
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.az;

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: newsData?.data?.map((item: NewsItem, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'NewsArticle',
        headline: item.title,
        url: `https://kredit.az/xeberler/${item.slug}`,
        datePublished: item.publish_date,
        author: {
          '@type': 'Person',
          name: item.author || 'Kredit.az'
        }
      }
    })) || []
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t.breadcrumbHome,
        item: `https://kredit.az/${locale}`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t.breadcrumbCurrent,
        item: `https://kredit.az/news`
      }
    ]
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6021]" />
          <span className="text-gray-900 dark:text-white">{t.loading}</span>
        </div>
      </div>
    );
  }

  const news = newsData?.data || [];
  const totalPages = newsData?.last_page || 1;

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      <Script id="breadcrumb-schema" type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </Script>

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header with title and breadcrumb */}
        <div className="bg-[#F6F6F6] dark:bg-gray-800 py-12">
          <div className="flex justify-center items-center px-4 md:px-36">
            <div className="flex w-full max-w-5xl justify-between items-center">
              <h1 className="text-[#09121F] dark:text-white text-3xl md:text-5xl font-bold">
                {t.title}
              </h1>
              <nav className="hidden md:flex items-center gap-1" aria-label="Breadcrumb">
                <Link href={"/" className="text-[#09121F] dark:text-gray-300 hover:text-[#FF6021] transition-colors">
                  {t.breadcrumbHome}
                </Link>
                <span className="mx-2 text-gray-600 dark:text-gray-400">›</span>
                <span className="text-[#FF6021] underline">
                  {t.breadcrumbCurrent}
                </span>
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col justify-center items-center gap-8 py-12 px-4 md:px-36">
          <div className="w-full max-w-5xl" id="news-list">

            {/* Category Filter */}
            {categories && categories.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-2">
                <Link
                  href={`/xeberler`}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#FF6021] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {t.allCategories}
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/xeberler/kat/${category.slug}`}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.slug
                        ? 'bg-[#FF6021] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category.title}
                  </Link>
                ))}
              </div>
            )}

            {/* Tag Filter Indicator */}
            {selectedTag && (
              <div className="mb-6 flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">{t.filteringByTag}</span>
                <span className="px-3 py-1 bg-[#FF6021] text-white rounded-full text-sm font-medium">
                  {selectedTag}
                </span>
                <Link
                  href={`/xeberler`}
                  className="ml-auto text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  {t.clearFilter}
                </Link>
              </div>
            )}

            {/* News Grid */}
            {news.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">{t.noNews}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.map((item: NewsItem) => (
                  <UnifiedNewsCard
                    key={item.id}
                    news={item}
                    locale={locale}
                    variant="compact"
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              locale={locale}
              baseUrl={selectedCategory && selectedCategory !== 'all'
                ? `/xeberler/kat/${selectedCategory}`
                : `/xeberler`}
              scrollToId="news-list"
              className="mt-12"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsClient;