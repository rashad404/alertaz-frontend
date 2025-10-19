'use client';

import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Phone, MapPin, Mail, Globe, Share2, ChevronRight, Clock, Building2 } from 'lucide-react';
import { BankLogo } from '@/components/ui/bank-logo';
import { parseTranslatedContent } from '@/lib/utils/translation';

interface CompanyData {
  id: number;
  name: any;
  slug?: string;
  short_name?: any;
  logo?: string;
  about?: string;
  phones?: any;
  addresses?: any;
  site?: string;
  email?: string;
  establishment_date?: string;
  requisites?: any;
  business_hours?: any;
  company_type?: any;
}

interface CompanyDetailClientProps {
  params: { lang: string; slug: string };
  companyData: CompanyData;
  companyType: string;
}

const CompanyDetailClient = ({ params, companyData, companyType }: CompanyDetailClientProps) => {
  const locale = params.lang || 'az';

  // Translations for different company types
  const getTranslations = () => {
    const baseTranslations = {
      az: {
        breadcrumbHome: 'Ana səhifə',
        fullName: 'Tam adı',
        shortName: 'Qısa adı',
        establishmentDate: 'Yaranma tarixi',
        voen: 'VÖEN',
        license: 'Lisenziya',
        services: 'Xidmətlər',
        branches: 'Filiallar',
        workingHours: 'İş saatları',
        share: 'Paylaş',
        website: 'Veb sayt',
        creditOffers: 'Kredit təklifləri',
        viewAllCredits: 'Bütün kreditlərə bax',
      },
      en: {
        breadcrumbHome: 'Home',
        fullName: 'Full name',
        shortName: 'Short name',
        establishmentDate: 'Establishment date',
        voen: 'VOEN',
        license: 'License',
        services: 'Services',
        branches: 'Branches',
        workingHours: 'Working hours',
        share: 'Share',
        website: 'Website',
        creditOffers: 'Credit offers',
        viewAllCredits: 'View all credits',
      },
      ru: {
        breadcrumbHome: 'Главная',
        fullName: 'Полное название',
        shortName: 'Краткое название',
        establishmentDate: 'Дата основания',
        voen: 'VÖEN',
        license: 'Лицензия',
        services: 'Услуги',
        branches: 'Филиалы',
        workingHours: 'Рабочие часы',
        share: 'Поделиться',
        website: 'Веб-сайт',
        creditOffers: 'Кредитные предложения',
        viewAllCredits: 'Посмотреть все кредиты',
      }
    };

    // Add company type specific translations
    if (companyType === 'credit-organizations') {
      baseTranslations.az.breadcrumbCompanies = 'Kredit təşkilatları';
      baseTranslations.az.aboutCompany = 'Təşkilat haqqında';
      baseTranslations.en.breadcrumbCompanies = 'Credit organizations';
      baseTranslations.en.aboutCompany = 'About organization';
      baseTranslations.ru.breadcrumbCompanies = 'Кредитные организации';
      baseTranslations.ru.aboutCompany = 'Об организации';
    } else if (companyType === 'insurance-companies') {
      baseTranslations.az.breadcrumbCompanies = 'Sığorta şirkətləri';
      baseTranslations.az.aboutCompany = 'Şirkət haqqında';
      baseTranslations.en.breadcrumbCompanies = 'Insurance companies';
      baseTranslations.en.aboutCompany = 'About company';
      baseTranslations.ru.breadcrumbCompanies = 'Страховые компании';
      baseTranslations.ru.aboutCompany = 'О компании';
    }

    return baseTranslations;
  };

  const translations = getTranslations();
  const t = translations[locale as keyof typeof translations] || translations.az;

  const companyName = parseTranslatedContent(companyData.name, locale);

  // Parse requisites
  let requisites = {};
  try {
    requisites = typeof companyData.requisites === 'string' 
      ? JSON.parse(companyData.requisites) 
      : (companyData.requisites || {});
  } catch {
    requisites = {};
  }

  // Parse business hours
  let businessHours: any = {};
  try {
    if (typeof companyData.business_hours === 'string') {
      businessHours = JSON.parse(companyData.business_hours);
    } else if (Array.isArray(companyData.business_hours) && companyData.business_hours.length > 0) {
      // If it's an array, try to parse the first element
      const firstElement = companyData.business_hours[0];
      if (typeof firstElement === 'string') {
        businessHours = JSON.parse(firstElement);
      } else if (typeof firstElement === 'object') {
        businessHours = firstElement;
      }
    } else if (companyData.business_hours && typeof companyData.business_hours === 'object') {
      businessHours = companyData.business_hours;
    }
  } catch (e) {
    console.error('Error parsing business hours:', e);
    businessHours = {};
  }

  // Parse phones
  let phones = [];
  try {
    phones = typeof companyData.phones === 'string' 
      ? JSON.parse(companyData.phones) 
      : (companyData.phones || []);
  } catch {
    phones = [];
  }

  // Parse addresses
  let addresses = [];
  try {
    addresses = typeof companyData.addresses === 'string' 
      ? JSON.parse(companyData.addresses) 
      : (companyData.addresses || []);
  } catch {
    addresses = [];
  }

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': companyType === 'insurance-companies' ? 'InsuranceAgency' : 'FinancialService',
    name: companyName,
    url: companyData.site,
    telephone: phones?.[0],
    email: companyData.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: addresses?.[0]?.address || addresses?.[0],
      addressCountry: 'AZ'
    }
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
        name: t.breadcrumbCompanies,
        item: `https://kredit.az/${locale}/${companyType}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: companyName,
        item: `https://kredit.az/${locale}/${companyType}/${companyData.slug}`
      }
    ]
  };

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      <Script id="breadcrumb-schema" type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </Script>

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Breadcrumb */}
        <nav className="flex justify-center px-4 sm:px-8 lg:px-36 py-6">
          <div className="w-full max-w-5xl">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Link href={`/${locale}`} className="hover:text-[#FF6021] transition-colors">
                {t.breadcrumbHome}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/${locale}/${companyType}`} className="hover:text-[#FF6021] transition-colors">
                {t.breadcrumbCompanies}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white">{companyName}</span>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex justify-center px-4 sm:px-8 lg:px-36 pb-16">
          <div className="w-full max-w-5xl">
            {/* Header Section */}
            <div className="bg-[#F6F6F6] dark:bg-gray-800 rounded-2xl p-8 mb-8">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-6">
                  <BankLogo 
                    logo={companyData.logo}
                    name={companyName}
                    shortName={companyData.short_name}
                    size="large"
                  />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {companyName}
                    </h1>
                    {companyData.short_name && (
                      <p className="text-gray-600 dark:text-gray-400">{companyData.short_name}</p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => navigator.share({ title: companyName, url: window.location.href })}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {phones.length > 0 && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#FF6021]" />
                    <div>
                      {phones.map((phone: string, index: number) => (
                        <a key={index} href={`tel:${phone}`} className="block text-gray-900 dark:text-white hover:text-[#FF6021]">
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                {companyData.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#FF6021]" />
                    <a href={`mailto:${companyData.email}`} className="text-gray-900 dark:text-white hover:text-[#FF6021]">
                      {companyData.email}
                    </a>
                  </div>
                )}
                
                {companyData.site && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[#FF6021]" />
                    <a href={companyData.site} target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-white hover:text-[#FF6021]">
                      {t.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                {companyData.about && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {t.aboutCompany}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {companyData.about}
                    </p>
                  </div>
                )}

                {/* Company Details */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {locale === 'az' ? 'Rekvizitlər' : locale === 'ru' ? 'Реквизиты' : 'Details'}
                  </h2>
                  <dl className="space-y-3">
                    {companyData.establishment_date && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600 dark:text-gray-400">{t.establishmentDate}:</dt>
                        <dd className="text-gray-900 dark:text-white font-medium">
                          {new Date(companyData.establishment_date).getFullYear()}
                        </dd>
                      </div>
                    )}
                    {requisites.voen && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600 dark:text-gray-400">{t.voen}:</dt>
                        <dd className="text-gray-900 dark:text-white font-medium">{requisites.voen}</dd>
                      </div>
                    )}
                    {requisites.license && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600 dark:text-gray-400">{t.license}:</dt>
                        <dd className="text-gray-900 dark:text-white font-medium">{requisites.license}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Addresses */}
                {addresses.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {t.branches}
                    </h2>
                    <div className="space-y-3">
                      {addresses.map((address: any, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-[#FF6021] mt-0.5" />
                          <div>
                            <p className="text-gray-900 dark:text-white">
                              {typeof address === 'string' ? address : address.address}
                            </p>
                            {address.type && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {address.type === 'head_office' 
                                  ? (locale === 'az' ? 'Baş ofis' : locale === 'ru' ? 'Главный офис' : 'Head office')
                                  : address.type}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Working Hours */}
                {businessHours && Object.keys(businessHours).length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#FF6021]" />
                      {t.workingHours}
                    </h3>
                    <dl className="space-y-2 text-sm">
                      {Object.entries(businessHours).map(([day, hours]) => {
                        // Translate day names
                        const dayTranslations: any = {
                          az: {
                            monday: 'Bazar ertəsi',
                            tuesday: 'Çərşənbə axşamı',
                            wednesday: 'Çərşənbə',
                            thursday: 'Cümə axşamı',
                            friday: 'Cümə',
                            saturday: 'Şənbə',
                            sunday: 'Bazar'
                          },
                          en: {
                            monday: 'Monday',
                            tuesday: 'Tuesday',
                            wednesday: 'Wednesday',
                            thursday: 'Thursday',
                            friday: 'Friday',
                            saturday: 'Saturday',
                            sunday: 'Sunday'
                          },
                          ru: {
                            monday: 'Понедельник',
                            tuesday: 'Вторник',
                            wednesday: 'Среда',
                            thursday: 'Четверг',
                            friday: 'Пятница',
                            saturday: 'Суббота',
                            sunday: 'Воскресенье'
                          }
                        };
                        
                        const translatedDay = dayTranslations[locale]?.[day.toLowerCase()] || day;
                        
                        // Format hours properly
                        let formattedHours = '';
                        if (typeof hours === 'string') {
                          formattedHours = hours;
                        } else if (typeof hours === 'object' && hours !== null) {
                          // If hours is an object, convert it to string
                          formattedHours = JSON.stringify(hours);
                        } else {
                          formattedHours = String(hours);
                        }
                        
                        return (
                          <div key={day} className="flex justify-between">
                            <dt className="text-gray-600 dark:text-gray-400">{translatedDay}:</dt>
                            <dd className="text-gray-900 dark:text-white">{formattedHours}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                ) : null}

                {/* Credit Offers CTA */}
                {companyType === 'credit-organizations' && (
                  <div className="bg-gradient-to-br from-[#1DC37D] to-[#17A366] rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {t.creditOffers}
                    </h3>
                    <p className="text-white/90 text-sm mb-4">
                      {locale === 'az' 
                        ? 'Bu təşkilatın kredit təkliflərini kəşf edin'
                        : locale === 'ru'
                        ? 'Откройте для себя кредитные предложения этой организации'
                        : 'Discover credit offers from this organization'}
                    </p>
                    <Link 
                      href={`/${locale}/credits?company=${companyData.id}`}
                      className="inline-flex items-center text-white font-medium hover:translate-x-1 transition-transform"
                    >
                      {t.viewAllCredits} →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default CompanyDetailClient;