'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, TrendingUp, Calendar, Shield, Percent } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { BankLogo } from '@/components/ui/bank-logo';
import { getTranslation } from '@/lib/utils';

interface DepositsClientProps {
  locale: string;
}

interface DepositOffer {
  id: number;
  title: any;
  slug: string;
  min_interest_rate: number;
  max_interest_rate: number;
  min_amount: number;
  max_amount: number;
  company: {
    id: number;
    name: any;
    slug: string;
    logo?: string;
  };
  duration: {
    id: number;
    duration: any;
  };
  advantages: Array<{
    id: number;
    title: any;
  }>;
  features?: any;
  campaign_conditions?: any;
  order: number;
}

export function DepositsClient({ locale }: DepositsClientProps) {
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [expandedBanks, setExpandedBanks] = useState<string[]>([]);

  const translations = {
    az: {
      title: 'Depozitlər',
      breadcrumbHome: 'Ana səhifə',
      breadcrumbCurrent: 'Depozitlər',
      sortBy: 'Sıralama',
      sortByRate: 'Faiz dərəcəsi',
      sortByAmount: 'Minimum məbləğ',
      sortByDuration: 'Müddət',
      filterDuration: 'Müddət seçin',
      allDurations: 'Bütün müddətlər',
      interestRate: 'İllik faiz',
      minAmount: 'Minimum məbləğ',
      maxAmount: 'Maksimum məbləğ',
      duration: 'Müddət',
      applyNow: 'Müraciət et',
      showMore: 'Daha çox göstər',
      showLess: 'Daha az göstər',
      features: 'Xüsusiyyətlər',
      advantages: 'Üstünlüklər',
      from: 'dan',
      to: 'dək',
      currency: 'AZN',
      perYear: 'illik',
      noDeposits: 'Depozit tapılmadı',
      compareDeposits: 'Depozitləri müqayisə et',
      upTo: 'qədər'
    },
    en: {
      title: 'Deposits',
      breadcrumbHome: 'Home',
      breadcrumbCurrent: 'Deposits',
      sortBy: 'Sort by',
      sortByRate: 'Interest rate',
      sortByAmount: 'Minimum amount',
      sortByDuration: 'Duration',
      filterDuration: 'Select duration',
      allDurations: 'All durations',
      interestRate: 'Annual interest',
      minAmount: 'Minimum amount',
      maxAmount: 'Maximum amount',
      duration: 'Duration',
      applyNow: 'Apply now',
      showMore: 'Show more',
      showLess: 'Show less',
      features: 'Features',
      advantages: 'Advantages',
      from: 'from',
      to: 'to',
      currency: 'AZN',
      perYear: 'per year',
      noDeposits: 'No deposits found',
      compareDeposits: 'Compare deposits',
      upTo: 'up to'
    },
    ru: {
      title: 'Депозиты',
      breadcrumbHome: 'Главная',
      breadcrumbCurrent: 'Депозиты',
      sortBy: 'Сортировка',
      sortByRate: 'Процентная ставка',
      sortByAmount: 'Минимальная сумма',
      sortByDuration: 'Срок',
      filterDuration: 'Выберите срок',
      allDurations: 'Все сроки',
      interestRate: 'Годовая ставка',
      minAmount: 'Минимальная сумма',
      maxAmount: 'Максимальная сумма',
      duration: 'Срок',
      applyNow: 'Подать заявку',
      showMore: 'Показать больше',
      showLess: 'Показать меньше',
      features: 'Особенности',
      advantages: 'Преимущества',
      from: 'от',
      to: 'до',
      currency: 'AZN',
      perYear: 'годовых',
      noDeposits: 'Депозиты не найдены',
      compareDeposits: 'Сравнить депозиты',
      upTo: 'до'
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.az;

  // Fetch deposits (filter by deposit category)
  const { data: depositsData, isLoading } = useQuery({
    queryKey: ['deposits', locale, sortBy, sortOrder, selectedDuration],
    queryFn: async () => {
      const params = new URLSearchParams({
        category: 'deposit', // Assuming 'deposit' is the slug for deposit category
        sort_by: sortBy,
        sort_order: sortOrder,
        per_page: '100'
      });
      
      if (selectedDuration) {
        params.append('duration_id', selectedDuration);
      }
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/${locale}/offers?${params}`
      );
      return response.data;
    }
  });

  // Fetch durations for filter
  const { data: durationsData } = useQuery({
    queryKey: ['durations', locale],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/${locale}/credit-durations`
      );
      return response.data;
    }
  });

  const toggleBankExpansion = (bankName: string) => {
    setExpandedBanks(prev =>
      prev.includes(bankName)
        ? prev.filter(name => name !== bankName)
        : [...prev, bankName]
    );
  };

  // Group deposits by bank
  const bankGroups = React.useMemo(() => {
    if (!depositsData?.data) return [];
    
    const groups: Record<string, { bank_name: string; bank_slug: string; bank_logo?: string; deposits: DepositOffer[] }> = {};
    
    depositsData.data.forEach((deposit: DepositOffer) => {
      const bankName = getTranslation(deposit.company.name, locale);
      if (!groups[bankName]) {
        groups[bankName] = {
          bank_name: bankName,
          bank_slug: deposit.company.slug,
          bank_logo: deposit.company.logo,
          deposits: []
        };
      }
      groups[bankName].deposits.push(deposit);
    });
    
    return Object.values(groups);
  }, [depositsData, locale]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-orange to-green-600 text-white py-8 px-4 md:px-8 lg:px-36">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href={`/${locale}`} className="hover:underline">
              {t.breadcrumbHome}
            </Link>
            <span>›</span>
            <span>{t.breadcrumbCurrent}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-lg opacity-90">
            {t.compareDeposits}
          </p>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="px-4 md:px-8 lg:px-36 py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4">
          {/* Duration Filter */}
          <select
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">{t.allDurations}</option>
            {durationsData?.data?.map((duration: any) => (
              <option key={duration.id} value={duration.id}>
                {getTranslation(duration.duration, locale)}
              </option>
            ))}
          </select>

          {/* Sort Options */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder as 'asc' | 'desc');
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="order-asc">{t.sortBy}</option>
            <option value="min_interest_rate-desc">{t.sortByRate} ↓</option>
            <option value="min_interest_rate-asc">{t.sortByRate} ↑</option>
            <option value="min_amount-asc">{t.sortByAmount} ↑</option>
            <option value="min_amount-desc">{t.sortByAmount} ↓</option>
          </select>
        </div>
      </div>

      {/* Deposits List */}
      <div className="px-4 md:px-8 lg:px-36 py-8">
        <div className="max-w-5xl mx-auto">
          {bankGroups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">{t.noDeposits}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bankGroups.map((bank) => {
                const isExpanded = expandedBanks.includes(bank.bank_name);
                const visibleDeposits = isExpanded ? bank.deposits : bank.deposits.slice(0, 2);
                
                return (
                  <div key={bank.bank_slug} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    {/* Bank Header */}
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <BankLogo 
                            name={bank.bank_name} 
                            logo={bank.bank_logo}
                            className="w-16 h-16"
                          />
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                              {bank.bank_name}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {bank.deposits.length} {locale === 'az' ? 'depozit' : locale === 'en' ? 'deposits' : 'депозитов'}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/${locale}/sirketler/banklar/${bank.bank_slug}`}
                          className="text-brand-orange hover:text-brand-orange-dark text-sm font-medium"
                        >
                          {locale === 'az' ? 'Bank haqqında' : locale === 'en' ? 'About bank' : 'О банке'} →
                        </Link>
                      </div>
                    </div>

                    {/* Deposits Grid */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {visibleDeposits.map((deposit) => (
                          <div key={deposit.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-5 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {getTranslation(deposit.title, locale)}
                              </h3>
                              <div className="flex items-center gap-1 text-brand-orange">
                                <Percent className="w-4 h-4" />
                                <span className="text-xl font-bold">
                                  {deposit.max_interest_rate}%
                                </span>
                              </div>
                            </div>

                            <div className="space-y-3 mb-4">
                              {/* Interest Rate */}
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400 text-sm">
                                  {t.interestRate}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {deposit.min_interest_rate}% - {deposit.max_interest_rate}% {t.perYear}
                                </span>
                              </div>

                              {/* Amount Range */}
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400 text-sm">
                                  {t.minAmount}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {t.from} {deposit.min_amount.toLocaleString()} {t.currency}
                                </span>
                              </div>

                              {deposit.max_amount > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                                    {t.maxAmount}
                                  </span>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {t.upTo} {deposit.max_amount.toLocaleString()} {t.currency}
                                  </span>
                                </div>
                              )}

                              {/* Duration */}
                              {deposit.duration && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                                    {t.duration}
                                  </span>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {getTranslation(deposit.duration.duration, locale)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Advantages */}
                            {deposit.advantages && deposit.advantages.length > 0 && (
                              <div className="mb-4">
                                <div className="flex flex-wrap gap-2">
                                  {deposit.advantages.slice(0, 3).map((advantage) => (
                                    <span
                                      key={advantage.id}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full"
                                    >
                                      <Shield className="w-3 h-3" />
                                      {getTranslation(advantage.title, locale)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Apply Button */}
                            <Link
                              href={`/${locale}/deposits/${deposit.slug}`}
                              className="block w-full text-center px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-dark transition-colors"
                            >
                              {t.applyNow}
                            </Link>
                          </div>
                        ))}
                      </div>

                      {/* Show More/Less Button */}
                      {bank.deposits.length > 2 && (
                        <button
                          onClick={() => toggleBankExpansion(bank.bank_name)}
                          className="mt-4 flex items-center gap-2 text-brand-orange hover:text-brand-orange-dark font-medium"
                        >
                          {isExpanded ? (
                            <>
                              {t.showLess} <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              {t.showMore} ({bank.deposits.length - 2}) <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}