'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Globe, Phone, Mail, MapPin, Calendar, ChevronRight } from 'lucide-react';
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
}

export default function CompaniesContent({ companies, pagination, lang }: CompaniesContentProps) {
  const dict = useDictionary();
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // Get unique company types
  const companyTypes = companies.reduce((types: any[], company) => {
    if (company.company_type && !types.find(t => t.slug === company.company_type?.slug)) {
      types.push(company.company_type);
    }
    return types;
  }, []);
  
  // Filter companies by selected type
  const filteredCompanies = selectedType === 'all' 
    ? companies 
    : companies.filter(c => c.company_type?.slug === selectedType);
  
  const getCompanyTypePath = (company: Company) => {
    if (!company.company_type) return '#';
    return `/${lang}/company-types/${company.company_type.slug}/companies/${company.slug}`;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {dict.companies?.title || 'Companies'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {dict.companies?.subtitle || 'Browse all financial institutions and companies'}
          </p>
        </div>
        
        {/* Filter Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {dict.common?.all || 'All'}
            </button>
            {companyTypes.map((type) => (
              <button
                key={type.slug}
                onClick={() => setSelectedType(type.slug)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedType === type.slug
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {parseTranslatedContent(type.title, lang)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Link 
              key={company.id} 
              href={getCompanyTypePath(company)}
              className="group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                {/* Company Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {company.logo ? (
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                          <img
                            src={company.logo}
                            alt={parseTranslatedContent(company.name, lang)}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {parseTranslatedContent(company.name, lang)}
                        </h3>
                        {company.company_type && (
                          <span className="inline-block px-2 py-1 mt-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            {parseTranslatedContent(company.company_type.title, lang)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Company Info */}
                  <div className="space-y-3">
                    {company.about && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {company.about}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      {company.site && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{company.site.replace(/^https?:\/\//, '')}</span>
                        </div>
                      )}
                      
                      {company.phones && company.phones.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{company.phones[0]}</span>
                        </div>
                      )}
                      
                      {company.email && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{company.email}</span>
                        </div>
                      )}
                      
                      {company.addresses && company.addresses.length > 0 && company.addresses[0].address && (
                        <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{company.addresses[0].address}</span>
                        </div>
                      )}
                      
                      {company.establishment_date && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{new Date(company.establishment_date).getFullYear()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* View Details Link */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    <span>{dict.common?.viewDetails || 'View Details'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Empty State */}
        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {dict.common?.noCompaniesFound || 'No companies found'}
            </p>
          </div>
        )}
        
        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    page === pagination.current_page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
  );
}