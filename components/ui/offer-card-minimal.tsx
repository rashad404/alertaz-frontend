'use client';

import Link from "next/link";
import { ArrowRight, TrendingUp, ChevronRight } from "lucide-react";
import { useState } from "react";
import { getImageUrl, getTranslation } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Offer } from "@/lib/types";
import { getLocalizedPath } from "@/lib/utils/locale";

interface OfferCardMinimalProps {
  offer: Offer;
  locale: string;
  index?: number;
  categorySlug?: string;
  categoryName?: string;
}

export function OfferCardMinimal({ offer, locale, index = 0, categorySlug, categoryName }: OfferCardMinimalProps) {
  const [imageError, setImageError] = useState(false);
  
  
  // Extract values
  const interestRate = parseFloat(offer.min_interest_rate || offer.annual_rate_min || offer.annual_interest_rate || 10);
  const maxAmount = parseFloat(offer.max_amount || offer.amount_max || 50000);
  // Handle max_duration as either integer or string
  const maxDuration = typeof offer.max_duration === 'number' 
    ? offer.max_duration 
    : parseInt(
        offer.max_duration?.toString().replace(' ay', '') || 
        (typeof offer.duration?.title === 'string' 
          ? offer.duration.title.replace(' ay', '') 
          : offer.duration?.title ? getTranslation(offer.duration.title, locale).replace(' ay', '') : '') || 
        offer.term_max || 
        '60'
      );
  
  // Card background colors - subtle gradients
  const gradients = [
    "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
    "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30", 
    "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
  ];
  
  const accentColors = [
    "text-emerald-600 dark:text-emerald-400",
    "text-blue-600 dark:text-blue-400",
    "text-purple-600 dark:text-purple-400",
  ];

  return (
    <Link 
      href={getLocalizedPath(locale, `/teklifler/${offer.id}`)}
      className="group block"
    >
      <div className={cn(
        "relative bg-gradient-to-br rounded-2xl p-5 h-full min-h-[240px] flex flex-col transition-all duration-300",
        "hover:shadow-xl hover:scale-[1.02] cursor-pointer",
        "border border-gray-200/50 dark:border-gray-700/50",
        gradients[index % 3]
      )}>
        {/* Top Section - Company */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            {offer.company?.logo && (
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 p-1.5 shadow-sm flex-shrink-0">
                <img
                  src={imageError ? "/news-placeholder.svg" : getImageUrl(offer.company.logo)}
                  alt={offer.bank_name || offer.company?.name || ''}
                  className="w-full h-full object-contain"
                  onError={() => setImageError(true)}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                {offer.bank_name || (offer.company && getTranslation(offer.company.name, locale)) || (offer.bank && offer.bank.name)}
              </p>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {getTranslation(offer.title, locale)}
              </h3>
            </div>
          </div>
        </div>
        
        {/* Interest Rate Badge - Positioned absolutely */}
        <div className={cn(
          "absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
          accentColors[index % 3]
        )}>
          <span className="text-sm font-bold">{interestRate}%</span>
        </div>

        {/* Main Info - Grid Layout for consistency */}
        <div className="grid grid-cols-2 gap-4 mb-4 pt-2">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              {locale === 'az' ? 'Məbləğ' : locale === 'ru' ? 'Сумма' : 'Amount'}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Intl.NumberFormat('az-AZ', {
                notation: 'compact',
                maximumFractionDigits: 0
              }).format(maxAmount)}
              <span className="text-sm font-normal ml-1 text-gray-600 dark:text-gray-400">₼</span>
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              {locale === 'az' ? 'Müddət' : locale === 'ru' ? 'Срок' : 'Term'}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {maxDuration}
              <span className="text-sm font-normal ml-1 text-gray-600 dark:text-gray-400">
                {locale === 'az' ? 'ay' : locale === 'ru' ? 'мес' : 'mo'}
              </span>
            </p>
          </div>
        </div>

        {/* Spacer to push CTA to bottom */}
        <div className="flex-grow"></div>

        {/* CTA - Simplified */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {locale === 'az' ? 'Ətraflı' : locale === 'ru' ? 'Подробнее' : 'Details'}
          </span>
          <ChevronRight className="w-5 h-5 text-brand-orange" />
        </div>

        {/* Popular Badge - Optional */}
        {offer.views && offer.views > 1000 && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              🔥 {locale === 'az' ? 'Populyar' : locale === 'ru' ? 'Популярно' : 'Popular'}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}