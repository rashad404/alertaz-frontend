"use client";

import { useDictionary } from "@/providers/dictionary-provider";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { getLocalizedPath } from "@/lib/utils/locale";
import { useState, useEffect } from "react";
import axios from "axios";

interface FooterProps {
  locale: string;
}

interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string | { [key: string]: string };
}

export function Footer({ locale }: FooterProps) {
  const dictionary = useDictionary();
  const t = dictionary.footer;

  // Contact info state
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '+994 12 900 00 00',
    email: 'info@kredit.az',
    address: 'Bakı şəhəri, Fətəli Xanxoyski küçəsi, 21A'
  });

  // Newsletter subscription state
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  // Handle newsletter subscription
  // Fetch contact info on mount
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/${locale}/contact-info`);
        if (response.data.success && response.data.data) {
          const data = response.data.data;
          setContactInfo({
            phone: data.phone || '+994 12 900 00 00',
            email: data.email || 'info@kredit.az',
            address: typeof data.address === 'object' && data.address[locale]
              ? data.address[locale]
              : data.address || 'Bakı şəhəri, Fətəli Xanxoyski küçəsi, 21A'
          });
        }
      } catch (error) {
        console.error('Failed to fetch contact info:', error);
      }
    };

    fetchContactInfo();
  }, [locale]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous message
    setMessage({ type: null, text: '' });
    
    // Validate email
    if (!email || !email.includes('@')) {
      setMessage({ 
        type: 'error', 
        text: locale === 'az' ? 'Zəhmət olmasa düzgün e-poçt ünvanı daxil edin.' 
            : locale === 'ru' ? 'Пожалуйста, введите правильный адрес электронной почты.'
            : 'Please enter a valid email address.'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/${locale}/subscribe`,
        { email }
      );
      
      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        setEmail(''); // Clear form
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
        (locale === 'az' ? 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.'
         : locale === 'ru' ? 'Произошла ошибка. Пожалуйста, попробуйте еще раз.'
         : 'An error occurred. Please try again.');
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-[#F9F9F9] dark:bg-gray-900">
      <div className="flex justify-center px-4 sm:px-8 lg:px-36">
        <div className="w-full max-w-5xl py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Services */}
          <div>
            <h3 className="text-xl font-bold text-grayscale-900 dark:text-white mb-4">
              {t.services}
            </h3>
            <div className="space-y-3">
              <Link href={getLocalizedPath(locale, '/sirketler/kredit-teskilatlari/nagd-kreditler')} className="block text-grayscale-900 dark:text-gray-300 hover:text-brand-orange transition-colors">
                {t.services_items.cashCredits}
              </Link>
              <Link href={getLocalizedPath(locale, '/sirketler/banklar')} className="block text-grayscale-900 dark:text-gray-300 hover:text-brand-orange transition-colors">
                {t.services_items.creditCards}
              </Link>
              <Link href={getLocalizedPath(locale, '/sirketler/kredit-teskilatlari/avtomobil-kreditler')} className="block text-grayscale-900 dark:text-gray-300 hover:text-brand-orange transition-colors">
                {t.services_items.autoCredits}
              </Link>
              <Link href={getLocalizedPath(locale, '/sirketler/kredit-teskilatlari/ipoteka-kreditler')} className="block text-grayscale-900 dark:text-gray-300 hover:text-brand-orange transition-colors">
                {t.services_items.mortgage}
              </Link>
              <Link href={getLocalizedPath(locale, '/sirketler/kredit-teskilatlari/biznes-kreditler')} className="block text-grayscale-900 dark:text-gray-300 hover:text-brand-orange transition-colors">
                {t.services_items.businessCredits}
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xl font-bold text-grayscale-900 dark:text-white mb-4">
              {t.company}
            </h3>
            <div className="space-y-3">
              <Link href={getLocalizedPath(locale, '/haqqimizda')} className="block text-grayscale-900 dark:text-gray-300 hover:text-brand-orange transition-colors">
                {t.company_items.about}
              </Link>
              <Link href={getLocalizedPath(locale, '/elaqe')} className="block text-grayscale-900 dark:text-gray-300 hover:text-brand-orange transition-colors">
                {t.company_items.contact}
              </Link>
              <Link href={getLocalizedPath(locale, '/sertler')} className="block text-grayscale-900 dark:text-gray-300 hover:text-brand-orange transition-colors">
                {t.company_items.terms}
              </Link>
              <Link href={getLocalizedPath(locale, '/qaydalar')} className="block text-grayscale-900 dark:text-gray-300 hover:text-brand-orange transition-colors">
                {t.company_items.rules}
              </Link>
              <Link href={getLocalizedPath(locale, '/sual-cavab')} className="block text-grayscale-900 dark:text-gray-300 hover:text-brand-orange transition-colors">
                {t.company_items.faq}
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xl font-bold text-grayscale-900 dark:text-white mb-4">
              {t.resources}
            </h3>
            <div className="space-y-3">
              <Link href={getLocalizedPath(locale, '/bloq')} className="block text-grayscale-900 dark:text-gray-300 hover:text-brand-orange transition-colors">
                {t.resources_items.blog}
              </Link>
              <Link href={getLocalizedPath(locale, '/kalkulyator/valyuta')} className="block text-grayscale-900 dark:text-gray-300 hover:text-brand-orange transition-colors">
                {t.resources_items.calculator}
              </Link>
              <Link href={getLocalizedPath(locale, '/tehsil')} className="block text-grayscale-900 dark:text-gray-300 hover:text-brand-orange transition-colors">
                {t.resources_items.education}
              </Link>
              <Link href={getLocalizedPath(locale, '/rehberler')} className="block text-grayscale-900 dark:text-gray-300 hover:text-brand-orange transition-colors">
                {t.resources_items.guides}
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold text-grayscale-900 dark:text-white mb-6">
              {t.contact}
            </h3>
            <div className="space-y-4">
              {contactInfo.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-brand-orange flex-shrink-0" />
                  <a href={`mailto:${contactInfo.email}`} className="text-grayscale-900 dark:text-gray-300 hover:text-brand-orange transition-colors">
                    {contactInfo.email}
                  </a>
                </div>
              )}
              {contactInfo.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                  <span className="text-grayscale-900 dark:text-gray-300">
                    {contactInfo.address}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-grayscale-900-12 dark:border-gray-800 pt-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="lg:max-w-lg">
              <h4 className="text-sm font-semibold text-grayscale-900-40 dark:text-gray-500 mb-2">
                {t.newsletter.title}
              </h4>
              <p className="text-grayscale-900 dark:text-gray-300">
                {t.newsletter.description}
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.newsletter.placeholder}
                  disabled={isLoading}
                  className="px-4 py-2 border border-text-gray-02 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-grayscale-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-brand-orange hover:bg-brand-orange-dark text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      <span>{locale === 'az' ? 'Göndərilir...' : locale === 'ru' ? 'Отправка...' : 'Sending...'}</span>
                    </>
                  ) : (
                    t.newsletter.button
                  )}
                </button>
              </div>
              {/* Message display */}
              {message.type && (
                <div className={`text-sm ${message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {message.text}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-grayscale-900-12 dark:border-gray-800 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-grayscale-900-56 dark:text-gray-500">
              {t.copyright?.replace('{year}', new Date().getFullYear().toString())}
            </p>
            <div className="flex items-center space-x-6">
              <Link href="#" className="text-grayscale-900-56 dark:text-gray-500 hover:text-brand-orange transition-colors">
                <Facebook className="w-6 h-6" />
              </Link>
              <Link href="#" className="text-grayscale-900-56 dark:text-gray-500 hover:text-brand-orange transition-colors">
                <Twitter className="w-6 h-6" />
              </Link>
              <Link href="#" className="text-grayscale-900-56 dark:text-gray-500 hover:text-brand-orange transition-colors">
                <Instagram className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
}