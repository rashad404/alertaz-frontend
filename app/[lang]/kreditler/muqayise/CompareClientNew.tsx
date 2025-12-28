'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Link } from '@/lib/navigation';
import { ChevronLeft, X, Plus, Loader2 } from 'lucide-react';
import { useComparison } from '@/contexts/comparison-context';
import { getTranslation, formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import type { Offer } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CompareClientNewProps {
  params: { lang: string };
}

export default function CompareClientNew({ params }: CompareClientNewProps) {
  const { lang } = params;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getItemsByCategory, removeFromComparison, clearComparison, addToComparison } = useComparison();
  
  const categorySlug = searchParams.get('category') || '';
  const ids = searchParams.get('ids')?.split(',').map(Number).filter(id => !isNaN(id)) || [];
  
  const [selectedCategory, setSelectedCategory] = useState(categorySlug);
  const [selectedIds, setSelectedIds] = useState<number[]>(ids);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mobileSelectedIndex, setMobileSelectedIndex] = useState(0);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  const itemsByCategory = getItemsByCategory();
  
  // Load comparison items for selected category
  useEffect(() => {
    if (selectedCategory && itemsByCategory[selectedCategory]) {
      const categoryIds = itemsByCategory[selectedCategory].map(item => item.offer.id);
      // Only update if the IDs actually changed to prevent infinite loop
      setSelectedIds(prevIds => {
        const idsMatch = prevIds.length === categoryIds.length && 
                        prevIds.every(id => categoryIds.includes(id)) &&
                        categoryIds.every(id => prevIds.includes(id));
        return idsMatch ? prevIds : categoryIds;
      });
    }
  }, [selectedCategory, itemsByCategory]); // Depend on both to update when items change

  // Load offers from URL if context is empty but we have IDs
  useEffect(() => {
    const loadOffersFromUrl = async () => {
      if (categorySlug && ids.length > 0 && (!itemsByCategory[categorySlug] || itemsByCategory[categorySlug].length === 0)) {
        setIsLoadingOffers(true);
        try {
          // Fetch the offers based on IDs
          const response = await apiClient.get(`/${lang}/teklifler`, {
            params: {
              category: categorySlug,
              per_page: 50
            }
          });
          
          const offers = response.data.data;
          if (offers && Array.isArray(offers)) {
            // Find the offers that match the IDs from URL
            const selectedOffers = offers.filter((offer: Offer) => ids.includes(offer.id));
            
            // Get category name from first offer or use slug as fallback
            const categoryName = selectedOffers[0]?.category?.name || 
                               selectedOffers[0]?.category?.title || 
                               categorySlug;
            
            // Add each offer to comparison
            selectedOffers.forEach((offer: Offer) => {
              addToComparison(offer, categorySlug, getTranslation(categoryName, lang));
            });
          }
        } catch (error) {
          console.error('Error loading offers from URL:', error);
        } finally {
          setIsLoadingOffers(false);
        }
      }
    };
    
    loadOffersFromUrl();
  }, [categorySlug, ids, lang]); // Run only once on mount with URL params

  // Fetch additional offers for adding to comparison
  const { data: availableOffers, isLoading: isLoadingAddOffers } = useQuery({
    queryKey: ['offers', lang, selectedCategory],
    queryFn: async () => {
      const response = await apiClient.get(`/${lang}/teklifler`, {
        params: {
          category: selectedCategory,
          per_page: 50
        }
      });
      return response.data.data;
    },
    enabled: showAddModal && !!selectedCategory
  });

  const translations = {
    az: {
      title: 'Kreditləri müqayisə et',
      selectCategory: 'Kateqoriya seçin',
      noItems: 'Müqayisə üçün məhsul yoxdur',
      addMore: 'Əlavə et',
      remove: 'Sil',
      clearAll: 'Hamısını təmizlə',
      back: 'Geri',
      amount: 'Məbləğ',
      interestRate: 'İllik faiz',
      term: 'Müddət',
      monthlyPayment: 'Aylıq ödəniş',
      commission: 'Komissiya',
      apply: 'Müraciət et',
      details: 'Ətraflı',
      month: 'ay',
      currency: 'AZN',
      selectToAdd: 'Əlavə etmək üçün seçin',
      close: 'Bağla',
      compareWith: 'Müqayisə et:',
      swipeToView: 'Digər kreditləri görmək üçün sürüşdürün',
    },
    en: {
      title: 'Compare Credits',
      selectCategory: 'Select category',
      noItems: 'No items to compare',
      addMore: 'Add more',
      remove: 'Remove',
      clearAll: 'Clear all',
      back: 'Back',
      amount: 'Amount',
      interestRate: 'Annual rate',
      term: 'Term',
      monthlyPayment: 'Monthly payment',
      commission: 'Commission',
      apply: 'Apply',
      details: 'Details',
      month: 'months',
      currency: 'AZN',
      selectToAdd: 'Select to add',
      close: 'Close',
      compareWith: 'Compare with:',
      swipeToView: 'Swipe to view other credits',
    },
    ru: {
      title: 'Сравнить кредиты',
      selectCategory: 'Выберите категорию',
      noItems: 'Нет товаров для сравнения',
      addMore: 'Добавить',
      remove: 'Удалить',
      clearAll: 'Очистить все',
      back: 'Назад',
      amount: 'Сумма',
      interestRate: 'Годовая ставка',
      term: 'Срок',
      monthlyPayment: 'Ежемесячный платеж',
      commission: 'Комиссия',
      apply: 'Подать заявку',
      details: 'Подробнее',
      month: 'месяцев',
      currency: 'AZN',
      selectToAdd: 'Выберите для добавления',
      close: 'Закрыть',
      compareWith: 'Сравнить с:',
      swipeToView: 'Проведите, чтобы увидеть другие кредиты',
    }
  };

  const t = translations[lang as keyof typeof translations] || translations.az;

  const comparisonItems = selectedCategory && itemsByCategory[selectedCategory] 
    ? itemsByCategory[selectedCategory] 
    : [];

  const handleRemove = (offerId: number) => {
    if (selectedCategory) {
      removeFromComparison(offerId, selectedCategory);
      // If removing current mobile view item, go to previous
      if (comparisonItems[mobileSelectedIndex]?.offer.id === offerId) {
        setMobileSelectedIndex(Math.max(0, mobileSelectedIndex - 1));
      }
    }
  };

  const handleClearAll = () => {
    if (selectedCategory) {
      clearComparison(selectedCategory);
      router.push('/credits');
    }
  };

  const handleAddOffer = (offer: Offer) => {
    if (selectedCategory && comparisonItems[0]) {
      // Add the offer to comparison using the current category
      const added = addToComparison(offer, selectedCategory, comparisonItems[0].categoryName);
      
      if (added) {
        // Update the URL to include the new offer ID
        const currentIds = comparisonItems.map(item => item.offer.id);
        const newIds = [...currentIds, offer.id];
        router.push(`/${lang}/credits/compare?category=${selectedCategory}&ids=${newIds.join(',')}`);
      }
    }
    setShowAddModal(false);
  };

  // Show loading state while fetching offers from URL
  if (isLoadingOffers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  // No items at all
  if (Object.keys(itemsByCategory).length === 0 && !categorySlug) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" suppressHydrationWarning>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t.noItems}</h1>
          <Link
            href={'/credits'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange hover:bg-brand-orange-dark text-white font-medium rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            {t.back}
          </Link>
        </div>
      </div>
    );
  }

  // Main render
  if (!selectedCategory || comparisonItems.length === 0) {
    // Empty state when no category selected or no items
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {selectedCategory ? t.noItems : t.selectCategory}
            </h1>
            <Link
              href={'/credits'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange hover:bg-brand-orange-dark text-white font-medium rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              {t.back}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Has items to compare
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
      {/* Mobile View - shown on small screens */}
      <div className="md:hidden" suppressHydrationWarning>
        {/* Mobile Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-4 py-4" suppressHydrationWarning>
            <div className="flex items-center justify-between mb-3">
              <Link
                href={'/credits'}
                className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t.title}</h1>
              <button
                onClick={handleClearAll}
                className="text-sm text-red-600 dark:text-red-400"
              >
                {t.clearAll}
              </button>
            </div>
            
            {/* Mobile selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2" suppressHydrationWarning>
              {comparisonItems.map((item, index) => (
                <button
                  key={item.offer.id}
                  onClick={() => setMobileSelectedIndex(index)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all flex-shrink-0",
                    mobileSelectedIndex === index
                      ? "bg-brand-orange text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  )}
                >
                  {getTranslation(item.offer.title, lang).substring(0, 20)}...
                </button>
              ))}
              {comparisonItems.length < 4 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  {t.addMore}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile comparison cards */}
        <div className="px-4 py-4" suppressHydrationWarning>
          {comparisonItems[mobileSelectedIndex] && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6" suppressHydrationWarning>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {getTranslation(comparisonItems[mobileSelectedIndex].offer.title, lang)}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    {comparisonItems[mobileSelectedIndex].offer.company && 
                     getTranslation(comparisonItems[mobileSelectedIndex].offer.company.name, lang)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(comparisonItems[mobileSelectedIndex].offer.id)}
                  className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 rounded-lg"
                >
                  <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">{t.amount}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(comparisonItems[mobileSelectedIndex].offer.min_amount || 0)} - 
                    {formatCurrency(comparisonItems[mobileSelectedIndex].offer.max_amount || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">{t.interestRate}</span>
                  <span className="text-2xl font-bold text-brand-orange">
                    {comparisonItems[mobileSelectedIndex].offer.min_interest_rate || 0}%
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">{t.term}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {comparisonItems[mobileSelectedIndex].offer.min_duration || 0} - 
                    {comparisonItems[mobileSelectedIndex].offer.max_duration || 0} {t.month}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">{t.monthlyPayment}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ~{formatCurrency(comparisonItems[mobileSelectedIndex].offer.monthly_payment || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-600 dark:text-gray-400">{t.commission}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {comparisonItems[mobileSelectedIndex].offer.commission_rate || 0}%
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <a
                  href={comparisonItems[mobileSelectedIndex].offer.site_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-3 bg-brand-orange hover:bg-brand-orange-dark text-white text-center font-medium rounded-lg transition-colors"
                >
                  {t.apply}
                </a>
                <Link
                  href={`/offers/${comparisonItems[mobileSelectedIndex].offer.id}`}
                  className="block w-full px-4 py-3 border border-brand-orange text-brand-orange hover:bg-brand-orange/10 text-center font-medium rounded-lg transition-colors"
                >
                  {t.details}
                </Link>
              </div>
            </div>
          )}

          {comparisonItems.length > 1 && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              {t.swipeToView}
            </p>
          )}
        </div>
      </div>

      {/* Desktop View - shown on medium and larger screens */}
      <div className="hidden md:block" suppressHydrationWarning>
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" suppressHydrationWarning>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href={'/credits'}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
              </div>
              
              {/* Category selector */}
              {Object.keys(itemsByCategory).length > 1 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t.selectCategory}</option>
                  {Object.entries(itemsByCategory).map(([slug, items]) => (
                    <option key={slug} value={slug}>
                      {items[0]?.categoryName} ({items.length})
                    </option>
                  ))}
                </select>
              )}

              {selectedCategory && comparisonItems.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                >
                  {t.clearAll}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Comparison Table - with horizontal scroll for many items */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" suppressHydrationWarning>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 min-w-[150px]"></th>
                    {comparisonItems.map((item) => (
                      <th key={item.offer.id} className="p-4 text-left min-w-[250px] max-w-[300px]">
                        <div className="relative">
                          <button
                            onClick={() => handleRemove(item.offer.id)}
                            className="absolute -top-2 -right-2 p-1 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 rounded-full z-10"
                          >
                            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                          <div className="pr-8">
                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                              {getTranslation(item.offer.title, lang)}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {item.offer.company && getTranslation(item.offer.company.name, lang)}
                            </p>
                          </div>
                        </div>
                      </th>
                    ))}
                    {comparisonItems.length < 4 && (
                      <th className="p-4 min-w-[250px]">
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="w-full h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-brand-orange hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex flex-col items-center justify-center gap-2"
                        >
                          <Plus className="w-6 h-6 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">{t.addMore}</span>
                        </button>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {/* Amount */}
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800">{t.amount}</td>
                    {comparisonItems.map((item) => (
                      <td key={`amount-${item.offer.id}`} className="p-4">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(item.offer.min_amount || 0)} - {formatCurrency(item.offer.max_amount || 0)}
                        </span>
                      </td>
                    ))}
                    {comparisonItems.length < 4 && <td></td>}
                  </tr>

                  {/* Interest Rate */}
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800">{t.interestRate}</td>
                    {comparisonItems.map((item) => (
                      <td key={`rate-${item.offer.id}`} className="p-4">
                        <span className="text-2xl font-bold text-brand-orange">
                          {item.offer.min_interest_rate || item.offer.annual_rate_min || 0}%
                        </span>
                      </td>
                    ))}
                    {comparisonItems.length < 4 && <td></td>}
                  </tr>

                  {/* Term */}
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800">{t.term}</td>
                    {comparisonItems.map((item) => (
                      <td key={`term-${item.offer.id}`} className="p-4">
                        <span className="text-gray-900 dark:text-white">
                          {item.offer.min_duration || 0} - {item.offer.max_duration || 0} {t.month}
                        </span>
                      </td>
                    ))}
                    {comparisonItems.length < 4 && <td></td>}
                  </tr>

                  {/* Monthly Payment */}
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800">{t.monthlyPayment}</td>
                    {comparisonItems.map((item) => (
                      <td key={`payment-${item.offer.id}`} className="p-4">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ~{formatCurrency(item.offer.monthly_payment || 0)}
                        </span>
                      </td>
                    ))}
                    {comparisonItems.length < 4 && <td></td>}
                  </tr>

                  {/* Commission */}
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800">{t.commission}</td>
                    {comparisonItems.map((item) => (
                      <td key={`commission-${item.offer.id}`} className="p-4">
                        <span className="text-gray-900 dark:text-white">
                          {item.offer.commission_rate || 0}%
                        </span>
                      </td>
                    ))}
                    {comparisonItems.length < 4 && <td></td>}
                  </tr>

                  {/* Action Buttons */}
                  <tr>
                    <td className="p-4 sticky left-0 bg-white dark:bg-gray-800"></td>
                    {comparisonItems.map((item) => (
                      <td key={`actions-${item.offer.id}`} className="p-4">
                        <div className="space-y-2">
                          <a
                            href={item.offer.site_link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full px-4 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white text-center font-medium rounded-lg transition-colors"
                          >
                            {t.apply}
                          </a>
                          <Link
                            href={`/offers/${item.offer.id}`}
                            className="block w-full px-4 py-2 border border-brand-orange text-brand-orange hover:bg-brand-orange/10 text-center font-medium rounded-lg transition-colors"
                          >
                            {t.details}
                          </Link>
                        </div>
                      </td>
                    ))}
                    {comparisonItems.length < 4 && <td></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Offer Modal - shown on all screen sizes */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.selectToAdd}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {isLoadingAddOffers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
                </div>
              ) : (
                <div className="space-y-2">
                  {availableOffers?.filter((offer: Offer) => !selectedIds.includes(offer.id)).map((offer: Offer) => (
                    <button
                      key={offer.id}
                      onClick={() => handleAddOffer(offer)}
                      className="w-full p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-orange hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {getTranslation(offer.title, lang)}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {offer.company && getTranslation(offer.company.name, lang)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-brand-orange">
                            {offer.min_interest_rate || offer.annual_rate_min || 0}%
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(offer.max_amount || 0)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}