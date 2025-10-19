import { notFound } from "next/navigation";
import { i18n, type Locale } from "@/i18n-config";

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function LangLayout({
  children,
  params
}: LangLayoutProps) {
  const { lang } = await params;

  // Validate that the incoming `lang` parameter is valid
  if (!i18n.locales.includes(lang as Locale)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {children}
    </div>
  );
}

export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}
