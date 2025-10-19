"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { EntityComparisonIcon } from "@/components/ui/entity-comparison-icon";
import { SearchOverlay } from "@/components/search/search-overlay";
import { cn } from "@/lib/utils";
import { getLocalizedPath } from "@/lib/utils/locale";
import { useDictionary } from "@/providers/dictionary-provider";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const dictionary = useDictionary();
  const t = dictionary.nav;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Fetch menus from API
  const { data: menuData } = useQuery({
    queryKey: ["menus", locale],
    queryFn: async () => {
      const response = await apiClient.get(`/${locale}/menus`);
      return response.data?.data || { header: [], footer: [] };
    },
  });

  // Fetch news categories for news submenu
  const { data: newsCategories } = useQuery({
    queryKey: ["news-categories", locale],
    queryFn: async () => {
      const response = await apiClient.get(`/${locale}/xeberler/kategoriler`);
      // Ensure we always return an array
      const data = response.data;
      if (Array.isArray(data)) {
        return data as Array<{ id: number; title: string; slug: string }>;
      } else if (data && Array.isArray(data.data)) {
        return data.data as Array<{ id: number; title: string; slug: string }>;
      }
      return [];
    },
  });

  // Removed - we now use only menu items from the database
  // const { data: companyTypes } = useQuery({...});

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when menu is closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Process menu items - merge news categories and company type subcategories
  const navItems = useMemo(() => {
    if (!menuData?.header || !Array.isArray(menuData.header)) return [];

    return menuData.header.map((item: any) => {
      // Special handling for news menu to add dynamic categories
      if (item.slug === 'xeberler') {
        // Build dropdown items - always include base items first
        const baseItems = Array.isArray(item.children)
          ? item.children.map((child: any) => ({
              href: child.url, // URL already includes locale from backend
              label: child.title
            }))
          : [];

        // Add news categories if they're loaded
        const categoryItems = Array.isArray(newsCategories)
          ? newsCategories.map(cat => ({
              href: getLocalizedPath(locale, `/xeberler/kat/${cat.slug}`), // News categories need locale added
              label: cat.title
            }))
          : [];

        return {
          ...item,
          href: item.url, // URL already includes locale from backend
          label: item.title,
          hasDropdown: item.has_dropdown || baseItems.length > 0 || categoryItems.length > 0,
          dropdownItems: [...baseItems, ...categoryItems]
        };
      }

      // Use menu items from database for all menus including Credits and Insurance
      return {
        ...item,
        href: item.url, // URL already includes locale from backend
        label: item.title,
        hasDropdown: item.has_dropdown,
        dropdownItems: Array.isArray(item.children)
          ? item.children.map((child: any) => ({
              href: child.url, // URL already includes locale from backend
              label: child.title
            }))
          : []
      };
    });
  }, [menuData, newsCategories, locale]);

  return (
    <header className="border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-50">
      <div className="flex justify-center px-4 sm:px-8 lg:px-36">
        <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Logo locale={locale} />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 ml-8 flex-1 justify-center">
            {navItems.map((item) => (
              <div 
                key={item.href} 
                className="relative group"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center space-x-1 font-bold text-gray-900 dark:text-white hover:text-brand-orange transition-colors"
                >
                  <span>{item.label}</span>
                  {item.hasDropdown && (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Link>
                
                {/* Dropdown menu */}
                {item.hasDropdown && item.dropdownItems && Array.isArray(item.dropdownItems) && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="w-56 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-2">
                      {item.dropdownItems.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.href}
                          href={dropdownItem.href}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-brand-orange transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {dropdownItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side utilities */}
          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* Language Switcher - Commented out for now */}
            {/* <LanguageSwitcher locale={locale} /> */}

            <div className="flex items-center space-x-2 lg:space-x-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={t.search}
              >
                <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              
              <ThemeToggle />
              
              <EntityComparisonIcon locale={locale} />

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          ref={mobileMenuRef}
          className={cn(
            "lg:hidden absolute left-0 right-0 top-16 lg:top-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out transform origin-top shadow-lg",
            mobileMenuOpen 
              ? "opacity-100 visible translate-y-0 scale-y-100" 
              : "opacity-0 invisible -translate-y-2 scale-y-95"
          )}
          style={{ 
            maxHeight: mobileMenuOpen ? '80vh' : '0',
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <div className="relative">
            <nav className="px-4 py-4 space-y-3 max-h-[70vh] overflow-y-auto overscroll-contain">
            {navItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => !item.hasDropdown && setMobileMenuOpen(false)}
                  className="block font-bold py-2 text-gray-900 dark:text-white hover:text-brand-orange transition-colors"
                >
                  {item.label}
                </Link>
                {item.hasDropdown && item.dropdownItems && Array.isArray(item.dropdownItems) && (
                  <div className="ml-4 mt-2 space-y-2">
                    {item.dropdownItems.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.href}
                        href={dropdownItem.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-orange transition-colors"
                      >
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Copyright footer to indicate end of menu */}
            <div className="px-4 py-4 mt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {dictionary.footer?.copyright?.replace('{year}', new Date().getFullYear().toString()) || `Bütün hüquqları qorunur © ${new Date().getFullYear()} Kredit.az`}
              </p>
            </div>
            </nav>
          </div>
        </div>
        </div>

        {/* Search overlay */}
        <SearchOverlay 
          isOpen={searchOpen} 
          onClose={() => setSearchOpen(false)} 
          locale={locale} 
        />
      </div>
    </header>
  );
}