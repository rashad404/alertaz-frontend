'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Search, 
  ChevronRight,
  Loader2,
  Grid3x3,
  List
} from 'lucide-react';
import { parseTranslatedContent } from '@/lib/utils/translation';
import { useDictionary } from '@/providers/dictionary-provider';

interface Company {
  id: number;
  name: string | { az: string; en: string; ru: string };
  short_name: string;
  slug: string;
  logo: string | null;
  about: string;
  site: string;
  phones: string[];
  addresses: any[];
  email: string;
  establishment_date: string;
  company_type: {
    id: number;
    title: string | { az: string; en: string; ru: string };
    slug: string;
  } | null;
}

interface CompaniesContentProps {
  companies: Company[];
  pagination: any;
  lang: string;
  filterType?: string;
}

export default function CompaniesCatalog({ companies, pagination, lang, filterType }: CompaniesContentProps) {
  const dict = useDictionary();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Translations
  const getTitle = (filterType: string | undefined, lang: string) => {
    if (!filterType) {
      return { az: 'Şirkətlər', en: 'Companies', ru: 'Компании' }[lang] || 'Şirkətlər';
    }
    
    // Map of known types with translations
    const typeTitles: Record<string, Record<string, string>> = {
      'banklar': { az: 'Banklar', en: 'Banks', ru: 'Банки' },
      'sigorta': { az: 'Sığorta şirkətləri', en: 'Insurance Companies', ru: 'Страховые компании' },
      'kredit-teskilatlari': { az: 'Kredit təşkilatları', en: 'Credit Organizations', ru: 'Кредитные организации' },
      'investisiya': { az: 'İnvestisiya şirkətləri', en: 'Investment Companies', ru: 'Инвестиционные компании' },
      'lizinq': { az: 'Lizinq şirkətləri', en: 'Leasing Companies', ru: 'Лизинговые компании' },
      'odenis-sistemleri': { az: 'Ödəniş sistemləri', en: 'Payment Systems', ru: 'Платежные системы' }
    };
    
    // Return the translation if exists, otherwise format the filterType as title
    if (typeTitles[filterType]) {
      return typeTitles[filterType][lang] || typeTitles[filterType]['en'] || filterType;
    }
    
    // For unknown types, format the slug to title case
    const formatted = filterType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return formatted;
  };

  const getNotFoundMessage = (filterType: string | undefined, lang: string) => {
    const genericMessages = {
      az: 'Heç bir nəticə tapılmadı',
      en: 'No results found',
      ru: 'Ничего не найдено'
    };
    
    if (!filterType) {
      return { az: 'Şirkət tapılmadı', en: 'No companies found', ru: 'Компании не найдены' }[lang] || 'Şirkət tapılmadı';
    }
    
    // Use the title for the not found message
    const typeTitle = getTitle(filterType, lang);
    const notFoundTemplates = {
      az: `${typeTitle} tapılmadı`,
      en: `No ${typeTitle.toLowerCase()} found`,
      ru: `${typeTitle} не найдены`
    };
    
    return notFoundTemplates[lang as keyof typeof notFoundTemplates] || genericMessages[lang as keyof typeof genericMessages] || 'No results found';
  };

  const translations = {
    az: {
      title: getTitle(filterType, 'az'),
      breadcrumbHome: 'Ana səhifə',
      breadcrumbCompanies: 'Şirkətlər',
      breadcrumbCurrent: getTitle(filterType, 'az'),
      allCategories: 'Hamısı',
      search: 'Axtar...',
      noCompaniesFound: getNotFoundMessage(filterType, 'az'),
      viewDetails: 'Ətraflı',
      since: 'İl',
      banks: 'Banklar',
      creditOrgs: 'Kredit təşkilatları',
      insurance: 'Sığorta şirkətləri'
    },
    en: {
      title: getTitle(filterType, 'en'),
      breadcrumbHome: 'Home',
      breadcrumbCompanies: 'Companies',
      breadcrumbCurrent: getTitle(filterType, 'en'),
      allCategories: 'All',
      search: 'Search...',
      noCompaniesFound: getNotFoundMessage(filterType, 'en'),
      viewDetails: 'View details',
      since: 'Since',
      banks: 'Banks',
      creditOrgs: 'Credit organizations',
      insurance: 'Insurance companies'
    },
    ru: {
      title: getTitle(filterType, 'ru'),
      breadcrumbHome: 'Главная',
      breadcrumbCompanies: 'Компании',
      breadcrumbCurrent: getTitle(filterType, 'ru'),
      allCategories: 'Все',
      search: 'Поиск...',
      noCompaniesFound: getNotFoundMessage(filterType, 'ru'),
      viewDetails: 'Подробнее',
      since: 'С',
      banks: 'Банки',
      creditOrgs: 'Кредитные организации',
      insurance: 'Страховые компании'
    }
  };
  
  const t = translations[lang as keyof typeof translations] || translations.az;
  
  // Group companies by type
  const companiesByType = useMemo(() => {
    const grouped = companies.reduce((acc: any, company) => {
      const typeSlug = company.company_type?.slug || 'other';
      if (!acc[typeSlug]) {
        acc[typeSlug] = {
          type: company.company_type,
          companies: [],
          count: 0
        };
      }
      acc[typeSlug].companies.push(company);
      acc[typeSlug].count++;
      return acc;
    }, {});
    return grouped;
  }, [companies]);
  
  // Filter companies based on search and category
  const filteredCompanies = useMemo(() => {
    let filtered = companies;
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.company_type?.slug === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(company => {
        const name = parseTranslatedContent(company.name, lang).toLowerCase();
        const about = (company.about || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        return name.includes(query) || about.includes(query);
      });
    }
    
    return filtered;
  }, [companies, selectedCategory, searchQuery, lang]);
  
  const getCompanyTypePath = (company: Company) => {
    if (!company.company_type) return '#';
    // Map company type to correct route segment using new unified structure
    const typeRouteMap: Record<string, string> = {
      'bank': 'banklar',
      'insurance': 'sigorta',
      'credit_organization': 'kredit-teskilatlari',
      'investment': 'investisiya',
      'leasing': 'lizinq',
      'payment_system': 'odenis-sistemleri'
    };
    const routeSegment = typeRouteMap[company.company_type.slug] || company.company_type.slug;
    return `/${lang}/sirketler/${routeSegment}/${company.slug}`;
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header with title and breadcrumb - matching news page style */}
      <div className="bg-[#F6F6F6] dark:bg-gray-800 py-12">
        <div className="flex justify-center items-center px-4 md:px-36">
          <div className="flex w-full max-w-5xl justify-between items-center">
            <h1 className="text-[#09121F] dark:text-white text-3xl md:text-5xl font-bold">
              {t.title}
            </h1>
            <nav className="hidden md:flex items-center gap-1" aria-label="Breadcrumb">
              <Link href={`/${lang}`} className="text-[#09121F] dark:text-gray-300 hover:text-[#FF6021] transition-colors">
                {t.breadcrumbHome}
              </Link>
              <span className="mx-2 text-gray-600 dark:text-gray-400">›</span>
              {filterType ? (
                <>
                  <Link href={`/${lang}/sirketler`} className="text-[#09121F] dark:text-gray-300 hover:text-[#FF6021] transition-colors">
                    {t.breadcrumbCompanies}
                  </Link>
                  <span className="mx-2 text-gray-600 dark:text-gray-400">›</span>
                  <span className="text-[#FF6021] underline">
                    {t.breadcrumbCurrent}
                  </span>
                </>
              ) : (
                <span className="text-[#FF6021] underline">
                  {t.breadcrumbCurrent}
                </span>
              )}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Main content - matching news page container style */}
      <div className="flex flex-col justify-center items-center gap-8 py-12 px-4 md:px-36">
        <div className="w-full max-w-5xl">
          
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#F6F6F6] dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6021] transition-all"
              />
            </div>
          </div>
          
          {/* Category Filter - simplified design (hide for specific filter types) */}
          {!filterType && (
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#FF6021] text-white'
                    : 'bg-[#F6F6F6] dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {t.allCategories} ({companies.length})
              </button>
              {Object.entries(companiesByType).map(([slug, data]: [string, any]) => (
                <button
                  key={slug}
                  onClick={() => setSelectedCategory(slug)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === slug
                      ? 'bg-[#FF6021] text-white'
                      : 'bg-[#F6F6F6] dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {parseTranslatedContent(data.type?.title || slug, lang)} ({data.count})
                </button>
              ))}
            </div>
          )}
          
          {/* View Mode Toggle */}
          <div className={`flex justify-end ${filterType ? 'mb-8' : '-mt-6 mb-8'}`}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#FF6021] text-white'
                    : 'text-gray-500 hover:bg-[#F6F6F6] dark:hover:bg-gray-800'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#FF6021] text-white'
                    : 'text-gray-500 hover:bg-[#F6F6F6] dark:hover:bg-gray-800'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Companies Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <Link 
                  key={company.id}
                  href={getCompanyTypePath(company)}
                  className="group"
                >
                  <div className="bg-[#F6F6F6] dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all duration-300 h-full">
                    <div className="p-6">
                      {/* Logo */}
                      <div className="flex items-center mb-4">
                        {company.logo ? (
                          <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                            <img
                              src={company.logo}
                              alt={parseTranslatedContent(company.name, lang)}
                              className="w-full h-full object-contain p-2"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-semibold text-[#09121F] dark:text-white group-hover:text-[#FF6021] transition-colors line-clamp-1">
                            {parseTranslatedContent(company.name, lang)}
                          </h3>
                          {company.company_type && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {parseTranslatedContent(company.company_type.title, lang)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Description */}
                      {company.about && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                          {company.about}
                        </p>
                      )}
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between text-sm">
                        {company.establishment_date && (
                          <span className="text-gray-500 dark:text-gray-400">
                            {t.since} {new Date(company.establishment_date).getFullYear()}
                          </span>
                        )}
                        <span className="text-[#FF6021] group-hover:underline flex items-center">
                          {t.viewDetails}
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-4">
              {filteredCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={getCompanyTypePath(company)}
                  className="block group"
                >
                  <div className="bg-[#F6F6F6] dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all duration-300 p-6">
                    <div className="flex items-center gap-6">
                      {/* Logo */}
                      {company.logo ? (
                        <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                          <img
                            src={company.logo}
                            alt={parseTranslatedContent(company.name, lang)}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-[#09121F] dark:text-white group-hover:text-[#FF6021] transition-colors">
                              {parseTranslatedContent(company.name, lang)}
                            </h3>
                            {company.company_type && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {parseTranslatedContent(company.company_type.title, lang)}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#FF6021] group-hover:translate-x-1 transition-all" />
                        </div>
                        
                        {company.about && (
                          <p className="mt-3 text-gray-600 dark:text-gray-400 line-clamp-2">
                            {company.about}
                          </p>
                        )}
                        
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          {company.site && (
                            <span>{company.site.replace(/^https?:\/\//, '')}</span>
                          )}
                          {company.phones && company.phones[0] && (
                            <span>{company.phones[0]}</span>
                          )}
                          {company.establishment_date && (
                            <span>{t.since} {new Date(company.establishment_date).getFullYear()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* Empty State */}
          {filteredCompanies.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t.noCompaniesFound}
              </p>
            </div>
          )}
          
          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      page === pagination.current_page
                        ? 'bg-[#FF6021] text-white'
                        : 'bg-[#F6F6F6] dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}