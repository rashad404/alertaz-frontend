import Link from "next/link";
import Image from "next/image";
import { formatShortDate, getImageUrl, getTranslation } from "@/lib/utils";
import type { News } from "@/lib/types";
import { useState } from "react";

interface NewsCardProps {
  news: News;
  locale: string;
}

const categoryColors: Record<string, string> = {
  finance: "bg-brand-orange",
  "real-estate": "bg-brand-orange", 
  interviews: "bg-brand-purple",
  insurance: "bg-brand-blue",
  default: "bg-gray-600",
};

export function NewsCard({ news, locale }: NewsCardProps) {
  const [imageError, setImageError] = useState(false);
  const categoryColor = news.category?.slug 
    ? categoryColors[news.category.slug] || categoryColors.default
    : categoryColors.default;

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden group">
      <Link href={`/${locale}/xeberler/${news.slug}`} className="block">
        <div className="relative h-64 overflow-hidden">
          <img
            src={imageError ? "/news-placeholder.svg" : getImageUrl(news.thumbnail_image)}
            alt={getTranslation(news.title, locale)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
          <div className="absolute bottom-3 left-3 flex items-center space-x-2">
            {news.category && (
              <span className={`${categoryColor} text-white px-2 py-1 rounded text-xs`}>
                {getTranslation(news.category.title, locale)}
              </span>
            )}
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs">
              {formatShortDate(news.publish_date, locale)}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-3">
        <Link href={`/${locale}/xeberler/${news.slug}`}>
          <h4 className="text-lg font-bold text-black dark:text-white leading-tight hover:text-brand-orange transition-colors">
            {getTranslation(news.title, locale)}
          </h4>
        </Link>
      </div>
    </div>
  );
}