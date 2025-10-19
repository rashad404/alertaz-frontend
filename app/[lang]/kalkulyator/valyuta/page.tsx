import { Metadata } from 'next';
import CurrencyCalculatorClient from './CurrencyCalculatorClient';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang || 'az';
  
  const titles = {
    az: 'Valyuta Kalkulyatoru - Məzənnə hesablayıcı | Kredit.az',
    en: 'Currency Calculator - Exchange rate calculator | Kredit.az',
    ru: 'Валютный калькулятор - Калькулятор курса валют | Kredit.az'
  };
  
  const descriptions = {
    az: 'Valyuta kalkulyatoru ilə müxtəlif valyutalar arasında çevirmə edin. Bank məzənnələri və Mərkəzi Bank məzənnəsi.',
    en: 'Convert between different currencies with our currency calculator. Bank rates and Central Bank rates.',
    ru: 'Конвертируйте между различными валютами с помощью нашего валютного калькулятора. Банковские курсы и курсы ЦБ.'
  };
  
  const keywords = {
    az: 'valyuta kalkulyatoru, məzənnə, valyuta məzənnəsi, dollar məzənnəsi, euro məzənnəsi, bank məzənnələri',
    en: 'currency calculator, exchange rate, currency rate, dollar rate, euro rate, bank rates',
    ru: 'валютный калькулятор, курс валют, курс доллара, курс евро, банковские курсы'
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
      url: `https://kredit.az/${locale}/calculator/currency`,
      siteName: 'Kredit.az',
      images: [
        {
          url: '/og-calculator.jpg',
          width: 1200,
          height: 630,
          alt: 'Kredit.az - Currency Calculator',
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
      canonical: `https://kredit.az/${locale}/calculator/currency`,
      languages: {
        'az': 'https://kredit.az/az/calculator/currency',
        'en': 'https://kredit.az/en/calculator/currency',
        'ru': 'https://kredit.az/ru/calculator/currency',
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

export default async function CurrencyCalculatorPage({ params }: Props) {
  const { lang } = await params;
  return <CurrencyCalculatorClient params={{ lang }} />;
}