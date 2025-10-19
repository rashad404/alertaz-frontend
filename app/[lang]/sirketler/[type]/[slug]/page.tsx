import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CompanyDetailWithEntities from '@/components/company/CompanyDetailWithEntities';
import CompanyRelatedNews from '@/components/company/CompanyRelatedNews';
import { CompanyCard } from "@/components/companies/company-card";
import CreditProductsList from '@/components/credits/credit-products-list';
import { Breadcrumb } from "@/components/ui/breadcrumb";
import apiClient from "@/lib/api/client";
import axios from 'axios';

type Props = {
  params: Promise<{ lang: string; type: string; slug: string }>;
};

// Check if this slug is a company type (subcategory) or a company
async function determinePageType(type: string, slug: string, lang: string) {
  try {
    // First, check if this is a subtype
    const response = await apiClient.get(`/${lang}/company-types/hierarchical`);
    const types = response.data?.data || [];

    const parentType = types.find((t: any) => t.slug === type);
    if (parentType?.children) {
      const subtype = parentType.children.find((child: any) => child.slug === slug);
      if (subtype) {
        return { type: 'subtype', data: { parent: parentType, subtype } };
      }
    }
    
    // If not a subtype, check if it's a company
    try {
      const companyResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/${lang}/sirketler/${type}/${slug}`
      );
      return { type: 'company', data: companyResponse.data.data };
    } catch (error) {
      return null;
    }
  } catch (error) {
    console.error("Error determining page type:", error);
    return null;
  }
}

async function getCompaniesBySubtype(type: string, subtype: string, locale: string, subtypeId: number) {
  try {
    // Fetch companies for this subtype
    const response = await apiClient.get(`/${locale}/sirketler`, {
      params: {
        type_id: subtypeId,
        per_page: 50
      }
    });
    
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}

async function getCreditProductsByType(entitySlug: string, locale: string) {
  try {
    const response = await apiClient.get(`/${locale}/entities/credit_loan`, {
      params: {
        per_page: 50
      }
    });
    
    const allEntities = response.data?.data || [];
    
    if (!entitySlug) {
      return allEntities;
    }
    
    // Map Azerbaijani slugs to loan types
    const slugToLoanTypeMapping: Record<string, string[]> = {
      'nagd-kreditler': ['cash'],
      'biznes-kreditler': ['business'],
      'tehsil-kreditler': ['student', 'education'],
      'kredit-xetleri': ['express', 'credit-line'],
      'lombard-kreditler': ['pawn', 'pawnshop'],
      'avtomobil-kreditler': ['auto', 'car'],
      'ipoteka-kreditler': ['mortgage', 'home'],
      'mikrokreditler': ['micro', 'microloan']
    };
    
    const expectedLoanTypes = slugToLoanTypeMapping[entitySlug];
    
    if (expectedLoanTypes) {
      // Filter by exact loan type match
      return allEntities.filter((entity: any) => {
        const loanType = (entity.loan_type || '').toLowerCase();
        return expectedLoanTypes.includes(loanType);
      });
    }
    
    // If no mapping found, try to match based on slug keywords
    // This allows for new types added by admin without code changes
    const slugKeywords = entitySlug.split('-');
    
    return allEntities.filter((entity: any) => {
      const loanType = (entity.loan_type || '').toLowerCase();
      // Check if loan_type contains any of the slug keywords
      return slugKeywords.some(keyword => 
        loanType.includes(keyword)
      );
    });
  } catch (error) {
    console.error("Error fetching credit products:", error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, type, slug } = await params;
  const locale = lang || 'az';
  
  const pageInfo = await determinePageType(type, slug, locale);
  
  if (!pageInfo) {
    return {
      title: 'Səhifə tapılmadı | Kredit.az',
      description: 'Bu səhifə tapılmadı.'
    };
  }
  
  if (pageInfo.type === 'company') {
    const company = pageInfo.data;
    
    // Parse company name if it's JSON
    let companyName = company.name;
    if (typeof company.name === 'object' && company.name !== null) {
      companyName = company.name[locale] || company.name['az'] || company.name;
    }
    
    // Get company type title
    const typeTitle = company.company_type?.title?.[locale] || type;
    
    const titles = {
      az: `${companyName} - ${typeTitle} | Kredit.az`,
      en: `${companyName} - ${typeTitle} | Kredit.az`,
      ru: `${companyName} - ${typeTitle} | Kredit.az`
    };
    
    const descriptions = {
      az: `${companyName} haqqında ətraflı məlumat. Ünvan, telefon, xidmətlər və təkliflər.`,
      en: `Detailed information about ${companyName}. Address, phone, services and offers.`,
      ru: `Подробная информация о ${companyName}. Адрес, телефон, услуги и предложения.`
    };
    
    return {
      metadataBase: new URL('https://kredit.az'),
      title: titles[locale as keyof typeof titles] || titles.az,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
    };
  } else {
    // Subtype metadata
    const { subtype, parent } = pageInfo.data;
    
    const titles = {
      az: `${subtype.name} - ${parent.name} | Kredit.az`,
      en: `${subtype.name} - ${parent.name} | Kredit.az`,
      ru: `${subtype.name} - ${parent.name} | Kredit.az`
    };
    
    const descriptions = {
      az: subtype.description || `${subtype.name} xidmətləri`,
      en: subtype.description || `${subtype.name} services`,
      ru: subtype.description || `${subtype.name} услуги`
    };
    
    return {
      title: titles[locale as keyof typeof titles] || titles.az,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
    };
  }
}

export default async function UnifiedCompanyPage({ params }: Props) {
  const { lang, type, slug } = await params;
  
  const pageInfo = await determinePageType(type, slug, lang);
  
  if (!pageInfo) {
    notFound();
  }
  
  if (pageInfo.type === 'company') {
    // Render company detail page
    const company = pageInfo.data;
    return (
      <>
        <CompanyDetailWithEntities params={{ lang, slug, type }} companyData={company} />
        <div className="flex justify-center px-4 sm:px-8 lg:px-36">
          <div className="w-full max-w-5xl">
            <CompanyRelatedNews companyId={company.id} locale={lang} />
          </div>
        </div>
      </>
    );
  } else {
    // Render subtype listing page
    const { parent, subtype } = pageInfo.data;
    
    const homeLabel = lang === 'az' ? 'Ana səhifə' : lang === 'ru' ? 'Главная' : 'Home';
    const breadcrumbItems = [
      { label: homeLabel, href: `/${lang}` },
      { label: parent.name, href: `/${lang}/sirketler/${type}` },
      { label: subtype.name }
    ];
    
    // Check if this is a credit subtype - if so, show credit products
    if (type === 'credits' || type === 'credit-organizations' || type === 'kredit-teskilatlari') {
      const creditProducts = await getCreditProductsByType(slug, lang);
      
      return (
        <div className="flex justify-center px-4 sm:px-8 lg:px-36">
          <div className="w-full max-w-5xl py-8">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="mt-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {subtype.name}
            </h1>
            
            {subtype.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {subtype.description}
              </p>
            )}
            
            <CreditProductsList 
              products={creditProducts}
              locale={lang}
              creditType={slug}
              creditTypeName={subtype.name}
            />
          </div>
          </div>
        </div>
      );
    } else {
      // For non-credit types, show companies as before
      const companies = await getCompaniesBySubtype(type, slug, lang, subtype.id);
      
      return (
        <div className="flex justify-center px-4 sm:px-8 lg:px-36">
          <div className="w-full max-w-5xl py-8">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="mt-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {subtype.name}
            </h1>
            
            {subtype.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {subtype.description}
              </p>
            )}
            
            {companies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company: any) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    locale={lang}
                    type={type}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No companies found in this category.
                </p>
              </div>
            )}
          </div>
          </div>
        </div>
      );
    }
  }
}