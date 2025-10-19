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
    title: dictionary.creditTypes?.business || "Business Credits",
    description: "Compare business loan offers from banks in Azerbaijan",
  };
}

export default async function BusinessCreditsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  return <CreditCategoryClient params={resolvedParams} category="business" />;
}