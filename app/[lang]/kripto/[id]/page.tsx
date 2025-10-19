import { Metadata } from 'next';
import { CoinDetail } from '@/components/crypto/coin-detail';
import { cryptoApi } from '@/lib/api/crypto';

interface CoinPageProps {
  params: Promise<{
    lang: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: CoinPageProps): Promise<Metadata> {
  const { id, lang } = await params;
  
  try {
    const { data } = await cryptoApi.getCoinDetails(id, 'azn', lang);
    
    return {
      title: `${data.name} (${data.symbol.toUpperCase()}) - Kriptovalyuta | Kredit.az`,
      description: `${data.name} qiyməti, bazar məlumatları, qrafiklər və alış-satış təlimatları. Canlı ${data.symbol.toUpperCase()} qrafiki və kalkulyator.`,
      keywords: `${data.name}, ${data.symbol}, kriptovalyuta, qiymət, qrafik, kalkulyator, azn`,
    };
  } catch (error) {
    return {
      title: 'Kriptovalyuta Detalları | Kredit.az',
      description: 'Kriptovalyuta qiyməti və bazar məlumatları',
    };
  }
}

export default async function CoinPage({ params }: CoinPageProps) {
  const { lang, id } = await params;
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="flex justify-center px-4 sm:px-8 lg:px-36 py-8">
        <div className="w-full max-w-5xl">
          <CoinDetail coinId={id} locale={lang} />
        </div>
      </div>
    </div>
  );
}