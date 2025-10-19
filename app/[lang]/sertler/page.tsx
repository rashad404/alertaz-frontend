import { Metadata } from "next";
import { Locale } from "@/i18n-config";

interface TermsPageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: TermsPageProps): Promise<Metadata> {
  const { lang } = await params;
  
  const titles = {
    az: "İstifadə Şərtləri - Kredit.az",
    en: "Terms of Use - Kredit.az",
    ru: "Условия использования - Kredit.az",
  };

  const descriptions = {
    az: "Kredit.az platformasının istifadə şərtləri və qaydaları",
    en: "Terms of use and conditions for Kredit.az platform",
    ru: "Условия использования платформы Kredit.az",
  };

  return {
    title: titles[lang],
    description: descriptions[lang],
  };
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { lang } = await params;

  const content = {
    az: {
      title: "İstifadə Şərtləri",
      lastUpdated: "Son yenilənmə: 2024-ci il yanvar",
      sections: [
        {
          title: "1. Ümumi Müddəalar",
          content: `Bu istifadə şərtləri Kredit.az platformasından istifadə zamanı sizinlə Kredit.az arasındakı hüquqi münasibətləri tənzimləyir. Platformadan istifadə etməklə siz bu şərtləri qəbul etmiş olursunuz.`
        },
        {
          title: "2. Xidmətlərin Təsviri",
          content: `Kredit.az maliyyə məhsulları haqqında məlumat təqdim edən müqayisə platformasıdır. Biz maliyyə xidmətləri göstərmirik, yalnız müxtəlif maliyyə təşkilatlarının təkliflərini müqayisə etməyə imkan yaradırıq.`
        },
        {
          title: "3. İstifadəçi Öhdəlikləri",
          content: `İstifadəçilər:
• Düzgün və aktual məlumatlar təqdim etməlidir
• Platformanı qanuni məqsədlər üçün istifadə etməlidir
• Üçüncü tərəflərin hüquqlarına hörmət etməlidir
• Avtomatlaşdırılmış sistemlərdən sui-istifadə etməməlidir`
        },
        {
          title: "4. Məxfilik Siyasəti",
          content: `Sizin şəxsi məlumatlarınız məxfilik siyasətimizə uyğun olaraq qorunur və emal edilir. Məlumatlarınız üçüncü tərəflərə sizin razılığınız olmadan ötürülmür.`
        },
        {
          title: "5. Məsuliyyətin Məhdudlaşdırılması",
          content: `Kredit.az təqdim edilən məlumatların dəqiqliyi üçün çalışsa da, maliyyə qərarlarınız üçün məsuliyyət daşımır. Bütün maliyyə qərarları sizin şəxsi məsuliyyətinizdədir.`
        },
        {
          title: "6. Əqli Mülkiyyət",
          content: `Platformada yerləşdirilən bütün məzmun, dizayn və funksionallıq Kredit.az-a məxsusdur və müəllif hüquqları ilə qorunur.`
        },
        {
          title: "7. Dəyişikliklər",
          content: `Kredit.az istifadə şərtlərini istənilən vaxt dəyişdirmək hüququnu özündə saxlayır. Dəyişikliklər platformada dərc edildiyi andan qüvvəyə minir.`
        },
        {
          title: "8. Əlaqə",
          content: `İstifadə şərtləri ilə bağlı suallarınız üçün bizimlə əlaqə saxlaya bilərsiniz:
Email: info@kredit.az
Telefon: +994 12 xxx xx xx`
        }
      ]
    },
    en: {
      title: "Terms of Use",
      lastUpdated: "Last updated: January 2024",
      sections: [
        {
          title: "1. General Provisions",
          content: `These terms of use govern the legal relationship between you and Kredit.az when using the Kredit.az platform. By using the platform, you accept these terms.`
        },
        {
          title: "2. Description of Services",
          content: `Kredit.az is a comparison platform that provides information about financial products. We do not provide financial services, we only enable comparison of offers from various financial institutions.`
        },
        {
          title: "3. User Obligations",
          content: `Users must:
• Provide accurate and current information
• Use the platform for legal purposes
• Respect third-party rights
• Not abuse automated systems`
        },
        {
          title: "4. Privacy Policy",
          content: `Your personal information is protected and processed in accordance with our privacy policy. Your information is not transferred to third parties without your consent.`
        },
        {
          title: "5. Limitation of Liability",
          content: `While Kredit.az strives for accuracy of information provided, it is not responsible for your financial decisions. All financial decisions are your personal responsibility.`
        },
        {
          title: "6. Intellectual Property",
          content: `All content, design, and functionality on the platform belongs to Kredit.az and is protected by copyright.`
        },
        {
          title: "7. Changes",
          content: `Kredit.az reserves the right to change the terms of use at any time. Changes take effect from the moment they are published on the platform.`
        },
        {
          title: "8. Contact",
          content: `For questions about the terms of use, you can contact us:
Email: info@kredit.az
Phone: +994 12 xxx xx xx`
        }
      ]
    },
    ru: {
      title: "Условия использования",
      lastUpdated: "Последнее обновление: Январь 2024",
      sections: [
        {
          title: "1. Общие положения",
          content: `Настоящие условия использования регулируют правовые отношения между вами и Kredit.az при использовании платформы Kredit.az. Используя платформу, вы принимаете эти условия.`
        },
        {
          title: "2. Описание услуг",
          content: `Kredit.az - это платформа сравнения, предоставляющая информацию о финансовых продуктах. Мы не предоставляем финансовые услуги, а только позволяем сравнивать предложения различных финансовых организаций.`
        },
        {
          title: "3. Обязательства пользователей",
          content: `Пользователи должны:
• Предоставлять точную и актуальную информацию
• Использовать платформу в законных целях
• Уважать права третьих лиц
• Не злоупотреблять автоматизированными системами`
        },
        {
          title: "4. Политика конфиденциальности",
          content: `Ваша личная информация защищена и обрабатывается в соответствии с нашей политикой конфиденциальности. Ваша информация не передается третьим лицам без вашего согласия.`
        },
        {
          title: "5. Ограничение ответственности",
          content: `Хотя Kredit.az стремится к точности предоставляемой информации, он не несет ответственности за ваши финансовые решения. Все финансовые решения являются вашей личной ответственностью.`
        },
        {
          title: "6. Интеллектуальная собственность",
          content: `Весь контент, дизайн и функциональность платформы принадлежат Kredit.az и защищены авторским правом.`
        },
        {
          title: "7. Изменения",
          content: `Kredit.az оставляет за собой право изменять условия использования в любое время. Изменения вступают в силу с момента их публикации на платформе.`
        },
        {
          title: "8. Контакты",
          content: `По вопросам об условиях использования вы можете связаться с нами:
Email: info@kredit.az
Телефон: +994 12 xxx xx xx`
        }
      ]
    }
  };

  const t = content[lang];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">{t.lastUpdated}</p>
      
      <div className="space-y-8">
        {t.sections.map((section, index) => (
          <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
            <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}