import { Metadata } from "next";
import { getDictionary } from "@/get-dictionary";
import { CreditCategoryClient } from "./CreditCategoryClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  
  return {
    title: dictionary.creditTypes?.cash || "Cash Credits",
    description: "Compare cash credit offers from banks and credit organizations in Azerbaijan",
  };
}

export default async function CashCreditsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  return <CreditCategoryClient params={resolvedParams} category="cash" />;
}