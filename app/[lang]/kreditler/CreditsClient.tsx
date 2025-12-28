'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, ChevronUp, ChevronDown, GitCompare } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Link } from '@/lib/navigation';
import Script from 'next/script';

interface CreditProduct {
  id: number;
  slug: string;
  credit_name: string;
  credit_amount_formatted: string;
  interest_rate_formatted: string;
  isHighlighted?: boolean;
}

interface Bank {
  bank_name: string;
  credits: CreditProduct[];
  logo?: string;
}

const CreditsClient = ({ params }: { params: { lang: string } }) => {
  const locale = params.lang || 'az';
  const router = useRouter();
  const [expandedBanks, setExpandedBanks] = useState<string[]>(['Kapital Bank']); // First bank expanded by default
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);

  // Fetch credits
  const { data: creditsData, isLoading } = useQuery({
    queryKey: ['credits', locale],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/kreditler`, {
        params: { per_page: 100 } // Get all credits
      });
      return response.data;
    }
  });

  // Group credits by bank
  const bankGroups = React.useMemo(() => {
    if (!creditsData?.credits?.data) return [];
    
    const groups: { [key: string]: Bank } = {};
    
    creditsData.credits.data.forEach((credit: any) => {
      if (!groups[credit.bank_name]) {
        groups[credit.bank_name] = {
          bank_name: credit.bank_name,
          credits: [],
          logo: credit.bank_logo
        };
      }
      groups[credit.bank_name].credits.push(credit);
    });
    
    return Object.values(groups);
  }, [creditsData]);

  const toggleBank = (bankName: string) => {
    setExpandedBanks(prev => 
      prev.includes(bankName) 
        ? prev.filter(name => name !== bankName)
        : [...prev, bankName]
    );
  };

  const toggleCompareSelection = (creditId: number) => {
    setSelectedForCompare(prev => {
      if (prev.includes(creditId)) {
        return prev.filter(id => id !== creditId);
      } else if (prev.length < 4) {
        return [...prev, creditId];
      }
      return prev;
    });
  };

  const goToCompare = () => {
    if (selectedForCompare.length >= 2) {
      router.push(`/credits/compare?ids=${selectedForCompare.join(',')}`);
    }
  };

  // Translations
  const translations = {
    az: {
      title: 'Kreditlər',
      breadcrumbHome: 'Ana səhifə',
      breadcrumbCurrent: 'Kreditlər',
      banksList: 'Bankların siyahisi',
      creditName: 'Kredit adı:',
      maxAmount: 'Maks. məbləğ:',
      minRate: 'Minimal faiz:',
      loading: 'Yüklənir...',
      noCredits: 'Kredit tapılmadı',
      uxDesign: 'UX/UI dizayn',
      designCourse: 'Dizayn dərslərinə\nyazılmağa tələs.',
      compare: 'Müqayisə et',
      compareSelected: 'Seçilənləri müqayisə et',
      selectForCompare: 'Müqayisə üçün seç'
    },
    en: {
      title: 'Credits',
      breadcrumbHome: 'Home',
      breadcrumbCurrent: 'Credits',
      banksList: 'Banks list',
      creditName: 'Credit name:',
      maxAmount: 'Max. amount:',
      minRate: 'Min. rate:',
      loading: 'Loading...',
      noCredits: 'No credits found',
      uxDesign: 'UX/UI design',
      designCourse: 'Hurry up to enroll\nin design courses.',
      compare: 'Compare',
      compareSelected: 'Compare selected',
      selectForCompare: 'Select to compare'
    },
    ru: {
      title: 'Кредиты',
      breadcrumbHome: 'Главная',
      breadcrumbCurrent: 'Кредиты',
      banksList: 'Список банков',
      creditName: 'Название кредита:',
      maxAmount: 'Макс. сумма:',
      minRate: 'Мин. ставка:',
      loading: 'Загрузка...',
      noCredits: 'Кредиты не найдены',
      uxDesign: 'UX/UI дизайн',
      designCourse: 'Спешите записаться\nна курсы дизайна.',
      compare: 'Сравнить',
      compareSelected: 'Сравнить выбранные',
      selectForCompare: 'Выбрать для сравнения'
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.az;

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: bankGroups.flatMap((bank, bankIndex) => 
      bank.credits.map((credit, creditIndex) => ({
        '@type': 'FinancialProduct',
        position: bankIndex * 10 + creditIndex + 1,
        name: credit.credit_name,
        provider: {
          '@type': 'BankOrCreditUnion',
          name: bank.bank_name
        },
        url: `https://kredit.az/credits/${credit.slug}`
      }))
    )
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
        name: t.breadcrumbCurrent,
        item: `https://kredit.az/credits`
      }
    ]
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
          <span className="text-gray-900 dark:text-white">{t.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      <Script id="breadcrumb-schema" type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </Script>

      <main className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header Section */}
        <header className="flex w-full justify-center items-center px-4 sm:px-8 lg:px-36 py-9">
          <div className="flex w-full max-w-5xl justify-between items-center">
            <div className="flex justify-center items-center gap-1">
              <h1 className="text-[#09121F] dark:text-white text-center text-[32px] sm:text-[48px] font-bold leading-[56px]">
                {t.title}
              </h1>
            </div>
            <nav className="hidden md:flex justify-center items-center gap-1" aria-label="Breadcrumb">
              <Link href={"/" className="text-[#09121F] dark:text-gray-300 hover:text-[#FF6021] dark:hover:text-[#FF6021] text-center text-base font-normal leading-6 transition-colors">
                {t.breadcrumbHome}
              </Link>
              <span className="text-gray-600 dark:text-gray-400">&gt;</span>
              <span className="text-[#FF6021] text-center text-base font-normal leading-6 underline">
                {t.breadcrumbCurrent}
              </span>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <section className="flex w-full justify-center px-4 sm:px-8 lg:px-36 py-4">
          <div className="flex w-full max-w-5xl gap-5 flex-col lg:flex-row">
            {/* Left Column - Banks List */}
            <div className="flex flex-col gap-2 flex-1">
              {/* Banks List Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[#09121F] dark:text-white text-center text-[32px] font-bold leading-[56px]">
                  {t.banksList}
                </h2>
                <div className="flex items-center gap-3">
                  {selectedForCompare.length >= 2 && (
                    <button 
                      onClick={goToCompare}
                      className="flex items-center gap-2 px-4 py-2 bg-[#FF6021] hover:bg-[#E54500] text-white font-medium rounded-xl transition-colors"
                    >
                      <GitCompare className="w-5 h-5" />
                      {t.compareSelected} ({selectedForCompare.length})
                    </button>
                  )}
                  <button className="flex w-10 h-10 p-2 justify-center items-center rounded-[32px] bg-[#F2F2F7] dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Search className="w-6 h-6 text-[#09121F] dark:text-white" />
                  </button>
                </div>
              </div>

              {/* Banks List */}
              <div className="flex flex-col gap-6">
                {bankGroups.map((bank, bankIndex) => {
                  const isExpanded = expandedBanks.includes(bank.bank_name);
                  let globalCreditIndex = 0;
                  // Calculate global index for first credit
                  for (let i = 0; i < bankIndex; i++) {
                    globalCreditIndex += bankGroups[i].credits.length;
                  }
                  
                  return (
                    <article key={bank.bank_name} className="flex flex-col gap-2">
                      {isExpanded ? (
                        // Expanded Bank Card
                        <div className="flex flex-col gap-4 p-4 sm:p-7 rounded-2xl border border-[#E6E6E6] dark:border-gray-700 bg-[#F6F6F6] dark:bg-gray-800 shadow-[0px_16px_32px_-4px_rgba(12,12,13,0.1),0px_4px_4px_-4px_rgba(12,12,13,0.05)]">
                          {/* Bank Header - Entire row is clickable */}
                          <button 
                            onClick={() => toggleBank(bank.bank_name)}
                            className="flex justify-between items-center cursor-pointer hover:opacity-80 transition-opacity w-full"
                            aria-label={`Collapse ${bank.bank_name}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-xl bg-[#E6E6E6] dark:bg-gray-700 flex items-center justify-center">
                                <span className="text-lg font-bold text-[#09121F] dark:text-gray-400">
                                  {bank.bank_name.charAt(0)}
                                </span>
                              </div>
                              <span className="text-[#09121F] dark:text-white text-base font-medium leading-5">
                                {bank.bank_name}
                              </span>
                            </div>
                            <div className="flex w-5 h-5 justify-center items-center">
                              <ChevronUp className="w-5 h-5 text-[#09121F] dark:text-white" />
                            </div>
                          </button>

                          {/* Divider */}
                          <div className="w-full h-[1px] bg-black/20 dark:bg-white/20"></div>

                          {/* Credit Products Grid */}
                          <div className="flex flex-col gap-4">
                            {/* Group credits into rows of 2 */}
                            {Array.from({ length: Math.ceil(bank.credits.length / 2) }).map((_, rowIndex) => {
                              const credit1 = bank.credits[rowIndex * 2];
                              const credit2 = bank.credits[rowIndex * 2 + 1];
                              const credit1GlobalIndex = globalCreditIndex + (rowIndex * 2);
                              const credit2GlobalIndex = globalCreditIndex + (rowIndex * 2 + 1);
                              
                              return (
                                <div key={rowIndex} className="flex flex-col sm:flex-row gap-4">
                                  {credit1 && (
                                    <div className="flex-1 relative">
                                      <input
                                        type="checkbox"
                                        checked={selectedForCompare.includes(credit1.id)}
                                        onChange={() => toggleCompareSelection(credit1.id)}
                                        className="absolute top-3 left-3 z-10 w-4 h-4 text-[#FF6021] rounded"
                                        title={t.selectForCompare}
                                      />
                                      <Link 
                                        href={`/credits/${credit1.slug}`}
                                        className="flex flex-col gap-2 p-3 rounded-[12px] transition-all hover:scale-105 bg-[#E9F2EE] border border-[#FF6021] dark:bg-gray-700 dark:border-gray-600 block"
                                      >
                                      <div className="flex justify-between items-center">
                                        <span className="text-[#000000] dark:text-gray-300 font-['DM_Sans'] text-xs font-normal leading-5">
                                          {t.creditName}
                                        </span>
                                        <span className="text-[#000000] dark:text-white font-['DM_Sans'] text-xs font-semibold leading-5 text-right">
                                          {credit1.credit_name}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-[#000000] dark:text-gray-300 font-['DM_Sans'] text-xs font-normal leading-5">
                                          {t.maxAmount}
                                        </span>
                                        <span className="text-[#000000] dark:text-white font-['DM_Sans'] text-xs font-semibold leading-5">
                                          {credit1.credit_amount_formatted}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-[#000000] dark:text-gray-300 font-['DM_Sans'] text-xs font-normal leading-5">
                                          {t.minRate}
                                        </span>
                                        <span className="text-[#000000] dark:text-white font-['DM_Sans'] text-xs font-semibold leading-5">
                                          {credit1.interest_rate_formatted}
                                        </span>
                                      </div>
                                      </Link>
                                    </div>
                                  )}
                                  {credit2 && (
                                    <div className="flex-1 relative">
                                      <input
                                        type="checkbox"
                                        checked={selectedForCompare.includes(credit2.id)}
                                        onChange={() => toggleCompareSelection(credit2.id)}
                                        className="absolute top-3 left-3 z-10 w-4 h-4 text-[#FF6021] rounded"
                                        title={t.selectForCompare}
                                      />
                                      <Link 
                                        href={`/credits/${credit2.slug}`}
                                        className="flex flex-col gap-2 p-3 rounded-[12px] bg-[#E9F2EE] border border-[#FF6021] dark:bg-gray-700 dark:border-gray-600 transition-all hover:scale-105 block"
                                      >
                                      <div className="flex justify-between items-center">
                                        <span className="text-[#000000] dark:text-gray-300 font-['DM_Sans'] text-xs font-normal leading-5">
                                          {t.creditName}
                                        </span>
                                        <span className="text-[#000000] dark:text-white font-['DM_Sans'] text-xs font-semibold leading-5 text-right">
                                          {credit2.credit_name}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-[#000000] dark:text-gray-300 font-['DM_Sans'] text-xs font-normal leading-5">
                                          {t.maxAmount}
                                        </span>
                                        <span className="text-[#000000] dark:text-white font-['DM_Sans'] text-xs font-semibold leading-5">
                                          {credit2.credit_amount_formatted}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-[#000000] dark:text-gray-300 font-['DM_Sans'] text-xs font-normal leading-5">
                                          {t.minRate}
                                        </span>
                                        <span className="text-[#000000] dark:text-white font-['DM_Sans'] text-xs font-semibold leading-5">
                                          {credit2.interest_rate_formatted}
                                        </span>
                                      </div>
                                      </Link>
                                    </div>
                                  )}
                                  {/* Add empty div if only one credit in row */}
                                  {credit1 && !credit2 && <div className="flex-1" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        // Collapsed Bank Card - Entire row is clickable
                        <button 
                          onClick={() => toggleBank(bank.bank_name)}
                          className="flex p-4 sm:p-7 items-center gap-6 rounded-2xl bg-[#F6F6F6] dark:bg-gray-800 hover:bg-[#ECECEC] dark:hover:bg-gray-750 transition-colors cursor-pointer w-full"
                          aria-label={`Expand ${bank.bank_name}`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-xl bg-[#E6E6E6] dark:bg-gray-700 flex items-center justify-center">
                                <span className="text-lg font-bold text-[#09121F] dark:text-gray-400">
                                  {bank.bank_name.charAt(0)}
                                </span>
                              </div>
                              <span className="text-[#09121F] dark:text-white text-base font-medium leading-5">
                                {bank.bank_name}
                              </span>
                            </div>
                            <div className="flex w-5 h-5 justify-center items-center">
                              <ChevronDown className="w-5 h-5 text-[#09121F] dark:text-white" />
                            </div>
                          </div>
                        </button>
                      )}
                    </article>
                  );
                })}

                {bankGroups.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">{t.noCredits}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Promotional Cards */}
            <aside className="flex flex-col justify-start gap-5 w-full lg:w-[304px] lg:sticky lg:top-4 lg:self-start">
              {/* Green Card */}
              <div className="flex w-full h-[275px] p-6 pt-6 pb-0 flex-col gap-2 rounded-xl bg-[#1DC37D] relative overflow-hidden">
                <h3 className="text-white text-[32px] font-bold leading-9">
                  {t.uxDesign}
                </h3>
                <p className="text-white text-base font-medium leading-[26px] whitespace-pre-line">
                  {t.designCourse}
                </p>
                <img 
                  src="/news-placeholder.svg" 
                  alt="UX/UI Design"
                  className="w-[207px] h-[146px] absolute bottom-0 right-0"
                  loading="lazy"
                />
              </div>

              {/* Blue Card */}
              <div className="flex w-full h-[275px] p-6 pt-6 pb-0 flex-col gap-2 rounded-xl bg-[#0040FF] relative overflow-hidden">
                <h3 className="text-white text-[32px] font-bold leading-9">
                  {t.uxDesign}
                </h3>
                <p className="text-white text-base font-medium leading-[26px] whitespace-pre-line">
                  {t.designCourse}
                </p>
                <img 
                  src="/news-placeholder.svg" 
                  alt="UX/UI Design"
                  className="w-[207px] h-[146px] absolute bottom-0 right-0"
                  loading="lazy"
                />
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
};

export default CreditsClient;