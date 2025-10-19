'use client';

import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useDictionary } from "@/providers/dictionary-provider";
import { getImageUrl, getTranslation, formatCurrency, calculateMonthlyPayment } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Offer } from "@/lib/types";
import { getLocalizedPath } from "@/lib/utils/locale";

interface OfferCardProps {
  offer: Offer;
  locale: string;
  featured?: boolean;
  categorySlug?: string;
  categoryName?: string;
}

export function OfferCard({ offer, locale, featured = false, categorySlug, categoryName }: OfferCardProps) {
  const dictionary = useDictionary();
  const t = dictionary.offer;
  const [imageError, setImageError] = useState(false);
  
  // Determine category if not provided
  const offerCategorySlug = categorySlug || offer.category?.slug || 'general';
  const offerCategoryName = categoryName || (offer.category && getTranslation(offer.category.name, locale)) || 'General';
  

  return (
    <Link
      href={getLocalizedPath(locale, `/teklifler/${offer.id}`)}
      className={cn(
        "block bg-gray-100 dark:bg-gray-800 rounded-2xl p-7 hover:shadow-lg transition-shadow cursor-pointer",
        featured && "border-2 border-brand-orange shadow-lg"
      )}
    >
      <div className="flex items-center space-x-3 mb-6">
        {offer.company?.logo && (
          <img
            src={imageError ? "/news-placeholder.svg" : getImageUrl(offer.company.logo)}
            alt={getTranslation(offer.company.name, locale)}
            className="w-14 h-14 rounded-xl object-contain bg-white"
            onError={() => setImageError(true)}
          />
        )}
        <div>
          <p className="text-sm text-black dark:text-gray-300">
            {offer.company && getTranslation(offer.company.name, locale)}
          </p>
          <h3 className="text-xl font-medium text-black dark:text-white">
            {getTranslation(offer.title, locale)}
          </h3>
        </div>
      </div>

      <div className="space-y-5 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-black dark:text-gray-300">{t.annualRate}</p>
            <div className="text-3xl font-medium text-black dark:text-white">
              {parseFloat(offer.min_interest_rate || offer.annual_rate_min || offer.annual_interest_rate || 10)}%
            </div>
          </div>
          <div>
            <p className="text-sm text-black dark:text-gray-300">{t.duration}</p>
            <div className="text-black dark:text-white">
              <span className="text-3xl font-medium">
                {typeof offer.max_duration === 'number' 
                  ? offer.max_duration 
                  : parseInt(
                      offer.max_duration?.toString().replace(' ay', '') || 
                      (typeof offer.duration?.title === 'string' 
                        ? offer.duration.title.replace(' ay', '') 
                        : getTranslation(offer.duration?.title || '', locale).replace(' ay', '')) || 
                      offer.term_max || 
                      '60'
                    )}
              </span>
              <span className="text-lg ml-1">{t.month}</span>
            </div>
          </div>
          {offer.monthly_payment !== null && (
            <div>
              <p className="text-sm text-black dark:text-gray-300">{t.monthly}</p>
              <div className="text-black dark:text-white">
                <span className="text-3xl font-medium">
                  {Math.round(parseFloat(offer.monthly_payment || calculateMonthlyPayment(
                    offer.max_amount || offer.amount_max || 50000, 
                    offer.min_interest_rate || offer.annual_rate_min || 10, 
                    typeof offer.max_duration === 'number' 
                      ? offer.max_duration 
                      : parseInt(
                          (typeof offer.duration?.title === 'string' 
                            ? offer.duration.title.replace(' ay', '') 
                            : getTranslation(offer.duration?.title || '', locale).replace(' ay', '')) || 
                          offer.max_duration?.toString() || 
                          offer.term_max || 
                          '60'
                        )
                  )))}
                </span>
                <span className="text-lg ml-1">{t.currency}</span>
              </div>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-black dark:text-gray-300">{t.maxCreditLimit}</p>
          <div className="text-black dark:text-white">
            <span className="text-4xl font-medium">
              {new Intl.NumberFormat('az-AZ').format(parseFloat(offer.max_amount || offer.amount_max || 50000))}
            </span>
            <span className="text-lg ml-1">{t.currency}</span>
          </div>
        </div>
      </div>

      {(offer.advantages && offer.advantages.length > 0) ? (
        <div className="space-y-2 mb-6">
          {offer.advantages.slice(0, 3).map((advantage) => (
            <div key={advantage.id} className="flex items-center space-x-3">
              <Check className="w-6 h-6 text-brand-orange flex-shrink-0" />
              <span className="text-black dark:text-white">
                {typeof advantage === 'object' && advantage.title ? getTranslation(advantage.title, locale) : (t.advantages?.[advantage] || advantage)}
              </span>
            </div>
          ))}
        </div>
      ) : offer.offer_advantages ? (
        <div className="space-y-2 mb-6">
          {offer.offer_advantages.slice(0, 3).map((advantage) => (
            <div key={advantage.id} className="flex items-center space-x-3">
              <Check className="w-6 h-6 text-brand-orange flex-shrink-0" />
              <span className="text-black dark:text-white">
                {getTranslation(advantage.title, locale)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(offer.site_link || '#', '_blank', 'noopener,noreferrer');
          }}
          className={cn(
            "w-full py-3 rounded-lg font-medium transition-colors text-center block",
            featured
              ? "bg-brand-orange-dark text-white hover:bg-brand-orange"
              : "bg-brand-orange text-white hover:bg-brand-orange-dark"
          )}
        >
          {t.apply}
        </button>
        <div className="flex items-center justify-between pt-2">
          <span className="text-brand-orange font-medium">
            {t.details}
          </span>
          <ChevronRight className="w-5 h-5 text-brand-orange" />
        </div>
      </div>
    </Link>
  );
}