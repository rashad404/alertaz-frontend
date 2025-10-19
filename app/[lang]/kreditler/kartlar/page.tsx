import { Metadata } from "next";
import { getDictionary } from "@/get-dictionary";
import { CreditCategoryClient } from "../nagd/CreditCategoryClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  
  return {
    title: dictionary.creditTypes?.cards || "Credit Cards",
    description: "Compare credit card offers from banks in Azerbaijan",
  };
}

export default async function CreditCardsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  return <CreditCategoryClient params={resolvedParams} category="cards" />;
}