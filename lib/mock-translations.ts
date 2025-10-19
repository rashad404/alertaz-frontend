// Temporary mock translations until we fix next-intl
export const translations = {
  nav: {
    news: "Xəbərlər",
    banks: "Banklar",
    credits: "Kreditlər",
    insurance: "Sığorta",
    search: "Axtar",
    darkMode: "Qaranlıq rejim",
    comparison: "Müqayisə"
  },
  home: {
    latestNews: "Ən yeni xəbərlər",
    popularOffers: "Populyar təkliflər",
    partnerBanks: "Partnyorluq etdiyimiz banklar",
    moreNews: "Daha çox",
    moreOffers: "Daha çox",
    moreBanks: "Daha çox",
    allNews: "Bütün xəbərlər",
    viewAll: "Hamısı",
    appDownload: {
      title: "Maliyyə yeniliklərdən xəbərdar olmaq üçün Appı yüklə",
      downloadOnAppStore: "App Store-dan yüklə",
      downloadOnGooglePlay: "Google Play-dən yüklə"
    }
  },
  footer: {
    services: "Xidmətlər",
    company: "Şirkət",
    resources: "Resurslar",
    contact: "Əlaqə vasitələrimiz",
    services_items: {
      cashCredits: "Nağd kreditlər",
      creditCards: "Kredit kartları",
      autoCredits: "Avtomobil kreditləri",
      mortgage: "İpoteka",
      businessCredits: "Biznes kreditləri",
      deposits: "Əmanətlər"
    },
    company_items: {
      about: "Haqqımızda",
      contact: "Əlaqə",
      terms: "İstifadəçi sözləşməsi",
      rules: "Qaydalar",
      faq: "FAQ"
    },
    resources_items: {
      blog: "Blog",
      calculator: "Kredit kalkulyatoru",
      education: "Maliyyə təhsili",
      guides: "Bələdçilər"
    },
    newsletter: {
      title: "YENİLİKLƏRƏ ABUNƏ OLUN",
      description: "Maliyyə yeniliklərindən xəbərdar olmaq üçün aylıq bildirişlərə abunə ola bilərsiniz.",
      placeholder: "Mail daxil edin",
      button: "Abunə ol!"
    },
    copyright: "Bütün hüquqları qorunur © 2025 Kredit.az"
  },
  offer: {
    annualRate: "İllik faiz",
    duration: "Müddət",
    monthly: "Aylıq",
    maxCreditLimit: "Maksimum kredit limit",
    month: "Ay",
    currency: "AZN",
    apply: "Müraciət et",
    details: "Ətraflı",
  },
  currency: {
    exchangeRates: "Valyuta məzənnələri",
  }
};

type TranslationKeys = keyof typeof translations;

export function useTranslations(namespace: TranslationKeys) {
  return translations[namespace] || {};
}