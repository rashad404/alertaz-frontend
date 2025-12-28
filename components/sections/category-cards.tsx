"use client";

import { ArrowRight } from "lucide-react";
import { Link } from '@/lib/navigation';
import { useDictionary } from "@/providers/dictionary-provider";

interface CategoryCardsProps {
  locale: string;
}

export function CategoryCards({ locale }: CategoryCardsProps) {
  const dictionary = useDictionary();
  const t = dictionary.home;

  const categories = [
    {
      id: "banks",
      title: t.banks,
      items: ["Kapital Bank", "Paşa Bank", "Bank Respublika"],
      bgColor: "bg-red-50",
      iconColor: "text-black/5",
      link: `/${locale}/sirketler/banklar`,
      icon: (
        <svg viewBox="0 0 68 68" fill="currentColor" className="w-full h-full">
          <path d="M5.66675 56.6667H62.3334V62.3333H5.66675V56.6667ZM11.3334 34H17.0001V53.8333H11.3334V34ZM25.5001 34H31.1667V53.8333H25.5001V34ZM36.8334 34H42.5001V53.8333H36.8334V34ZM51.0001 34H56.6667V53.8333H51.0001V34ZM5.66675 19.8333L34.0001 5.66667L62.3334 19.8333V31.1667H5.66675V19.8333ZM11.3334 23.3353V25.5H56.6667V23.3353L34.0001 12.002L11.3334 23.3353ZM34.0001 22.6667C33.2486 22.6667 32.528 22.3682 31.9966 21.8368C31.4653 21.3055 31.1667 20.5848 31.1667 19.8333C31.1667 19.0819 31.4653 18.3612 31.9966 17.8299C32.528 17.2985 33.2486 17 34.0001 17C34.7515 17 35.4722 17.2985 36.0035 17.8299C36.5349 18.3612 36.8334 19.0819 36.8334 19.8333C36.8334 20.5848 36.5349 21.3055 36.0035 21.8368C35.4722 22.3682 34.7515 22.6667 34.0001 22.6667Z"/>
        </svg>
      ),
    },
    {
      id: "insurance",
      title: t.insuranceOrganizations,
      items: ["Atəşgah sığorta", "Kasko butik", "Həyat sığorta"],
      bgColor: "bg-blue-50",
      iconColor: "text-black/5",
      link: `/${locale}/sirketler/sigorta`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
          <path d="M12 2L3.5 7v6c0 4.4 2.5 8.5 6.5 10 4-1.5 6.5-5.6 6.5-10V7L12 2z"/>
        </svg>
      ),
    },
    {
      id: "bokt",
      title: "BOKT",
      items: ["Azersun", "Veysəloğlu", "Kristal Abşeron"],
      bgColor: "bg-yellow-50",
      iconColor: "text-black/5",
      link: `/${locale}/sirketler/kredit-teskilatlari`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-11">
      {categories.map((category) => (
        <div key={category.id} className={`${category.bgColor} rounded-xl p-5 relative overflow-hidden`}>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-black dark:text-gray-900 mb-3">{category.title}</h3>
            <div className="space-y-2 mb-5">
              {category.items.map((item, index) => (
                <p key={index} className={`text-gray-600 dark:text-gray-700 text-sm ${index === 0 ? 'underline' : ''}`}>
                  {item}
                </p>
              ))}
            </div>
            <Link 
              href={category.link}
              className={`${category.id === 'banks' ? 'bg-brand-orange text-white' : 'border border-brand-orange text-brand-orange-text'} px-3 py-2 rounded-lg flex items-center space-x-1 text-sm w-fit hover:opacity-80 transition-opacity`}
            >
              <span>{t.viewAll}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className={`absolute top-5 right-5 opacity-5`}>
            <div className={`w-17 h-17 ${category.iconColor}`}>
              {category.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}