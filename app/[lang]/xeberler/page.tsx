import { Metadata } from 'next';
import { Suspense } from 'react';
import NewsClient from './NewsClient';
import { Loader2 } from 'lucide-react';

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ category?: string; page?: string; tag?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang || 'az';
  
  const titles = {
    az: 'Xəbərlər - Maliyyə və biznes xəbərləri | Kredit.az',
    en: 'News - Finance and business news | Kredit.az',
    ru: 'Новости - Финансовые и деловые новости | Kredit.az'
  };
  
  const descriptions = {
    az: 'Azərbaycanın maliyyə və biznes xəbərləri. Bank, kredit, sığorta və iqtisadiyyat xəbərləri.',
    en: 'Finance and business news from Azerbaijan. Banking, credit, insurance and economy news.',
    ru: 'Финансовые и деловые новости Азербайджана. Новости банков, кредитов, страхования и экономики.'
  };
  
  const keywords = {
    az: 'xəbərlər, maliyyə xəbərləri, bank xəbərləri, kredit xəbərləri, biznes xəbərləri',
    en: 'news, finance news, bank news, credit news, business news',
    ru: 'новости, финансовые новости, банковские новости, кредитные новости, деловые новости'
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
      url: `https://kredit.az/${locale}/xeberler`,
      siteName: 'Kredit.az',
      images: [
        {
          url: '/og-news.jpg',
          width: 1200,
          height: 630,
          alt: 'Kredit.az - News',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles] || titles.az,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
      images: ['/og-news.jpg'],
    },
    alternates: {
      canonical: `https://kredit.az/${locale}/xeberler`,
      languages: {
        'az': 'https://kredit.az/xeberler',
        'en': 'https://kredit.az/en/xeberler',
        'ru': 'https://kredit.az/ru/xeberler',
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

export default async function NewsPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const sp = await searchParams;

  // Explicitly get each param
  const category = sp?.category;
  const page = sp?.page;
  const tag = sp?.tag;

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6021]" />
          <span className="text-gray-900 dark:text-white">Yüklənir...</span>
        </div>
      </div>
    }>
      <NewsClient params={{ lang }} initialCategory={category} initialPage={page} initialTag={tag} />
    </Suspense>
  );
}