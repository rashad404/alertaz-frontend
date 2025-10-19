import { Metadata } from 'next';
import NewsClient from '../../NewsClient';

type Props = {
  params: Promise<{ lang: string; category: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, category } = await params;
  const locale = lang || 'az';
  
  const titles = {
    az: `${category} - Xəbərlər | Kredit.az`,
    en: `${category} - News | Kredit.az`,
    ru: `${category} - Новости | Kredit.az`
  };
  
  const descriptions = {
    az: `${category} kateqoriyasında xəbərlər. Azərbaycanın maliyyə və biznes xəbərləri.`,
    en: `News in ${category} category. Finance and business news from Azerbaijan.`,
    ru: `Новости в категории ${category}. Финансовые и деловые новости Азербайджана.`
  };
  
  return {
    metadataBase: new URL('https://kredit.az'),
    title: titles[locale as keyof typeof titles] || titles.az,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.az,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
      type: 'website',
      locale: locale === 'az' ? 'az_AZ' : locale === 'ru' ? 'ru_RU' : 'en_US',
      url: `https://kredit.az/${locale}/xeberler/kat/${category}`,
      siteName: 'Kredit.az',
    },
    alternates: {
      canonical: `https://kredit.az/${locale}/xeberler/kat/${category}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function NewsCategoryPage({ params, searchParams }: Props) {
  const { lang, category } = await params;
  const { page } = await searchParams;
  return <NewsClient params={{ lang }} initialCategory={category} initialPage={page} />;
}