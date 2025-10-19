import { Metadata } from "next";
import { DepositsClient } from "./DepositsClient";

interface DepositsPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: DepositsPageProps): Promise<Metadata> {
  const { lang } = await params;
  
  const titles = {
    az: "Depozitlər - Ən Yaxşı Faiz Dərəcələri | Kredit.az",
    en: "Deposits - Best Interest Rates | Kredit.az",
    ru: "Депозиты - Лучшие процентные ставки | Kredit.az"
  };
  
  const descriptions = {
    az: "Azərbaycanın banklarından ən sərfəli depozit təklifləri. Faiz dərəcələrini müqayisə edin.",
    en: "Best deposit offers from Azerbaijan banks. Compare interest rates.",
    ru: "Лучшие депозитные предложения от банков Азербайджана. Сравните процентные ставки."
  };
  
  return {
    title: titles[lang as keyof typeof titles] || titles.az,
    description: descriptions[lang as keyof typeof descriptions] || descriptions.az,
    openGraph: {
      title: titles[lang as keyof typeof titles] || titles.az,
      description: descriptions[lang as keyof typeof descriptions] || descriptions.az,
      type: 'website',
    },
  };
}

export default async function DepositsPage({ params }: DepositsPageProps) {
  const { lang } = await params;
  return <DepositsClient locale={lang} />;
}