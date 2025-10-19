import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CompanyDetailClient from './CompanyDetailClient';
import axios from 'axios';

type Props = {
  params: Promise<{ lang: string; slug: string }>;
};

async function getCompanyData(slug: string, lang: string) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/${lang}/company-types/sigorta/sirketler/${slug}`
    );
    return response.data.data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = lang || 'az';
  
  const company = await getCompanyData(slug, locale);
  
  if (!company) {
    return {
      title: 'Şirkət tapılmadı | Kredit.az',
      description: 'Bu sığorta şirkəti tapılmadı.'
    };
  }
  
  const companyName = company.name?.[locale] || company.name?.az || company.name;
  
  const titles = {
    az: `${companyName} - Sığorta şirkəti məlumatları | Kredit.az`,
    en: `${companyName} - Insurance company information | Kredit.az`,
    ru: `${companyName} - Информация о страховой компании | Kredit.az`
  };
  
  const descriptions = {
    az: `${companyName} haqqında ətraflı məlumat. Ünvan, telefon, xidmətlər və sığorta məhsulları.`,
    en: `Detailed information about ${companyName}. Address, phone, services and insurance products.`,
    ru: `Подробная информация о ${companyName}. Адрес, телефон, услуги и страховые продукты.`
  };
  
  return {
    metadataBase: new URL('https://kredit.az'),
    title: titles[locale as keyof typeof titles] || titles.az,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
    keywords: `${companyName}, ${company.short_name}, sığorta şirkəti, sığorta, insurance`,
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.az,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
      type: 'website',
      locale: locale === 'az' ? 'az_AZ' : locale === 'ru' ? 'ru_RU' : 'en_US',
      url: `https://kredit.az/${locale}/insurance-companies/${slug}`,
      siteName: 'Kredit.az',
      images: [
        {
          url: company.logo || '/og-company.jpg',
          width: 1200,
          height: 630,
          alt: companyName,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles] || titles.az,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
      images: [company.logo || '/og-company.jpg'],
    },
    alternates: {
      canonical: `https://kredit.az/${locale}/insurance-companies/${slug}`,
      languages: {
        'az': `https://kredit.az/az/insurance-companies/${slug}`,
        'en': `https://kredit.az/en/insurance-companies/${slug}`,
        'ru': `https://kredit.az/ru/insurance-companies/${slug}`,
      }
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function CompanyDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  const company = await getCompanyData(slug, lang);
  
  if (!company) {
    notFound();
  }
  
  return <CompanyDetailClient params={{ lang, slug }} companyData={company} companyType="insurance-companies" />;
}