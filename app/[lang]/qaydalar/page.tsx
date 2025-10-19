import { Metadata } from "next";
import { Locale } from "@/i18n-config";

interface RulesPageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: RulesPageProps): Promise<Metadata> {
  const { lang } = await params;
  
  const titles = {
    az: "Qaydalar - Kredit.az",
    en: "Rules - Kredit.az",
    ru: "Правила - Kredit.az",
  };

  const descriptions = {
    az: "Kredit.az platformasının istifadə qaydaları və təhlükəsizlik tələbləri",
    en: "Usage rules and security requirements for Kredit.az platform",
    ru: "Правила использования и требования безопасности платформы Kredit.az",
  };

  return {
    title: titles[lang],
    description: descriptions[lang],
  };
}

export default async function RulesPage({ params }: RulesPageProps) {
  const { lang } = await params;

  const content = {
    az: {
      title: "Qaydalar və Təhlükəsizlik",
      subtitle: "Platformadan düzgün və təhlükəsiz istifadə qaydaları",
      sections: [
        {
          title: "Hesab Təhlükəsizliyi",
          icon: "🔐",
          rules: [
            "Şifrənizi heç kimlə paylaşmayın",
            "Güclü və unikal şifrə istifadə edin",
            "İki faktorlu autentifikasiyanı aktivləşdirin",
            "Şübhəli fəaliyyət aşkar etdikdə dərhal bizə bildirin",
            "Hesabınızdan çıxmağı unutmayın (paylaşılan kompüterlərdə)"
          ]
        },
        {
          title: "Məlumat Paylaşımı",
          icon: "📊",
          rules: [
            "Yalnız tələb olunan məlumatları daxil edin",
            "Şəxsi məlumatlarınızı yalnız təhlükəsiz əlaqə kanalları ilə göndərin",
            "Bank məlumatlarınızı platformada saxlamayın",
            "Sosial şəbəkələrdə həssas məlumat paylaşmayın",
            "Fişinq hücumlarından ehtiyatlı olun"
          ]
        },
        {
          title: "Müqayisə və Seçim",
          icon: "⚖️",
          rules: [
            "Təklifləri diqqətlə müqayisə edin",
            "Gizli xərcləri və komissiyaları nəzərə alın",
            "Müqavilə şərtlərini tam oxuyun",
            "Maliyyə qərarlarınızı tələsməyin",
            "Şübhə yarandıqda mütəxəssisə müraciət edin"
          ]
        },
        {
          title: "Kommunikasiya Qaydaları",
          icon: "💬",
          rules: [
            "Hörmətli və peşəkar ünsiyyət qurun",
            "Spam və təkrar mesajlar göndərməyin",
            "Aldadıcı və ya yanlış məlumat yaymayın",
            "Digər istifadəçilərin hüquqlarına hörmət edin",
            "Reklam və promosiya məzmunu paylaşmayın"
          ]
        },
        {
          title: "Texniki Tələblər",
          icon: "💻",
          rules: [
            "Brauzerinizi yeniləyin (ən son versiya)",
            "JavaScript-i aktiv saxlayın",
            "Cookies-ləri qəbul edin (funksionallıq üçün)",
            "Güclü internet bağlantısı təmin edin",
            "Mobil tətbiqdən istifadə edərkən bildirişləri aktiv edin"
          ]
        },
        {
          title: "Qadağan Edilən Fəaliyyətlər",
          icon: "🚫",
          rules: [
            "Avtomatlaşdırılmış botlar və skriptlər istifadə etmək",
            "Platformanın təhlükəsizliyini pozmağa cəhd etmək",
            "Başqalarının hesablarına icazəsiz giriş",
            "Saxta və ya aldadıcı məlumatlar təqdim etmək",
            "Platformanın normal işini pozan hərəkətlər"
          ]
        }
      ],
      footer: {
        title: "Qaydaların Pozulması",
        content: "Bu qaydaların pozulması hesabın məhdudlaşdırılması və ya bağlanması ilə nəticələnə bilər. Ciddi pozuntular hüquq-mühafizə orqanlarına bildiriləcək."
      }
    },
    en: {
      title: "Rules and Security",
      subtitle: "Rules for proper and secure use of the platform",
      sections: [
        {
          title: "Account Security",
          icon: "🔐",
          rules: [
            "Never share your password with anyone",
            "Use a strong and unique password",
            "Enable two-factor authentication",
            "Report suspicious activity immediately",
            "Remember to log out (on shared computers)"
          ]
        },
        {
          title: "Information Sharing",
          icon: "📊",
          rules: [
            "Only enter required information",
            "Send personal data only through secure channels",
            "Don't store banking information on the platform",
            "Don't share sensitive information on social media",
            "Be cautious of phishing attacks"
          ]
        },
        {
          title: "Comparison and Selection",
          icon: "⚖️",
          rules: [
            "Compare offers carefully",
            "Consider hidden costs and commissions",
            "Read contract terms completely",
            "Don't rush your financial decisions",
            "Consult an expert when in doubt"
          ]
        },
        {
          title: "Communication Rules",
          icon: "💬",
          rules: [
            "Maintain respectful and professional communication",
            "Don't send spam or repetitive messages",
            "Don't spread misleading or false information",
            "Respect other users' rights",
            "Don't share advertising or promotional content"
          ]
        },
        {
          title: "Technical Requirements",
          icon: "💻",
          rules: [
            "Update your browser (latest version)",
            "Keep JavaScript enabled",
            "Accept cookies (for functionality)",
            "Ensure strong internet connection",
            "Enable notifications when using mobile app"
          ]
        },
        {
          title: "Prohibited Activities",
          icon: "🚫",
          rules: [
            "Using automated bots and scripts",
            "Attempting to breach platform security",
            "Unauthorized access to others' accounts",
            "Providing fake or misleading information",
            "Actions that disrupt normal platform operation"
          ]
        }
      ],
      footer: {
        title: "Violation of Rules",
        content: "Violation of these rules may result in account restriction or closure. Serious violations will be reported to law enforcement authorities."
      }
    },
    ru: {
      title: "Правила и безопасность",
      subtitle: "Правила правильного и безопасного использования платформы",
      sections: [
        {
          title: "Безопасность аккаунта",
          icon: "🔐",
          rules: [
            "Никогда не делитесь своим паролем",
            "Используйте сильный и уникальный пароль",
            "Включите двухфакторную аутентификацию",
            "Немедленно сообщайте о подозрительной активности",
            "Не забывайте выходить из системы (на общих компьютерах)"
          ]
        },
        {
          title: "Обмен информацией",
          icon: "📊",
          rules: [
            "Вводите только необходимую информацию",
            "Отправляйте личные данные только по защищенным каналам",
            "Не храните банковскую информацию на платформе",
            "Не делитесь конфиденциальной информацией в соцсетях",
            "Будьте осторожны с фишинговыми атаками"
          ]
        },
        {
          title: "Сравнение и выбор",
          icon: "⚖️",
          rules: [
            "Внимательно сравнивайте предложения",
            "Учитывайте скрытые расходы и комиссии",
            "Полностью читайте условия договора",
            "Не спешите с финансовыми решениями",
            "При сомнениях консультируйтесь со специалистом"
          ]
        },
        {
          title: "Правила общения",
          icon: "💬",
          rules: [
            "Поддерживайте уважительное и профессиональное общение",
            "Не отправляйте спам или повторяющиеся сообщения",
            "Не распространяйте вводящую в заблуждение информацию",
            "Уважайте права других пользователей",
            "Не размещайте рекламный или промо-контент"
          ]
        },
        {
          title: "Технические требования",
          icon: "💻",
          rules: [
            "Обновите браузер (последняя версия)",
            "Держите JavaScript включенным",
            "Принимайте cookies (для функциональности)",
            "Обеспечьте стабильное интернет-соединение",
            "Включите уведомления при использовании мобильного приложения"
          ]
        },
        {
          title: "Запрещенная деятельность",
          icon: "🚫",
          rules: [
            "Использование автоматизированных ботов и скриптов",
            "Попытки взлома безопасности платформы",
            "Несанкционированный доступ к чужим аккаунтам",
            "Предоставление поддельной или вводящей в заблуждение информации",
            "Действия, нарушающие нормальную работу платформы"
          ]
        }
      ],
      footer: {
        title: "Нарушение правил",
        content: "Нарушение этих правил может привести к ограничению или закрытию аккаунта. О серьезных нарушениях будет сообщено в правоохранительные органы."
      }
    }
  };

  const t = content[lang];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">{t.subtitle}</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {t.sections.map((section, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">{section.icon}</span>
              <h2 className="text-xl font-semibold">{section.title}</h2>
            </div>
            <ul className="space-y-2">
              {section.rules.map((rule, ruleIndex) => (
                <li key={ruleIndex} className="flex items-start">
                  <span className="text-brand-orange mr-2 mt-1">✓</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-3">
          ⚠️ {t.footer.title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          {t.footer.content}
        </p>
      </div>
    </div>
  );
}