"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from '@/lib/navigation';
import { useDictionary } from "@/providers/dictionary-provider";
import { offersApi } from "@/lib/api/endpoints";
import { OfferCardMinimal } from "@/components/ui/offer-card-minimal";
import { getTranslation } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PopularOffersProps {
  locale: string;
}

export function PopularOffersModern({ locale }: PopularOffersProps) {
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
      per_page: 4,
      sort_by: 'views',
      sort_order: 'desc'
    }) : Promise.resolve({ data: [] }),
    enabled: !!selectedCategory,
  });

  const tabs = Array.isArray(categories?.data) 
    ? categories.data.map(cat => ({
        id: cat.slug,
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
    <div className="mb-12 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/5 via-transparent to-brand-orange/5 rounded-3xl -z-10" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-orange to-brand-orange-dark rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-black dark:text-white">
              {t.popularOffers}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {locale === 'az' ? 'Ən yaxşı kredit təklifləri' : 
               locale === 'ru' ? 'Лучшие кредитные предложения' : 
               'Best credit offers'}
            </p>
          </div>
        </div>
        
        <Link
          href={'/sirketler/kredit-teskilatlari'}
          className="group flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300"
        >
          <span className="text-sm font-medium">{t.moreOffers}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Category Pills - Redesigned */}
      <div className="relative mb-8">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={cn(
                "px-5 py-3 rounded-xl text-base font-medium whitespace-nowrap transition-all duration-300",
                selectedCategory === tab.id
                  ? "bg-gradient-to-r from-brand-orange to-brand-orange-dark text-white shadow-lg scale-105"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Offers Grid - Modern Layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {Array.isArray(offers?.data?.data) && offers.data.data.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {offers.data.data.slice(0, 4).map((offer, index) => {
                const currentCategory = tabs.find(tab => tab.id === selectedCategory);
                return (
                  <OfferCardMinimal
                    key={offer.id}
                    offer={offer}
                    locale={locale}
                    index={index}
                    categorySlug={currentCategory?.id || selectedCategory || 'general'}
                    categoryName={currentCategory?.label || 'General'}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-16 px-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                  {locale === 'az' ? 'Bu kateqoriya üçün təklif yoxdur' : 
                   locale === 'ru' ? 'Нет предложений для этой категории' :
                   'No offers available for this category'}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  {locale === 'az' ? 'Tezliklə yeni təkliflər əlavə olunacaq' : 
                   locale === 'ru' ? 'Новые предложения будут добавлены в ближайшее время' :
                   'New offers will be added soon'}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Bottom CTA Section */}
      {Array.isArray(offers?.data?.data) && offers.data.data.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {locale === 'az' ? '💡 Kredit kalkulyatoru ilə aylıq ödənişinizi hesablayın' : 
                 locale === 'ru' ? '💡 Рассчитайте ежемесячный платеж с помощью кредитного калькулятора' :
                 '💡 Calculate your monthly payment with credit calculator'}
              </p>
            </div>
            <Link
              href={'/kalkulyator/kredit'}
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
            >
              {locale === 'az' ? 'Kalkulyator' : locale === 'ru' ? 'Калькулятор' : 'Calculator'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

