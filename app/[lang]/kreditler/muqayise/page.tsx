import { Metadata } from 'next';
import { Suspense } from 'react';
import CompareClientNew from './CompareClientNew';

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ ids?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang || 'az';
  
  const titles = {
    az: 'Kreditləri müqayisə et - Ən yaxşı seçimi tap | Kredit.az',
    en: 'Compare Credits - Find the best choice | Kredit.az',
    ru: 'Сравнить кредиты - Найдите лучший выбор | Kredit.az'
  };
  
  const descriptions = {
    az: 'Müxtəlif bankların kredit təkliflərini müqayisə edin. Faiz dərəcələri, şərtlər və ödəniş planlarını yan-yana görün.',
    en: 'Compare credit offers from different banks. View interest rates, terms and payment plans side by side.',
    ru: 'Сравните кредитные предложения от разных банков. Просматривайте процентные ставки, условия и планы платежей рядом.'
  };
  
  return {
    metadataBase: new URL('https://kredit.az'),
    title: titles[locale as keyof typeof titles] || titles.az,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
    keywords: 'kredit müqayisə, bank krediti müqayisəsi, faiz dərəcəsi müqayisə, kredit kalkulyatoru',
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.az,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
      type: 'website',
      locale: locale === 'az' ? 'az_AZ' : locale === 'ru' ? 'ru_RU' : 'en_US',
      url: `https://kredit.az/${locale}/credits/compare`,
      siteName: 'Kredit.az',
      images: [
        {
          url: '/og-compare.jpg',
          width: 1200,
          height: 630,
          alt: 'Kredit.az - Compare Credits',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles] || titles.az,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
      images: ['/og-compare.jpg'],
    },
    alternates: {
      canonical: `https://kredit.az/${locale}/credits/compare`,
      languages: {
        'az': 'https://kredit.az/az/credits/compare',
        'en': 'https://kredit.az/en/credits/compare',
        'ru': 'https://kredit.az/ru/credits/compare',
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

export default async function ComparePage({ params }: Props) {
  const { lang } = await params;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <CompareClientNew params={{ lang }} />
    </Suspense>
  );
}