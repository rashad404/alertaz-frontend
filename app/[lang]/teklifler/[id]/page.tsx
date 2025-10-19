import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OfferDetailClient from './OfferDetailClient';
import axios from 'axios';
import { getTranslation } from '@/lib/utils';

type Props = {
  params: Promise<{ lang: string; id: string }>;
};

async function getOfferData(id: string, lang: string) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/${lang}/offers/${id}`
    );
    return response.data.offer;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params;
  const locale = lang || 'az';
  
  const offer = await getOfferData(id, locale);
  
  if (!offer) {
    return {
      title: 'Təklif tapılmadı | Kredit.az',
      description: 'Bu kredit təklifi tapılmadı.'
    };
  }
  
  const offerTitle = getTranslation(offer.title, locale);
  const companyName = offer.company ? getTranslation(offer.company.name, locale) : '';
  
  const titles = {
    az: `${offerTitle} - ${companyName} | Kredit.az`,
    en: `${offerTitle} - ${companyName} | Kredit.az`,
    ru: `${offerTitle} - ${companyName} | Kredit.az`
  };
  
  const descriptions = {
    az: `${companyName} tərəfindən ${offerTitle}. Faiz dərəcəsi: ${offer.min_interest_rate || offer.annual_rate_min}%, Maksimum məbləğ: ${offer.max_amount || offer.amount_max} AZN`,
    en: `${offerTitle} from ${companyName}. Interest rate: ${offer.min_interest_rate || offer.annual_rate_min}%, Maximum amount: ${offer.max_amount || offer.amount_max} AZN`,
    ru: `${offerTitle} от ${companyName}. Процентная ставка: ${offer.min_interest_rate || offer.annual_rate_min}%, Максимальная сумма: ${offer.max_amount || offer.amount_max} AZN`
  };
  
  return {
    metadataBase: new URL('https://kredit.az'),
    title: titles[locale as keyof typeof titles] || titles.az,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
    keywords: `${offerTitle}, ${companyName}, kredit, bank krediti, faiz dərəcəsi`,
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.az,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.az,
      type: 'website',
      locale: locale === 'az' ? 'az_AZ' : locale === 'ru' ? 'ru_RU' : 'en_US',
      url: `https://kredit.az/${locale}/offers/${id}`,
      siteName: 'Kredit.az',
    },
  };
}

export default async function OfferDetailPage({ params }: Props) {
  const { lang, id } = await params;
  const offer = await getOfferData(id, lang);
  
  if (!offer) {
    notFound();
  }
  
  return <OfferDetailClient params={{ lang, id }} offerData={offer} />;
}