import { Metadata } from 'next';
import { CryptoList } from '@/components/crypto/crypto-list';

export const metadata: Metadata = {
  title: 'Kriptovalyuta Bazarı | Kredit.az',
  description: 'Azərbaycanda kriptovalyuta qiymətləri, bazar məlumatları və alış-satış təlimatları. Bitcoin, Ethereum və digər kriptovalyutalar haqqında məlumat.',
  keywords: 'kriptovalyuta, bitcoin, ethereum, azn, qiymət, bazar, kripto',
};

interface CryptoPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function CryptoPage({ params }: CryptoPageProps) {
  const { lang } = await params;
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="flex justify-center px-4 sm:px-8 lg:px-36 py-8">
        <div className="w-full max-w-5xl">
          <CryptoList locale={lang} />
        </div>
      </div>
    </div>
  );
}