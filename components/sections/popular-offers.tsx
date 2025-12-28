"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Link } from '@/lib/navigation';
import { useDictionary } from "@/providers/dictionary-provider";
import { offersApi } from "@/lib/api/endpoints";
import { OfferCard } from "@/components/ui/offer-card";
import { getTranslation } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PopularOffersProps {
  locale: string;
}

export function PopularOffers({ locale }: PopularOffersProps) {
  const dictionary = useDictionary();
  const t = dictionary.home;
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Fetch offer categories
  const { data: categories } = useQuery({
    queryKey: ["offer-categories", locale],
    queryFn: () => offersApi.getCategories(locale),
  });

  // Fetch offers
  const { data: offers, isLoading } = useQuery({
    queryKey: ["popular-offers", locale, selectedCategory],
    queryFn: () => selectedCategory ? offersApi.getAll(locale, {
      category: selectedCategory,
      per_page: 3,
      sort_by: 'views',
      sort_order: 'desc'
    }) : Promise.resolve({ data: [] }),
    enabled: !!selectedCategory,
  });

  const tabs = Array.isArray(categories?.data) 
    ? categories.data.map(cat => ({
        id: cat.slug,
        slug: cat.slug,
        label: getTranslation(cat.title, locale),
      }))
    : [];

  // Set first category as default when categories load
  useEffect(() => {
    if (tabs.length > 0 && !selectedCategory) {
      setSelectedCategory(tabs[0].id);
    }
  }, [tabs, selectedCategory]);

  // Don't render anything if no categories available
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-black dark:text-white">
          {t.popularOffers}
        </h2>
        <Link
          href={'/sirketler/kredit-teskilatlari'}
          className="flex items-center space-x-1 border border-black/50 dark:border-gray-600 text-black dark:text-white px-3 py-2 rounded-lg text-sm opacity-50 hover:opacity-100 transition-opacity"
        >
          <span>{t.moreOffers}</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Category tabs */}
      <div className="relative mb-6">
        <div className="flex items-center space-x-2 lg:space-x-4 overflow-x-auto scrollbar-hide pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors flex-shrink-0",
                selectedCategory === tab.id
                  ? "border border-black dark:border-white text-black dark:text-white"
                  : "text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Gradient fade on the right if content overflows */}
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none lg:hidden" />
      </div>

      {/* Offers grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-96 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {Array.isArray(offers?.data?.data) && offers.data.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {offers.data.data.map((offer, index) => {
                const currentCategory = tabs.find(tab => tab.id === selectedCategory);
                return (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    locale={locale}
                    featured={index === 0}
                    categorySlug={currentCategory?.slug || selectedCategory || 'general'}
                    categoryName={currentCategory?.label || 'General'}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 px-4">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {locale === 'az' ? 'Bu kateqoriya üçün təklif yoxdur' : 
                   locale === 'ru' ? 'Нет предложений для этой категории' :
                   'No offers available for this category'}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}