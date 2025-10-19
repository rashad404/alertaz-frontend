'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Phone, MapPin, Loader2 } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';
import { BankLogo } from '@/components/ui/bank-logo';
import { parseTranslatedContent } from '@/lib/utils/translation';
import Script from 'next/script';

interface InsuranceCompany {
  id: number;
  name: string;
  short_name: string;
  slug: string;
  logo: string;
  phones: any;
  addresses: any;
  email: string;
  site: string;
}

interface InsuranceCompaniesClientProps {
  params: { lang: string };
}

const InsuranceCompaniesClient = ({ params }: InsuranceCompaniesClientProps) => {
  const locale = params.lang || 'az';
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch insurance companies data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['insurance-companies', locale, debouncedSearch],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/${locale}/company-types/sigorta/sirketler`, {
        params: {
          search: debouncedSearch,
          per_page: 50
        }
      });
      return response.data;
    }
  });

  const companies = data?.data || [];

  // Translations
  const translations = {
    az: {
      title: 'Sığorta Şirkətləri',
      breadcrumbHome: 'Ana səhifə',
      breadcrumbCurrent: 'Sığorta şirkətləri',
      listTitle: 'Sığorta şirkətlərinin siyahısı',
      searchPlaceholder: 'Şirkət axtar...',
      noResults: 'Heç bir şirkət tapılmadı',
      viewDetails: 'Ətraflı',
      loading: 'Yüklənir...',
      error: 'Xəta baş verdi',
      promoTitle1: 'Sığorta müqayisəsi',
      promoDesc1: 'Ən uyğun sığorta təkliflərini tapın',
      promoTitle2: 'Onlayn sığorta',
      promoDesc2: 'Onlayn sığorta müqaviləsi bağlayın'
    },
    en: {
      title: 'Insurance Companies',
      breadcrumbHome: 'Home',
      breadcrumbCurrent: 'Insurance companies',
      listTitle: 'List of insurance companies',
      searchPlaceholder: 'Search company...',
      noResults: 'No companies found',
      viewDetails: 'View details',
      loading: 'Loading...',
      error: 'An error occurred',
      promoTitle1: 'Insurance comparison',
      promoDesc1: 'Find the best insurance offers',
      promoTitle2: 'Online insurance',
      promoDesc2: 'Get insurance online'
    },
    ru: {
      title: 'Страховые компании',
      breadcrumbHome: 'Главная',
      breadcrumbCurrent: 'Страховые компании',
      listTitle: 'Список страховых компаний',
      searchPlaceholder: 'Поиск компании...',
      noResults: 'Компании не найдены',
      viewDetails: 'Подробнее',
      loading: 'Загрузка...',
      error: 'Произошла ошибка',
      promoTitle1: 'Сравнение страховок',
      promoDesc1: 'Найдите лучшие страховые предложения',
      promoTitle2: 'Онлайн страхование',
      promoDesc2: 'Оформите страховку онлайн'
    }
  };
  
  const t = translations[locale as keyof typeof translations] || translations.az;

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: companies.map((company: InsuranceCompany, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'InsuranceAgency',
        name: parseTranslatedContent(company.name, locale),
        url: `https://kredit.az/${locale}/insurance-companies/${company.slug}`,
        telephone: (() => {
          try {
            const phones = typeof company.phones === 'string' ? JSON.parse(company.phones) : company.phones;
            return phones?.[0];
          } catch {
            return null;
          }
        })(),
        address: (() => {
          try {
            const addresses = typeof company.addresses === 'string' ? JSON.parse(company.addresses) : company.addresses;
            return addresses?.[0]?.address || addresses?.[0];
          } catch {
            return null;
          }
        })()
      }
    }))
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
        item: `https://kredit.az/${locale}/insurance-companies`
      }
    ]
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6021]" />
          <span className="text-gray-900 dark:text-white">{t.loading}</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-red-500">{t.error}</div>
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

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <header className="flex justify-center items-center px-4 sm:px-8 lg:px-36 py-9">
          <div className="flex justify-between items-center w-full max-w-5xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#09121F] dark:text-white">
              {t.title}
            </h1>
            <nav className="hidden md:flex items-center gap-1 text-base text-[#09121F] dark:text-gray-400" aria-label="Breadcrumb">
              <Link href={`/${locale}`} className="hover:text-[#FF6021] transition-colors">
                {t.breadcrumbHome}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-[#FF6021] underline">{t.breadcrumbCurrent}</span>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex justify-center px-4 sm:px-8 lg:px-36 pb-16">
          <div className="flex flex-col lg:flex-row w-full max-w-5xl gap-5">
            {/* Company List Section */}
            <div className="flex-1">
              {/* Section Header with Search */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#09121F] dark:text-white">
                  {t.listTitle}
                </h2>
                <div className="flex items-center gap-2">
                  {showSearch && (
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[#09121F] dark:text-white rounded-lg focus:outline-none focus:border-[#FF6021]"
                      autoFocus
                    />
                  )}
                  <button 
                    onClick={() => setShowSearch(!showSearch)}
                    className="w-10 h-10 flex items-center justify-center bg-[#F2F2F7] dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Search"
                  >
                    <Search className="w-6 h-6 text-[#09121F] dark:text-white" />
                  </button>
                </div>
              </div>

              {/* Company Cards */}
              {companies.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {t.noResults}
                </div>
              ) : (
                <div className="space-y-4">
                  {companies.map((company: InsuranceCompany) => (
                    <Link
                      key={company.id}
                      href={`/${locale}/sigorta-sirketleri/${company.slug}`}
                      className="flex items-center gap-4 sm:gap-11 p-4 sm:p-7 bg-[#F6F6F6] dark:bg-gray-800 rounded-2xl shadow-[0px_4px_4px_-1px_rgba(12,12,13,0.1),0px_4px_4px_-1px_rgba(12,12,13,0.05)] hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      {/* Company Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <BankLogo 
                          logo={company.logo}
                          name={parseTranslatedContent(company.name, locale)}
                          shortName={company.short_name}
                        />
                        <div className="flex-1">
                          <div className="text-base font-medium text-[#09121F] dark:text-white">
                            {parseTranslatedContent(company.name, locale)}
                          </div>
                          {company.short_name && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {company.short_name}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {(() => {
                          let phones = [];
                          try {
                            phones = typeof company.phones === 'string' ? JSON.parse(company.phones) : company.phones;
                          } catch {
                            phones = [];
                          }
                          return phones && phones.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-5 h-5 text-[#FF6021]" />
                              <span className="text-xs text-[#09121F] dark:text-gray-300">{phones[0]}</span>
                            </div>
                          );
                        })()}
                        {(() => {
                          let addresses = [];
                          try {
                            addresses = typeof company.addresses === 'string' ? JSON.parse(company.addresses) : company.addresses;
                          } catch {
                            addresses = [];
                          }
                          return addresses && addresses.length > 0 && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-[#FF6021]" />
                              <span className="text-xs text-[#09121F] dark:text-gray-300 line-clamp-1 max-w-[200px]">
                                {addresses[0].address || addresses[0]}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Promotional Cards */}
            <div className="flex flex-col gap-5 lg:w-[304px]">
              {/* Green Card - Insurance Comparison */}
              <Link 
                href={`/${locale}/insurance`}
                className="relative w-full h-[275px] bg-gradient-to-br from-[#1DC37D] to-[#17A366] rounded-xl p-6 overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {t.promoTitle1}
                  </h3>
                  <p className="text-sm text-white/90 leading-relaxed mb-4">
                    {t.promoDesc1}
                  </p>
                  <span className="inline-flex items-center text-white text-sm font-medium group-hover:translate-x-1 transition-transform">
                    {locale === 'az' ? 'Müqayisə et' : locale === 'ru' ? 'Сравнить' : 'Compare'} →
                  </span>
                </div>
                <img 
                  src="/insurance-comparison-illustration.svg" 
                  alt="Insurance comparison"
                  className="absolute bottom-0 right-0 w-[207px] h-[146px] object-contain opacity-90"
                />
              </Link>

              {/* Blue Card - Online Insurance */}
              <Link 
                href={`/${locale}/insurance`}
                className="relative w-full h-[275px] bg-gradient-to-br from-[#0040FF] to-[#0030CC] rounded-xl p-6 overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {t.promoTitle2}
                  </h3>
                  <p className="text-sm text-white/90 leading-relaxed mb-4">
                    {t.promoDesc2}
                  </p>
                  <span className="inline-flex items-center text-white text-sm font-medium group-hover:translate-x-1 transition-transform">
                    {locale === 'az' ? 'Sifariş et' : locale === 'ru' ? 'Заказать' : 'Order now'} →
                  </span>
                </div>
                <img 
                  src="/online-insurance-illustration.svg" 
                  alt="Online insurance"
                  className="absolute bottom-0 right-0 w-[207px] h-[146px] object-contain opacity-90"
                />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default InsuranceCompaniesClient;