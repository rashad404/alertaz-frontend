import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CreditDetailClient from './CreditDetailClient';
import axios from 'axios';

type Props = {
  params: Promise<{ lang: string; slug: string }>;
};

async function getCreditData(slug: string, lang: string) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/${lang}/credits/${slug}`
    );
    return response.data.credit;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = lang || 'az';
  
  const credit = await getCreditData(slug, locale);
  
  if (!credit) {
    return {
      title: 'Kredit tapılmadı | Kredit.az',
      description: 'Bu kredit məhsulu tapılmadı.'
    };
  }
  
  const titles = {
    az: `${credit.credit_name} - ${credit.bank_name} | Kredit.az`,
    en: `${credit.credit_name} - ${credit.bank_name} | Kredit.az`,
    ru: `${credit.credit_name} - ${credit.bank_name} | Kredit.az`
  };
  
  const descriptions = {
    az: `${credit.bank_name} bankından ${credit.credit_name}. Kredit məbləği: ${credit.credit_amount_formatted}, Faiz dərəcəsi: ${credit.interest_rate_formatted}. Kredit şərtləri və müraciət.`,
    en: `${credit.credit_name} from ${credit.bank_name}. Loan amount: ${credit.credit_amount_formatted}, Interest rate: ${credit.interest_rate_formatted}. Loan conditions and application.`,
    ru: `${credit.credit_name} от ${credit.bank_name}. Сумма кредита: ${credit.credit_amount_formatted}, Процентная ставка: ${credit.interest_rate_formatted}. Условия кредита и подача заявки.`
  };
  
  return {
    metadataBase: new URL('https://kredit.az'),
    title: titles[locale as keyof typeof titles] || titles.az,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
    keywords: `${credit.credit_name}, ${credit.bank_name}, kredit, bank krediti, ${credit.credit_type}, faiz dərəcəsi`,
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.az,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
      type: 'website',
      locale: locale === 'az' ? 'az_AZ' : locale === 'ru' ? 'ru_RU' : 'en_US',
      url: `https://kredit.az/${locale}/credits/${slug}`,
      siteName: 'Kredit.az',
      images: [
        {
          url: '/og-credit.jpg',
          width: 1200,
          height: 630,
          alt: `${credit.credit_name} - ${credit.bank_name}`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles] || titles.az,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
      images: ['/og-credit.jpg'],
    },
    alternates: {
      canonical: `https://kredit.az/${locale}/credits/${slug}`,
      languages: {
        'az': `https://kredit.az/az/credits/${slug}`,
        'en': `https://kredit.az/en/credits/${slug}`,
        'ru': `https://kredit.az/ru/credits/${slug}`,
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

export default async function CreditDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  const credit = await getCreditData(slug, lang);
  
  if (!credit) {
    notFound();
  }
  
  return <CreditDetailClient params={{ lang, slug }} creditData={credit} />;
}