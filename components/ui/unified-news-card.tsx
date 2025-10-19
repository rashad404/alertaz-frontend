"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Eye } from "lucide-react";
import { useState } from "react";
import { getImageUrl } from "@/lib/utils";
import { getLocalizedPath } from "@/lib/utils/locale";

interface NewsCardProps {
  news: {
    id: number;
    title: string;
    sub_title?: string;
    slug: string;
    body?: string;
    content?: string;
    thumbnail_image: string | null;
    publish_date: string;
    views?: number;
    author?: string;
    hashtags?: string[];
    category?: {
      id: number;
      title: string;
      slug: string;
    };
  };
  locale: string;
  variant?: 'default' | 'compact';
}

const categoryColors: Record<string, string> = {
  finance: "bg-brand-orange",
  maliyye: "bg-brand-orange",
  "real-estate": "bg-brand-orange", 
  interviews: "bg-brand-purple",
  insurance: "bg-brand-blue",
  default: "bg-gray-600",
};

export function UnifiedNewsCard({ news, locale, variant = 'default' }: NewsCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  // Handle different title structures
  const parseTitle = (titleField: unknown): string => {
    if (!titleField) return '';
    
    // If it's a plain string
    if (typeof titleField === 'string') {
      // Check if it's a JSON string
      if (titleField.startsWith('{') && titleField.endsWith('}')) {
        try {
          const parsed = JSON.parse(titleField);
          return parsed[locale] || parsed.az || parsed.en || '';
        } catch {
          return titleField;
        }
      }
      return titleField;
    }
    
    // If it's an object
    if (typeof titleField === 'object') {
      return titleField[locale as keyof typeof titleField] || titleField.az || '';
    }
    
    return '';
  };
  
  const title = parseTitle(news.title);
  
  // Handle different category structures
  const categoryTitle = news.category ? parseTitle(news.category.title) : '';
  const categorySlug = news.category?.slug || '';
  const categoryColor = categoryColors[categorySlug] || categoryColors.default;

  // Handle body/content
  const excerpt = news.body || news.content || '';
  const cleanExcerpt = excerpt.replace(/<[^>]*>/g, '');
  const truncatedExcerpt = cleanExcerpt.length > 150 
    ? cleanExcerpt.substring(0, 150) + '...' 
    : cleanExcerpt;

  // Format date with time - just parse the string from backend without timezone conversion
  const formatDate = (dateString: string) => {
    // Date comes as "2025-09-26T02:47:00" from backend (Azerbaijan time)
    // Just parse and format it as-is
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart ? timePart.split(':') : ['00', '00'];

    const monthNames = {
      az: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
    };

    const monthIndex = parseInt(month, 10) - 1;
    const monthName = monthNames[locale as keyof typeof monthNames]?.[monthIndex] || monthNames.az[monthIndex];
    const dayNum = parseInt(day, 10);

    if (variant === 'compact') {
      return `${monthName} ${dayNum}, ${hour}:${minute}`;
    } else {
      // Full month names for non-compact
      const fullMonthNames = {
        az: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'],
        en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
      };
      const fullMonthName = fullMonthNames[locale as keyof typeof fullMonthNames]?.[monthIndex] || fullMonthNames.az[monthIndex];

      if (locale === 'az') {
        return `${dayNum} ${fullMonthName} ${year}, ${hour}:${minute}`;
      } else if (locale === 'ru') {
        return `${dayNum} ${fullMonthName} ${year} г., ${hour}:${minute}`;
      } else {
        return `${fullMonthName} ${dayNum}, ${year} at ${hour}:${minute}`;
      }
    }
  };

  // Ensure slug is valid
  const newsSlug = news.slug || `news-${news.id}`;

  // Translations
  const t = {
    az: {
      readMore: 'Ətraflı oxu',
      views: 'baxış',
      by: 'Müəllif:'
    },
    en: {
      readMore: 'Read more',
      views: 'views',
      by: 'By'
    },
    ru: {
      readMore: 'Читать далее',
      views: 'просмотров',
      by: 'Автор:'
    }
  }[locale as keyof typeof t] || {
    readMore: 'Ətraflı oxu',
    views: 'baxış',
    by: 'Müəllif:'
  };

  const imageUrl = imageError || !news.thumbnail_image 
    ? "/news-placeholder.svg" 
    : getImageUrl(news.thumbnail_image);

  if (variant === 'compact') {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden group">
        <Link href={getLocalizedPath(locale, `/xeberler/${newsSlug}`)} className="block">
          <div className="relative h-48 md:h-64 overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 flex items-center space-x-2">
              {news.category && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(getLocalizedPath(locale, `/xeberler/kat/${news.category.slug}`));
                  }}
                  className={`${categoryColor} text-white px-2 py-1 rounded text-xs hover:opacity-90 transition-opacity cursor-pointer`}
                >
                  {categoryTitle}
                </button>
              )}
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs">
                {formatDate(news.publish_date)}
              </span>
            </div>
          </div>
        </Link>
        <div className="p-3">
          <Link href={getLocalizedPath(locale, `/xeberler/${newsSlug}`)}>
            <h4 className="text-lg font-bold text-black dark:text-white leading-tight hover:text-brand-orange transition-colors line-clamp-2">
              {title}{news.sub_title && <span className="text-[#FF6021]"> - {news.sub_title}</span>}
            </h4>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      {/* Thumbnail */}
      <Link href={getLocalizedPath(locale, `/xeberler/${newsSlug}`)}>
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
          {news.category && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(getLocalizedPath(locale, `/xeberler/kat/${news.category.slug}`));
              }}
              className={`absolute top-3 left-3 ${categoryColor} text-white px-3 py-1 text-xs font-medium rounded-full hover:opacity-90 transition-opacity cursor-pointer`}
            >
              {categoryTitle}
            </button>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-6">
        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(news.publish_date)}</span>
          </div>
          {news.views !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{news.views} {t.views}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link href={getLocalizedPath(locale, `/xeberler/${newsSlug}`)}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-brand-orange transition-colors">
            {title}{news.sub_title && <span className="text-[#FF6021]"> - {news.sub_title}</span>}
          </h2>
        </Link>

        {/* Excerpt */}
        {truncatedExcerpt && (
          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
            {truncatedExcerpt}
          </p>
        )}

        {/* Author and Read More */}
        <div className="flex items-center justify-between">
          {news.author && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t.by} {news.author}
            </span>
          )}
          <Link
            href={getLocalizedPath(locale, `/xeberler/${newsSlug}`)}
            className="inline-flex items-center gap-1 text-brand-orange hover:text-brand-orange-dark transition-colors font-medium"
          >
            {t.readMore}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Hashtags */}
        {news.hashtags && news.hashtags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {news.hashtags.map((tag, index) => (
              <span
                key={index}
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}