import { Metadata } from 'next';
import Link from 'next/link';
import CompaniesCatalog from '../companies-catalog';
import { ChevronRight } from 'lucide-react';
import apiClient from '@/lib/api/client';

type Props = {
  params: Promise<{ lang: string; type: string }>;
};

async function getCompanyTypeInfo(type: string, locale: string) {
  try {
    const response = await apiClient.get(`/${locale}/company-types/hierarchical`);
    const types = response.data?.data || [];

    // Find the parent type directly using the provided slug
    const parentType = types.find((t: any) => t.slug === type);
    return parentType || null;
  } catch (error) {
    console.error("Error fetching company type info:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, type } = await params;
  const locale = lang || 'az';
  
  // Type titles mapping (Azerbaijani slugs only)
  const typeTitles = {
    banklar: { az: 'Banklar', en: 'Banks', ru: 'Банки' },
    sigorta: { az: 'Sığorta şirkətləri', en: 'Insurance Companies', ru: 'Страховые компании' },
    'kredit-teskilatlari': { az: 'Kredit təşkilatları', en: 'Credit Organizations', ru: 'Кредитные организации' },
    investisiya: { az: 'İnvestisiya şirkətləri', en: 'Investment Companies', ru: 'Инвестиционные компании' },
    lizinq: { az: 'Lizinq şirkətləri', en: 'Leasing Companies', ru: 'Лизинговые компании' },
    'odenis-sistemleri': { az: 'Ödəniş sistemləri', en: 'Payment Systems', ru: 'Платежные системы' }
  };
  
  const typeTitle = typeTitles[type as keyof typeof typeTitles]?.[locale] || type;
  
  const titles = {
    az: `${typeTitle} - Şirkətlər | Kredit.az`,
    en: `${typeTitle} - Companies | Kredit.az`,
    ru: `${typeTitle} - Компании | Kredit.az`
  };
  
  const descriptions = {
    az: `Azərbaycanda fəaliyyət göstərən ${typeTitle.toLowerCase()}`,
    en: `${typeTitle} operating in Azerbaijan`,
    ru: `${typeTitle} работающие в Азербайджане`
  };
  
  return {
    title: titles[locale as keyof typeof titles] || titles.az,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
  };
}

async function fetchCompaniesByType(lang: string, type: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://100.89.150.50:8000/api';
    const res = await fetch(`${apiUrl}/${lang}/sirketler?type=${type}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch companies');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching companies:', error);
    return { data: [], pagination: null };
  }
}

export default async function CompanyTypePage({ 
  params 
}: Props) {
  const { lang, type } = await params;
  const companiesData = await fetchCompaniesByType(lang, type);
  const typeInfo = await getCompanyTypeInfo(type, lang);
  
  // If this type has subcategories, show them instead of companies
  if (typeInfo?.children && typeInfo.children.length > 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {typeInfo.name}
        </h1>
        
        {typeInfo.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {typeInfo.description}
          </p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {typeInfo.children.map((subtype: any) => (
            <Link
              key={subtype.id}
              href={`/${lang}/sirketler/${type}/${subtype.slug}`}
              className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-orange transition-colors">
                    {subtype.name}
                  </h3>
                  {subtype.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {subtype.description}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-orange transition-colors flex-shrink-0 ml-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  
  // Otherwise show companies as before
  return (
    <CompaniesCatalog 
      companies={companiesData.data} 
      pagination={companiesData.pagination}
      lang={lang}
      filterType={type}
    />
  );
}