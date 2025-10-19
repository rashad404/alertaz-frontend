import { Metadata } from 'next';
import CalculatorClient from './CalculatorClient';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang || 'az';
  
  const titles = {
    az: 'Kredit Kalkulyatoru - Aylıq ödənişi hesabla | Kredit.az',
    en: 'Credit Calculator - Calculate monthly payment | Kredit.az',
    ru: 'Кредитный калькулятор - Рассчитать ежемесячный платеж | Kredit.az'
  };
  
  const descriptions = {
    az: 'Kredit kalkulyatoru ilə aylıq ödənişinizi hesablayın. Müxtəlif faiz dərəcələri və müddətlər üçün ödəniş planını görün.',
    en: 'Calculate your monthly payment with credit calculator. See payment plan for different interest rates and terms.',
    ru: 'Рассчитайте ежемесячный платеж с помощью кредитного калькулятора. Посмотрите план платежей для разных процентных ставок и сроков.'
  };
  
  const keywords = {
    az: 'kredit kalkulyatoru, aylıq ödəniş hesabla, faiz hesabla, kredit hesablama',
    en: 'credit calculator, calculate monthly payment, interest calculator, loan calculation',
    ru: 'кредитный калькулятор, рассчитать ежемесячный платеж, калькулятор процентов, расчет кредита'
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
      url: `https://kredit.az/${locale}/credits/calculator`,
      siteName: 'Kredit.az',
      images: [
        {
          url: '/og-calculator.jpg',
          width: 1200,
          height: 630,
          alt: 'Kredit.az - Credit Calculator',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles] || titles.az,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
      images: ['/og-calculator.jpg'],
    },
    alternates: {
      canonical: `https://kredit.az/${locale}/credits/calculator`,
      languages: {
        'az': 'https://kredit.az/az/credits/calculator',
        'en': 'https://kredit.az/en/credits/calculator',
        'ru': 'https://kredit.az/ru/credits/calculator',
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

export default async function CalculatorPage({ params }: Props) {
  const { lang } = await params;
  return <CalculatorClient params={{ lang }} />;
}