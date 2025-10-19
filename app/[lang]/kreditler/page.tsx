import { Metadata } from 'next';
import CreditsClient from './CreditsClient';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang || 'az';
  
  const titles = {
    az: 'Kreditlər - Azərbaycanda ən yaxşı kredit təklifləri | Kredit.az',
    en: 'Credits - Best loan offers in Azerbaijan | Kredit.az',
    ru: 'Кредиты - Лучшие кредитные предложения в Азербайджане | Kredit.az'
  };
  
  const descriptions = {
    az: 'Azərbaycanın aparıcı banklarından kredit təklifləri. Nağd, ipoteka, avto və biznes kreditləri. Müqayisə edin və ən uyğun krediti seçin.',
    en: 'Loan offers from leading banks in Azerbaijan. Cash, mortgage, auto and business loans. Compare and choose the best loan.',
    ru: 'Кредитные предложения от ведущих банков Азербайджана. Наличные, ипотека, авто и бизнес кредиты. Сравните и выберите лучший кредит.'
  };
  
  const keywords = {
    az: 'kredit, bank krediti, nağd kredit, ipoteka, avto kredit, biznes kredit, kredit faizi, kredit kalkulyatoru',
    en: 'credit, bank loan, cash loan, mortgage, auto loan, business loan, interest rate, loan calculator',
    ru: 'кредит, банковский кредит, наличный кредит, ипотека, автокредит, бизнес кредит, процентная ставка, кредитный калькулятор'
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
      url: `https://kredit.az/${locale}/credits`,
      siteName: 'Kredit.az',
      images: [
        {
          url: '/og-credits.jpg',
          width: 1200,
          height: 630,
          alt: 'Kredit.az - Credit offers',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles] || titles.az,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
      images: ['/og-credits.jpg'],
    },
    alternates: {
      canonical: `https://kredit.az/${locale}/credits`,
      languages: {
        'az': 'https://kredit.az/az/credits',
        'en': 'https://kredit.az/en/credits',
        'ru': 'https://kredit.az/ru/credits',
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

export default async function CreditsPage({ params }: Props) {
  const { lang } = await params;
  return <CreditsClient params={{ lang }} />;
}