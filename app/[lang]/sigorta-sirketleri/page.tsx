import { Metadata } from 'next';
import InsuranceCompaniesClient from './InsuranceCompaniesClient';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang || 'az';
  
  const titles = {
    az: 'Sığorta Şirkətləri - Azərbaycanın aparıcı sığorta şirkətləri | Kredit.az',
    en: 'Insurance Companies - Leading insurance companies of Azerbaijan | Kredit.az',
    ru: 'Страховые компании - Ведущие страховые компании Азербайджана | Kredit.az'
  };
  
  const descriptions = {
    az: 'Azərbaycanın bütün sığorta şirkətləri bir yerdə. Sığorta xidmətləri, filiallar və təkliflər haqqında məlumat.',
    en: 'All insurance companies of Azerbaijan in one place. Information about insurance services, branches and offers.',
    ru: 'Все страховые компании Азербайджана в одном месте. Информация о страховых услугах, филиалах и предложениях.'
  };
  
  const keywords = {
    az: 'sığorta şirkətləri, sığorta, avto sığorta, həyat sığorta, əmlak sığorta, kasko',
    en: 'insurance companies, insurance, auto insurance, life insurance, property insurance, casco',
    ru: 'страховые компании, страхование, автострахование, страхование жизни, страхование имущества, каско'
  };
  
  return {
    metadataBase: new URL('https://kredit.az'),
    title: titles[locale as keyof typeof titles] || titles.az,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
    keywords: keywords[locale as keyof typeof keywords] || keywords.az,
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.az,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
      type: 'website',
      locale: locale === 'az' ? 'az_AZ' : locale === 'ru' ? 'ru_RU' : 'en_US',
      url: `https://kredit.az/${locale}/insurance-companies`,
      siteName: 'Kredit.az',
      images: [
        {
          url: '/og-insurance-companies.jpg',
          width: 1200,
          height: 630,
          alt: 'Kredit.az - Insurance Companies',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles] || titles.az,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
      images: ['/og-insurance-companies.jpg'],
    },
    alternates: {
      canonical: `https://kredit.az/${locale}/insurance-companies`,
      languages: {
        'az': 'https://kredit.az/az/insurance-companies',
        'en': 'https://kredit.az/en/insurance-companies',
        'ru': 'https://kredit.az/ru/insurance-companies',
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

export default async function InsuranceCompaniesPage({ params }: Props) {
  const { lang } = await params;
  return <InsuranceCompaniesClient params={{ lang }} />;
}