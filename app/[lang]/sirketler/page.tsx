import { Metadata } from 'next';
import CompaniesCatalog from './companies-catalog';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang || 'az';
  
  const titles = {
    az: 'Şirkətlər - Maliyyə təşkilatları | Kredit.az',
    en: 'Companies - Financial institutions | Kredit.az',
    ru: 'Компании - Финансовые учреждения | Kredit.az'
  };
  
  const descriptions = {
    az: 'Azərbaycanın bütün maliyyə təşkilatları və şirkətləri',
    en: 'All financial institutions and companies in Azerbaijan',
    ru: 'Все финансовые учреждения и компании в Азербайджане'
  };
  
  return {
    title: titles[locale as keyof typeof titles] || titles.az,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
  };
}

async function fetchCompanies(lang: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://100.89.150.50:8000/api';
    const res = await fetch(`${apiUrl}/${lang}/sirketler`, {
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

export default async function CompaniesPage({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}) {
  const { lang } = await params;
  const companiesData = await fetchCompanies(lang);
  
  return (
    <CompaniesCatalog 
      companies={companiesData.data} 
      pagination={companiesData.pagination}
      lang={lang}
    />
  );
}