import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CreditDetailClient from '@/app/[lang]/kreditler/[slug]/CreditDetailClient';
import apiClient from '@/lib/api/client';

type Props = {
  params: Promise<{ lang: string; type: string; slug: string; id: string }>;
};

async function getCreditProduct(id: string, locale: string) {
  try {
    // Fetch all credit products and filter by ID since there's no individual endpoint
    const response = await apiClient.get(`/${locale}/entities/credit_loan`);
    const products = response.data?.data || [];
    const product = products.find((p: any) => p.entity_id === parseInt(id));
    return product || null;
  } catch (error) {
    console.error("Error fetching credit product:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params;
  const locale = lang || 'az';
  
  const creditData = await getCreditProduct(id, locale);
  
  if (!creditData) {
    return {
      title: 'Kredit tapılmadı | Kredit.az',
      description: 'Bu kredit məhsulu tapılmadı.'
    };
  }
  
  const creditName = creditData.name || 'Kredit';
  const companyName = creditData.company?.name || '';
  
  const titles = {
    az: `${creditName} - ${companyName} | Kredit.az`,
    en: `${creditName} - ${companyName} | Kredit.az`,
    ru: `${creditName} - ${companyName} | Kredit.az`
  };
  
  const descriptions = {
    az: `${companyName} bankının ${creditName} krediti haqqında ətraflı məlumat. Faiz dərəcəsi, müddət və şərtlər.`,
    en: `Detailed information about ${creditName} from ${companyName}. Interest rate, terms and conditions.`,
    ru: `Подробная информация о кредите ${creditName} от ${companyName}. Процентная ставка, сроки и условия.`
  };
  
  return {
    title: titles[locale as keyof typeof titles] || titles.az,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
  };
}

export default async function CreditDetailPage({ params }: Props) {
  const { lang, id } = await params;
  
  const creditData = await getCreditProduct(id, lang);
  
  if (!creditData) {
    notFound();
  }
  
  // Transform entity data to match CreditDetailClient expectations
  const transformedData = {
    id: creditData.entity_id,
    credit_name: creditData.entity_name,
    bank_name: creditData.company_name,
    bank_id: creditData.company_id,
    slug: creditData.company_slug,
    interest_rate: creditData.interest_rate,
    interest_rate_formatted: `${creditData.interest_rate}%`,
    min_amount: creditData.min_amount,
    max_amount: creditData.max_amount,
    min_amount_formatted: `${creditData.min_amount} AZN`,
    max_amount_formatted: `${creditData.max_amount} AZN`,
    min_term_months: creditData.min_term_months || 12,
    max_term_months: creditData.max_term_months,
    max_term_months_formatted: `${creditData.max_term_months} ay`,
    requirements: creditData.requirements,
    commission_rate: creditData.commission || 0,
    processing_time: creditData.processing_time,
    loan_type: creditData.loan_type,
    description: `${creditData.entity_name} - ${creditData.company_name}`,
    // Add any missing fields with defaults
    bank_phone: '',
    bank_address: '',
    documents_required: [],
    advantages: []
  };
  
  // Use the CreditDetailClient component with the transformed data
  return <CreditDetailClient params={{ lang, slug: id }} creditData={transformedData} />;
}