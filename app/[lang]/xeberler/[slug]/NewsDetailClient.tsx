'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Eye, Clock, ArrowLeft, Facebook, Linkedin, Loader2, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Script from 'next/script';
import { UnifiedNewsCard } from '@/components/ui/unified-news-card';
import { getImageUrl } from '@/lib/utils';
import { getLocalizedPath } from '@/lib/utils/locale';

interface NewsDetail {
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
  seo_title: string;
  seo_keywords: string;
  seo_description: string;
}

interface NewsDetailClientProps {
  params: { lang: string; slug: string };
  initialData?: NewsDetail;
}

const NewsDetailClient = ({ params, initialData }: NewsDetailClientProps) => {
  const router = useRouter();
  const locale = params.lang || 'az';
  const slug = params.slug;
  const [bannerError, setBannerError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageChecked, setImageChecked] = useState(false);

  // Fetch news detail (with initialData support for SSR)
  // News content stays in its original language, so we fetch by slug only
  const { data: newsData, isLoading, error } = useQuery({
    queryKey: ['newsDetail', slug],
    queryFn: async () => {
      // Still pass locale in URL for routing, but backend will fetch by slug only
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/${locale}/xeberler/${slug}`);
      return response.data;
    },
    initialData: initialData ? { data: initialData } : undefined
  });

  // Fetch latest news
  const { data: latestNews, isLoading: latestLoading } = useQuery({
    queryKey: ['latestNews', locale],
    queryFn: async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/${locale}/xeberler`;
        const response = await axios.get(url, {
          params: {
            per_page: 11,  // Get 11 in case we need to filter out current
          },
        });

        // Check both for success status and direct data array
        let newsItems = [];
        if (response.data?.data && Array.isArray(response.data.data)) {
          newsItems = response.data.data;
        } else if (Array.isArray(response.data)) {
          newsItems = response.data;
        }

        // Filter out current news and return up to 10
        return newsItems
          .filter((item: any) => item.id !== newsData?.data?.id)
          .slice(0, 10);
      } catch (error) {
        console.error('Failed to fetch latest news:', error);
        return [];
      }
    },
    enabled: !!newsData?.data,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch related news from same category
  const { data: relatedByCategory, isLoading: categoryLoading } = useQuery({
    queryKey: ['relatedNewsByCategory', locale, newsData?.data?.category?.slug, newsData?.data?.id],
    queryFn: async () => {
      if (!newsData?.data?.category?.slug) return [];

      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/${locale}/xeberler/category/${newsData.data.category.slug}`;
        const response = await axios.get(url, {
          params: {
            per_page: 7  // Get 7 to filter out current and keep 6
          },
        });

        // Filter out current news and return up to 6
        const newsItems = response.data?.data || [];
        return newsItems
          .filter((item: any) => item.id !== newsData.data.id)
          .slice(0, 6);
      } catch (error) {
        console.error('Failed to fetch category news:', error);
        return [];
      }
    },
    enabled: !!newsData?.data?.category?.slug && !!newsData?.data?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch related news based on hashtags
  // Use the news's language for fetching related news, not the site language
  const { data: relatedByTags, error: relatedError, isLoading: relatedLoading } = useQuery({
    queryKey: ['relatedNewsByTags', newsData?.data?.language, newsData?.data?.hashtags, newsData?.data?.id],
    queryFn: async () => {
      if (!newsData?.data?.hashtags || newsData.data.hashtags.length === 0) return [];

      try {
        // Get news by first hashtag in the same language as the current news
        const newsLanguage = newsData.data.language || 'az';
        const firstHashtag = newsData.data.hashtags[0];

        // Properly encode the hashtag for the API call
        const url = `${process.env.NEXT_PUBLIC_API_URL}/${newsLanguage}/xeberler`;
        const response = await axios.get(url, {
          params: {
            tag: firstHashtag,
            per_page: 5
          },
          paramsSerializer: (params) => {
            return new URLSearchParams(params).toString();
          }
        });
        
        // Filter out current news
        const filteredNews = response.data?.data?.filter((item: any) => item.id !== newsData.data.id) || [];
        return filteredNews;
      } catch (error) {
        console.error('Failed to fetch related news:', error);
        return [];
      }
    },
    enabled: !!newsData?.data?.hashtags && newsData.data.hashtags.length > 0 && !!newsData?.data?.id
  });

  // Fetch banner ad
  const { data: bannerAd } = useQuery({
    queryKey: ['newsDetailBanner', locale],
    queryFn: async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/${locale}/site-ads`);
        // Find banner ad for news detail page
        const ads = response.data?.data || [];
        return ads.find((ad: any) => ad.position === 'news_detail' || ad.position === 'sidebar') || ads[0] || null;
      } catch (error) {
        console.error('Failed to fetch banner ad:', error);
        return null;
      }
    }
  });

  // Format date
  const formatDate = (dateString: string, lang?: string) => {
    // Check if dateString is valid
    if (!dateString || typeof dateString !== 'string') {
      return '';
    }

    // Date comes as "2025-09-26T02:47:00" from backend (Azerbaijan time)
    // Just parse and format it as-is without JavaScript Date conversion
    const [datePart, timePart] = dateString.split('T');
    if (!datePart) {
      return '';
    }

    const [year, month, day] = datePart.split('-');
    if (!year || !month || !day) {
      return '';
    }

    const [hour, minute] = timePart ? timePart.split(':') : ['00', '00'];
    const dayNum = parseInt(day, 10);

    const months = {
      az: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'],
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
    };

    const monthIndex = parseInt(month, 10) - 1;
    const currentLocale = lang || locale;  // Use passed lang or fall back to component locale
    const monthName = months[currentLocale as keyof typeof months]?.[monthIndex] || months.az[monthIndex];

    // Format based on locale with time
    if (currentLocale === 'az') {
      return `${dayNum} ${monthName} ${year}, ${hour}:${minute}`;
    } else if (currentLocale === 'ru') {
      return `${dayNum} ${monthName} ${year} г., ${hour}:${minute}`;
    } else {
      return `${monthName} ${dayNum}, ${year} at ${hour}:${minute}`;
    }
  };

  // Calculate reading time
  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  // Share functions
  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = window.location.href;
    const text = newsData?.data?.title || '';
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = newsData?.data?.title || '';
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  const shareOnTelegram = () => {
    const url = window.location.href;
    const text = newsData?.data?.title || '';
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  // Translations
  const translations = {
    az: {
      breadcrumbHome: 'Ana səhifə',
      breadcrumbNews: 'Xəbərlər',
      by: 'Müəllif:',
      readingTime: 'dəqiqə oxuma',
      views: 'baxış',
      share: 'Paylaş',
      relatedNewsByTag: 'Eyni etiketdən xəbərlər',
      newsSuffix: 'xəbərləri',
      latestNews: 'Son xəbərlər',
      loadMore: 'Daha çox',
      back: 'Geri',
      loading: 'Yüklənir...',
      notFound: 'Xəbər tapılmadı',
      error: 'Xəta baş verdi',
      noRelatedNews: 'Əlaqəli xəbər yoxdur',
      advertisement: 'Reklam'
    },
    en: {
      breadcrumbHome: 'Home',
      breadcrumbNews: 'News',
      by: 'By',
      readingTime: 'min read',
      views: 'views',
      share: 'Share',
      relatedNewsByTag: 'News from same tag',
      newsSuffix: 'News',
      latestNews: 'Latest News',
      loadMore: 'Load More',
      back: 'Back',
      loading: 'Loading...',
      notFound: 'News not found',
      error: 'An error occurred',
      noRelatedNews: 'No related news',
      advertisement: 'Advertisement'
    },
    ru: {
      breadcrumbHome: 'Главная',
      breadcrumbNews: 'Новости',
      by: 'Автор:',
      readingTime: 'мин чтения',
      views: 'просмотров',
      share: 'Поделиться',
      relatedNewsByTag: 'Новости с той же меткой',
      newsSuffix: 'новости',
      latestNews: 'Последние новости',
      loadMore: 'Загрузить ещё',
      back: 'Назад',
      loading: 'Загрузка...',
      notFound: 'Новость не найдена',
      error: 'Произошла ошибка',
      noRelatedNews: 'Нет связанных новостей',
      advertisement: 'Реклама'
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.az;

  if (isLoading && !initialData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6021]" />
          <span className="text-gray-900 dark:text-white">{t.loading}</span>
        </div>
      </div>
    );
  }

  if (error || !newsData?.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {error ? t.error : t.notFound}
        </h1>
        <Link
          href={getLocalizedPath(locale, '/xeberler')}
          className="text-brand-orange hover:text-brand-orange-dark transition-colors"
        >
          {t.back}
        </Link>
      </div>
    );
  }

  const news = newsData.data as NewsDetail;
  const readingTime = calculateReadingTime(news.body);
  
  // Check image on mount
  useEffect(() => {
    if (!news.thumbnail_image) {
      setImageChecked(true);
      setImageError(true);
    } else {
      // For full URLs from API, trust them and don't do client-side checking
      if (news.thumbnail_image.startsWith('http')) {
        setImageChecked(true);
        setImageError(false);
      } else {
        const img = new Image();
        img.onload = () => {
          setImageChecked(true);
          setImageError(false);
        };
        img.onerror = () => {
          setImageChecked(true);
          setImageError(true);
        };
        img.src = getImageUrl(news.thumbnail_image);
      }
    }
  }, [news.thumbnail_image]);
  
  // Determine image URL - if we have a thumbnail_image from API, use it
  const imageUrl = news.thumbnail_image && news.thumbnail_image.startsWith('http')
    ? news.thumbnail_image  // Use API URL directly
    : (!imageChecked || imageError || !news.thumbnail_image 
        ? "/news-placeholder.svg" 
        : getImageUrl(news.thumbnail_image));

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    description: news.seo_description || news.title,
    datePublished: news.publish_date,
    dateModified: news.publish_date,
    author: {
      '@type': 'Person',
      name: news.author || 'Kredit.az'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kredit.az',
      logo: {
        '@type': 'ImageObject',
        url: 'https://kredit.az/logo.png'
      }
    },
    image: news.thumbnail_image || 'https://kredit.az/og-news.jpg',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://kredit.az/${locale}/xeberler/${news.slug}`
    }
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
        name: t.breadcrumbNews,
        item: `https://kredit.az/${locale}/xeberler`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: news.title,
        item: `https://kredit.az/${locale}/xeberler/${news.slug}`
      }
    ]
  };

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      <Script id="breadcrumb-schema" type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </Script>

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header with breadcrumb */}
        <div className="bg-gray-50 dark:bg-gray-800 py-6">
          <div className="flex justify-center items-center px-4 md:px-36">
            <div className="flex w-full max-w-5xl justify-between items-center">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#FF6021] dark:hover:text-[#FF6021] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{t.back}</span>
              </button>
              <div className="hidden md:flex items-center gap-1">
                <Link href={getLocalizedPath(locale, '/')} className="text-black dark:text-gray-300 hover:text-[#FF6021] dark:hover:text-[#FF6021] transition-colors">
                  {t.breadcrumbHome}
                </Link>
                <span className="mx-2 text-gray-600 dark:text-gray-400">›</span>
                <Link href={getLocalizedPath(locale, '/xeberler')} className="text-black dark:text-gray-300 hover:text-[#FF6021] dark:hover:text-[#FF6021] transition-colors">
                  {t.breadcrumbNews}
                </Link>
                <span className="mx-2 text-gray-600 dark:text-gray-400">›</span>
                <span className="text-[#FF6021] truncate max-w-xs">
                  {news.title}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content - 2 column layout */}
        <div className="flex justify-center px-4 md:px-36 py-8">
          <div className="w-full max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Article (2/3 width) */}
              <article className="lg:col-span-2">
                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  {news.title}{news.sub_title && <span className="text-[#FF6021]"> - {news.sub_title}</span>}
                </h1>

                {/* Featured image with category and date overlay - always show */}
                <div className="mb-6 rounded-xl overflow-hidden relative">
                  {/* Category and date on top of image */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                    {news.category && (
                      <Link
                        href={getLocalizedPath(locale, `/xeberler/kat/${news.category.slug}`)}
                        className="inline-block px-3 py-1 bg-[#FF6021] text-white text-sm font-medium rounded-full hover:bg-brand-orange-dark transition-colors"
                      >
                        {news.category.title}
                      </Link>
                    )}
                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(news.publish_date)}</span>
                    </div>
                  </div>
                  <img
                    src={imageUrl}
                    alt={news.title}
                    className="w-full h-[400px] md:h-[500px] object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>

                {/* Article content */}
                <div
                  className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200
                             prose-headings:text-gray-900 dark:prose-headings:text-white
                             prose-p:text-gray-700 dark:prose-p:text-gray-300
                             prose-p:mb-4 prose-p:leading-relaxed
                             prose-strong:text-gray-900 dark:prose-strong:text-white
                             prose-blockquote:border-l-brand-orange prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
                             prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                             prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                             prose-li:text-gray-700 dark:prose-li:text-gray-300
                             prose-li:mb-2
                             [&>p]:mb-5 [&>p]:leading-7
                             [&>ul]:my-4 [&>ol]:my-4
                             [&>h2]:mt-8 [&>h2]:mb-4
                             [&>h3]:mt-6 [&>h3]:mb-3
                             [&>blockquote]:my-6
                             [&_a]:text-gray-900 [&_a]:dark:text-white [&_a]:underline [&_a]:underline-offset-2
                             [&_a:hover]:text-[#FF6021] [&_a:active]:text-[#FF6021]
                             [&_img]:rounded-lg [&_img]:my-4 [&_img]:block
                             [&_.image-resizer-container]:inline-block [&_.image-resizer-container]:max-w-full [&_.image-resizer-container]:my-4
                             mb-6"
                  dangerouslySetInnerHTML={{ __html: news.body }}
                />

                {/* Meta information - moved here above tags */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {news.author && (
                    <div className="flex items-center gap-1">
                      <span>{t.by} {news.author}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{readingTime} {t.readingTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{news.views} {t.views}</span>
                  </div>
                </div>

                {/* Hashtags */}
                {news.hashtags && news.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    {news.hashtags.map((tag, index) => (
                      <Link
                        key={index}
                        href={getLocalizedPath(locale, `/xeberler?tag=${encodeURIComponent(tag)}`)}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm hover:bg-[#FF6021] hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Share buttons */}
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{t.share}:</span>
                  <button
                    onClick={shareOnFacebook}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#FF6021] hover:text-white transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button
                    onClick={shareOnTwitter}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#FF6021] hover:text-white transition-colors"
                    aria-label="Share on X"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </button>
                  <button
                    onClick={shareOnLinkedIn}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#FF6021] hover:text-white transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </button>
                  <button
                    onClick={shareOnWhatsApp}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#FF6021] hover:text-white transition-colors"
                    aria-label="Share on WhatsApp"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </button>
                  <button
                    onClick={shareOnTelegram}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#FF6021] hover:text-white transition-colors"
                    aria-label="Share on Telegram"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </button>
                </div>
              </article>

              {/* Right Column - Sidebar (1/3 width) */}
              <aside className="lg:col-span-1">
                {/* Banner Ad */}
                {bannerAd && !bannerError && (
                  <div className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
                      {t.advertisement}
                    </p>
                    {bannerAd.link ? (
                      <a 
                        href={bannerAd.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={getImageUrl(bannerAd.image)}
                          alt={bannerAd.title || 'Advertisement'}
                          className="w-full h-auto rounded-lg"
                          onError={() => setBannerError(true)}
                        />
                      </a>
                    ) : (
                      <img
                        src={getImageUrl(bannerAd.image)}
                        alt={bannerAd.title || 'Advertisement'}
                        className="w-full h-auto rounded-lg"
                        onError={() => setBannerError(true)}
                      />
                    )}
                  </div>
                )}

                {/* Latest News - Show on top of sidebar */}
                {(latestNews && latestNews.length > 0) ? (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {t.latestNews}
                    </h3>

                    <div className="space-y-4">
                      {latestNews.map((item: any) => (
                        <Link
                          key={item.id}
                          href={getLocalizedPath(locale, `/xeberler/${item.slug}`)}
                          className="block group"
                        >
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-[#FF6021] transition-colors">
                            <div className="flex gap-3">
                              <img
                                src={item.thumbnail_image ? getImageUrl(item.thumbnail_image) : '/news-placeholder.svg'}
                                alt={item.title}
                                className="w-20 h-16 object-cover rounded flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/news-placeholder.svg';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#FF6021] transition-colors">
                                  {item.title}{item.sub_title && <span className="text-[#FF6021]"> - {item.sub_title}</span>}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {item.created_at ? formatDate(item.created_at, locale) : (item.publish_date ? formatDate(item.publish_date, locale) : '')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Load More Button */}
                    <Link
                      href={getLocalizedPath(locale, '/xeberler')}
                      className="mt-4 block w-full text-center px-4 py-2 bg-[#FF6021] text-white rounded-lg hover:bg-brand-orange-dark transition-colors font-medium"
                    >
                      {t.loadMore}
                    </Link>
                  </div>
                ) : latestLoading ? (
                  <div className="mb-8">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-20 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Related News by Tags - Using same compact design as Latest News */}
                {!relatedLoading && relatedByTags && relatedByTags.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {t.relatedNewsByTag}
                    </h3>

                    <div className="space-y-4">
                      {relatedByTags.slice(0, 5).map((item: any) => (
                        <Link
                          key={item.id}
                          href={getLocalizedPath(item.language || locale, `/xeberler/${item.slug}`)}
                          className="block group"
                        >
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-[#FF6021] transition-colors">
                            <div className="flex gap-3">
                              <img
                                src={item.thumbnail_image ? getImageUrl(item.thumbnail_image) : '/news-placeholder.svg'}
                                alt={item.title}
                                className="w-20 h-16 object-cover rounded flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/news-placeholder.svg';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#FF6021] transition-colors">
                                  {item.title}{item.sub_title && <span className="text-[#FF6021]"> - {item.sub_title}</span>}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {(item.publish_date || item.created_at) ? formatDate(item.publish_date || item.created_at, item.language || locale) : ''}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>

            {/* Related News from Same Category - Full Width Below Article */}
            {relatedByCategory && relatedByCategory.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {locale === 'en'
                    ? `${news.category?.title || ''} ${t.newsSuffix}`
                    : `${news.category?.title || ''} ${t.newsSuffix}`
                  }
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedByCategory.map((item: any) => (
                    <UnifiedNewsCard
                      key={item.id}
                      news={item}
                      locale={locale}
                      variant="compact"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsDetailClient;