'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus, X, Check, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

interface Credit {
  id: number;
  slug: string;
  credit_name: string;
  bank_name: string;
  credit_amount_formatted: string;
  min_amount_formatted: string;
  max_amount_formatted: string;
  interest_rate: number;
  interest_rate_formatted: string;
  credit_term_formatted: string;
  min_term_months: number;
  max_term_months: number;
  monthly_payment: number;
  guarantor: string;
  collateral: string;
  commission_rate: number;
  credit_type: string;
}

interface CompareClientProps {
  params: { lang: string };
  initialIds?: string;
}

const CompareClient = ({ params, initialIds }: CompareClientProps) => {
  const locale = params.lang || 'az';
  const router = useRouter();
  const [selectedCredits, setSelectedCredits] = useState<number[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  // Parse initial IDs from URL
  useEffect(() => {
    if (initialIds) {
      const ids = initialIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      setSelectedCredits(ids);
    }
  }, [initialIds]);

  // Fetch all credits for selection
  const { data: allCreditsData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['all-credits', locale],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/${locale}/kreditler`, {
        params: { per_page: 100 }
      });
      return response.data;
    }
  });

  // Fetch comparison data
  const { data: comparisonData, isLoading: isLoadingComparison } = useQuery({
    queryKey: ['credit-comparison', selectedCredits, locale],
    queryFn: async () => {
      if (selectedCredits.length < 2) return null;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/${locale}/kreditler/compare`, {
        ids: selectedCredits
      });
      return response.data;
    },
    enabled: selectedCredits.length >= 2
  });

  // Update URL when credits change
  useEffect(() => {
    if (selectedCredits.length > 0) {
      const newUrl = `/${locale}/credits/compare?ids=${selectedCredits.join(',')}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [selectedCredits, locale]);

  const addCredit = (creditId: number) => {
    if (selectedCredits.length < 4 && !selectedCredits.includes(creditId)) {
      setSelectedCredits([...selectedCredits, creditId]);
      setShowSelector(false);
    }
  };

  const removeCredit = (creditId: number) => {
    setSelectedCredits(selectedCredits.filter(id => id !== creditId));
  };

  // Translations
  const translations = {
    az: {
      title: 'Kreditləri müqayisə et',
      breadcrumbHome: 'Ana səhifə',
      breadcrumbCredits: 'Kreditlər',
      breadcrumbCompare: 'Müqayisə',
      selectCredits: 'Müqayisə üçün kreditlər seçin',
      addCredit: 'Kredit əlavə et',
      removeCredit: 'Sil',
      creditName: 'Kredit adı',
      bankName: 'Bank',
      amount: 'Məbləğ',
      interestRate: 'İllik faiz',
      term: 'Müddət',
      monthlyPayment: 'Aylıq ödəniş',
      commission: 'Komissiya',
      guarantor: 'Zamin',
      collateral: 'Girov',
      creditType: 'Kredit növü',
      applyNow: 'Müraciət et',
      backToCredits: 'Kreditlərə qayıt',
      selectToCompare: 'Müqayisə üçün seç',
      maxCredits: 'Maksimum 4 kredit müqayisə edilə bilər',
      minCredits: 'Ən azı 2 kredit seçin',
      yes: 'Bəli',
      no: 'Xeyr',
      required: 'Tələb olunur',
      notRequired: 'Tələb olunmur',
      azn: 'AZN',
      month: 'ay'
    },
    en: {
      title: 'Compare Credits',
      breadcrumbHome: 'Home',
      breadcrumbCredits: 'Credits',
      breadcrumbCompare: 'Compare',
      selectCredits: 'Select credits to compare',
      addCredit: 'Add credit',
      removeCredit: 'Remove',
      creditName: 'Credit name',
      bankName: 'Bank',
      amount: 'Amount',
      interestRate: 'Annual rate',
      term: 'Term',
      monthlyPayment: 'Monthly payment',
      commission: 'Commission',
      guarantor: 'Guarantor',
      collateral: 'Collateral',
      creditType: 'Credit type',
      applyNow: 'Apply now',
      backToCredits: 'Back to credits',
      selectToCompare: 'Select to compare',
      maxCredits: 'Maximum 4 credits can be compared',
      minCredits: 'Select at least 2 credits',
      yes: 'Yes',
      no: 'No',
      required: 'Required',
      notRequired: 'Not required',
      azn: 'AZN',
      month: 'months'
    },
    ru: {
      title: 'Сравнить кредиты',
      breadcrumbHome: 'Главная',
      breadcrumbCredits: 'Кредиты',
      breadcrumbCompare: 'Сравнение',
      selectCredits: 'Выберите кредиты для сравнения',
      addCredit: 'Добавить кредит',
      removeCredit: 'Удалить',
      creditName: 'Название кредита',
      bankName: 'Банк',
      amount: 'Сумма',
      interestRate: 'Годовая ставка',
      term: 'Срок',
      monthlyPayment: 'Ежемесячный платеж',
      commission: 'Комиссия',
      guarantor: 'Поручитель',
      collateral: 'Залог',
      creditType: 'Тип кредита',
      applyNow: 'Подать заявку',
      backToCredits: 'Вернуться к кредитам',
      selectToCompare: 'Выбрать для сравнения',
      maxCredits: 'Максимум 4 кредита для сравнения',
      minCredits: 'Выберите минимум 2 кредита',
      yes: 'Да',
      no: 'Нет',
      required: 'Требуется',
      notRequired: 'Не требуется',
      azn: 'AZN',
      month: 'месяцев'
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.az;

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t.title,
    description: t.selectCredits,
    itemListElement: comparisonData?.data?.map((credit: Credit, index: number) => ({
      '@type': 'FinancialProduct',
      position: index + 1,
      name: credit.credit_name,
      provider: {
        '@type': 'BankOrCreditUnion',
        name: credit.bank_name
      },
      interestRate: credit.interest_rate,
      url: `https://kredit.az/${locale}/credits/${credit.slug}`
    })) || []
  };

  if (isLoadingAll) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
          <span className="text-gray-900 dark:text-white">Loading...</span>
        </div>
      </div>
    );
  }

  const credits = comparisonData?.data || [];

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      <main className="min-h-screen bg-white dark:bg-gray-900">
        {/* Breadcrumb */}
        <nav className="flex w-full justify-center px-4 sm:px-8 lg:px-36 py-4" aria-label="Breadcrumb">
          <div className="flex w-full max-w-5xl items-center gap-2 text-sm">
            <Link href={`/${locale}`} className="text-gray-600 dark:text-gray-400 hover:text-[#FF6021] transition-colors">
              {t.breadcrumbHome}
            </Link>
            <span className="text-gray-400">&gt;</span>
            <Link href={`/${locale}/credits`} className="text-gray-600 dark:text-gray-400 hover:text-[#FF6021] transition-colors">
              {t.breadcrumbCredits}
            </Link>
            <span className="text-gray-400">&gt;</span>
            <span className="text-[#FF6021] font-medium">{t.breadcrumbCompare}</span>
          </div>
        </nav>

        {/* Header */}
        <header className="flex w-full justify-center px-4 sm:px-8 lg:px-36 py-8">
          <div className="flex w-full max-w-5xl justify-between items-center">
            <h1 className="text-[#09121F] dark:text-white text-3xl sm:text-4xl font-bold">
              {t.title}
            </h1>
            <Link 
              href={`/${locale}/credits`}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-[#FF6021] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              {t.backToCredits}
            </Link>
          </div>
        </header>

        {/* Comparison Table */}
        <section className="flex w-full justify-center px-4 sm:px-8 lg:px-36 py-4">
          <div className="w-full max-w-5xl">
            {selectedCredits.length < 2 ? (
              <div className="text-center py-12 bg-[#F6F6F6] dark:bg-gray-800 rounded-2xl">
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">{t.minCredits}</p>
                <button
                  onClick={() => router.push(`/${locale}/credits`)}
                  className="px-6 py-3 bg-[#FF6021] hover:bg-[#E54500] text-white font-bold rounded-xl transition-colors"
                >
                  {t.selectCredits}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[768px]">
                  {/* Comparison Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Selected Credits Row */}
                    <div className="grid grid-cols-5 gap-4">
                      <div className="col-span-1"></div>
                      {credits.map((credit: Credit) => (
                        <div key={credit.id} className="col-span-1">
                          <div className="relative p-4 bg-[#F6F6F6] dark:bg-gray-800 rounded-xl">
                            <button
                              onClick={() => removeCredit(credit.id)}
                              className="absolute top-2 right-2 p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                              aria-label={t.removeCredit}
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <h3 className="text-[#09121F] dark:text-white font-bold text-lg pr-8">
                              {credit.credit_name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {credit.bank_name}
                            </p>
                          </div>
                        </div>
                      ))}
                      {selectedCredits.length < 4 && (
                        <div className="col-span-1">
                          <button
                            onClick={() => setShowSelector(true)}
                            className="w-full h-full min-h-[100px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-[#FF6021] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                          >
                            <Plus className="w-6 h-6 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400 text-sm">{t.addCredit}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Comparison Rows */}
                    <div className="space-y-2">
                      {/* Amount */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="col-span-1 text-gray-600 dark:text-gray-400 font-medium">
                          {t.amount}
                        </div>
                        {credits.map((credit: Credit) => (
                          <div key={`amount-${credit.id}`} className="col-span-1 p-4 bg-white dark:bg-gray-700 rounded-xl">
                            <span className="text-[#09121F] dark:text-white font-bold">
                              {credit.min_amount_formatted} - {credit.max_amount_formatted}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Interest Rate */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="col-span-1 text-gray-600 dark:text-gray-400 font-medium">
                          {t.interestRate}
                        </div>
                        {credits.map((credit: Credit) => (
                          <div key={`rate-${credit.id}`} className="col-span-1 p-4 bg-white dark:bg-gray-700 rounded-xl">
                            <span className="text-[#FF6021] font-bold text-xl">
                              {credit.interest_rate_formatted}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Term */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="col-span-1 text-gray-600 dark:text-gray-400 font-medium">
                          {t.term}
                        </div>
                        {credits.map((credit: Credit) => (
                          <div key={`term-${credit.id}`} className="col-span-1 p-4 bg-white dark:bg-gray-700 rounded-xl">
                            <span className="text-[#09121F] dark:text-white">
                              {credit.min_term_months} - {credit.max_term_months} {t.month}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Monthly Payment */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="col-span-1 text-gray-600 dark:text-gray-400 font-medium">
                          {t.monthlyPayment}
                        </div>
                        {credits.map((credit: Credit) => (
                          <div key={`payment-${credit.id}`} className="col-span-1 p-4 bg-white dark:bg-gray-700 rounded-xl">
                            <span className="text-[#09121F] dark:text-white font-bold">
                              ~{credit.monthly_payment} {t.azn}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Commission */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="col-span-1 text-gray-600 dark:text-gray-400 font-medium">
                          {t.commission}
                        </div>
                        {credits.map((credit: Credit) => (
                          <div key={`commission-${credit.id}`} className="col-span-1 p-4 bg-white dark:bg-gray-700 rounded-xl">
                            <span className="text-[#09121F] dark:text-white">
                              {credit.commission_rate || 0}%
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Guarantor */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="col-span-1 text-gray-600 dark:text-gray-400 font-medium">
                          {t.guarantor}
                        </div>
                        {credits.map((credit: Credit) => (
                          <div key={`guarantor-${credit.id}`} className="col-span-1 p-4 bg-white dark:bg-gray-700 rounded-xl">
                            <div className="flex items-center gap-2">
                              {credit.guarantor.toLowerCase().includes('tələb olunmur') || 
                               credit.guarantor.toLowerCase().includes('not required') ? (
                                <>
                                  <X className="w-4 h-4 text-red-500" />
                                  <span className="text-gray-600 dark:text-gray-400 text-sm">{t.notRequired}</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 text-green-500" />
                                  <span className="text-gray-600 dark:text-gray-400 text-sm">{t.required}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Collateral */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="col-span-1 text-gray-600 dark:text-gray-400 font-medium">
                          {t.collateral}
                        </div>
                        {credits.map((credit: Credit) => (
                          <div key={`collateral-${credit.id}`} className="col-span-1 p-4 bg-white dark:bg-gray-700 rounded-xl">
                            <div className="flex items-center gap-2">
                              {credit.collateral.toLowerCase().includes('tələb olunmur') || 
                               credit.collateral.toLowerCase().includes('not required') ? (
                                <>
                                  <X className="w-4 h-4 text-red-500" />
                                  <span className="text-gray-600 dark:text-gray-400 text-sm">{t.notRequired}</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 text-green-500" />
                                  <span className="text-gray-600 dark:text-gray-400 text-sm">{credit.collateral}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Credit Type */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="col-span-1 text-gray-600 dark:text-gray-400 font-medium">
                          {t.creditType}
                        </div>
                        {credits.map((credit: Credit) => (
                          <div key={`type-${credit.id}`} className="col-span-1 p-4 bg-white dark:bg-gray-700 rounded-xl">
                            <span className="text-[#09121F] dark:text-white">
                              {credit.credit_type}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Apply Buttons */}
                      <div className="grid grid-cols-5 gap-4 items-center pt-4">
                        <div className="col-span-1"></div>
                        {credits.map((credit: Credit) => (
                          <div key={`apply-${credit.id}`} className="col-span-1">
                            <Link
                              href={`/${locale}/credits/${credit.slug}`}
                              className="block w-full text-center py-3 px-4 bg-[#FF6021] hover:bg-[#E54500] text-white font-bold rounded-xl transition-colors"
                            >
                              {t.applyNow}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Credit Selector Modal */}
            {showSelector && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[#09121F] dark:text-white">{t.selectToCompare}</h2>
                    <button
                      onClick={() => setShowSelector(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {Array.isArray(allCreditsData?.credits?.data) && allCreditsData.credits.data.map((credit: any) => (
                      <button
                        key={credit.id}
                        onClick={() => addCredit(credit.id)}
                        disabled={selectedCredits.includes(credit.id)}
                        className={`w-full p-4 text-left rounded-xl border transition-all ${
                          selectedCredits.includes(credit.id)
                            ? 'bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-900 hover:border-[#FF6021] hover:shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-[#09121F] dark:text-white">{credit.credit_name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{credit.bank_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#FF6021]">{credit.interest_rate_formatted}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{credit.credit_amount_formatted}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default CompareClient;