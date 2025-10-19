import { Metadata } from "next";
import { Locale } from "@/i18n-config";
import BlogClient from "./BlogClient";

interface BlogPageProps {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ tag?: string; page?: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { lang } = await params;
  
  const titles = {
    az: "Blog - Maliyyə Məsləhətləri | Kredit.az",
    en: "Blog - Financial Advice | Kredit.az",
    ru: "Блог - Финансовые советы | Kredit.az",
  };

  const descriptions = {
    az: "Kredit, depozit, ipoteka və digər maliyyə məhsulları haqqında faydalı məqalələr",
    en: "Useful articles about loans, deposits, mortgages and other financial products",
    ru: "Полезные статьи о кредитах, депозитах, ипотеке и других финансовых продуктах",
  };

  return {
    title: titles[lang],
    description: descriptions[lang],
  };
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { lang } = await params;
  const { tag, page } = await searchParams;
  
  return <BlogClient locale={lang} initialTag={tag} initialPage={page} />;
}