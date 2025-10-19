'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Twitter, Youtube, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface ContactInfo {
  company_name?: string;
  legal_name?: string;
  voen?: string;
  chief_editor?: string;
  domain_owner?: string;
  address: string;
  phone: string;
  phone_2?: string;
  email: string;
  email_2?: string;
  working_hours: string;
  social_links: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  coordinates: {
    latitude?: number;
    longitude?: number;
  };
  map_embed_url?: string;
}

const ContactPage = () => {
  const params = useParams();
  const locale = params.lang || 'az';
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    message: '',
    terms: false
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch contact info
  const { data: contactData, isLoading } = useQuery({
    queryKey: ['contactInfo', locale],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/${locale}/elaqe/info`);
      return response.data.data as ContactInfo;
    }
  });

  // Submit contact form mutation
  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/${locale}/elaqe`, data);
      return response.data;
    },
    onSuccess: (data) => {
      alert(data.message);
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        message: '',
        terms: false
      });
      setFormErrors({});
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        alert(t.errorMessage);
      }
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      terms: e.target.checked
    }));
    if (formErrors.terms) {
      setFormErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors.terms;
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  // Translations
  const translations = {
    az: {
      title: 'Əlaqə',
      breadcrumbHome: 'Ana səhifə',
      breadcrumbCurrent: 'Əlaqə',
      formTitle: 'Bizə yaza bilərsiniz',
      firstName: 'Ad',
      lastName: 'Soyad',
      phone: 'Telefon',
      email: 'E-mail',
      message: 'Mesaj',
      placeholder: 'Qeyd edin',
      messagePlaceholder: 'Mesajınızı yazın',
      terms: 'Qaydalar və şərtlərlə razıyam',
      submit: 'Göndər',
      contactInfo: 'Əlaqə məlumatları',
      address: 'Ünvan',
      workingHours: 'İş saatları',
      followUs: 'Bizi izləyin',
      loading: 'Yüklənir...',
      errorMessage: 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.'
    },
    en: {
      title: 'Contact',
      breadcrumbHome: 'Home',
      breadcrumbCurrent: 'Contact',
      formTitle: 'You can write to us',
      firstName: 'First name',
      lastName: 'Last name',
      phone: 'Phone',
      email: 'Email',
      message: 'Message',
      placeholder: 'Enter',
      messagePlaceholder: 'Enter your message',
      terms: 'I agree to the terms and conditions',
      submit: 'Send',
      contactInfo: 'Contact information',
      address: 'Address',
      workingHours: 'Working hours',
      followUs: 'Follow us',
      loading: 'Loading...',
      errorMessage: 'An error occurred. Please try again.'
    },
    ru: {
      title: 'Контакты',
      breadcrumbHome: 'Главная',
      breadcrumbCurrent: 'Контакты',
      formTitle: 'Вы можете написать нам',
      firstName: 'Имя',
      lastName: 'Фамилия',
      phone: 'Телефон',
      email: 'Email',
      message: 'Сообщение',
      placeholder: 'Введите',
      messagePlaceholder: 'Введите ваше сообщение',
      terms: 'Я согласен с условиями',
      submit: 'Отправить',
      contactInfo: 'Контактная информация',
      address: 'Адрес',
      workingHours: 'Часы работы',
      followUs: 'Подписывайтесь на нас',
      loading: 'Загрузка...',
      errorMessage: 'Произошла ошибка. Пожалуйста, попробуйте еще раз.'
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.az;

  const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
          <span className="text-gray-900 dark:text-white">{t.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header with title and breadcrumb */}
      <div className="flex justify-center items-center gap-3 py-9 px-4 md:px-36">
        <div className="flex w-full max-w-5xl justify-between items-center">
          <h1 className="text-black dark:text-white text-3xl md:text-5xl font-bold">
            {t.title}
          </h1>
          <div className="hidden md:flex items-center gap-1">
            <Link href={`/${locale}`} className="text-black dark:text-gray-300 hover:text-brand-orange dark:hover:text-brand-orange transition-colors">
              {t.breadcrumbHome}
            </Link>
            <span className="mx-2 text-gray-600 dark:text-gray-400">›</span>
            <span className="text-brand-orange underline">
              {t.breadcrumbCurrent}
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col justify-center items-center gap-1 py-4 px-4 md:px-36">
        <div className="flex w-full max-w-5xl items-start gap-8 flex-col lg:flex-row">
          
          {/* Contact Form */}
          <div className="flex-1 w-full">
            <div className="flex p-8 flex-col items-end gap-6 rounded-3xl bg-gray-900 dark:bg-gray-800 shadow-xl dark:shadow-2xl">
              <h2 className="self-stretch text-white text-4xl font-medium">
                {t.formTitle}
              </h2>

              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                {/* First row - Name and Surname */}
                <div className="flex items-center gap-4 self-stretch flex-col sm:flex-row">
                  <div className="flex flex-col items-start gap-2 flex-1 w-full">
                    <label className="self-stretch text-white text-base font-normal">
                      {t.firstName}
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder={t.placeholder}
                      className={`w-full py-5 px-4 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-orange ${
                        formErrors.first_name ? 'border-2 !border-red-500' : ''
                      }`}
                    />
                    {formErrors.first_name && (
                      <span className="text-red-400 text-sm">{formErrors.first_name[0]}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-2 flex-1 w-full">
                    <label className="self-stretch text-white text-base font-normal">
                      {t.lastName}
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder={t.placeholder}
                      className={`w-full py-5 px-4 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-orange ${
                        formErrors.last_name ? 'border-2 !border-red-500' : ''
                      }`}
                    />
                    {formErrors.last_name && (
                      <span className="text-red-400 text-sm">{formErrors.last_name[0]}</span>
                    )}
                  </div>
                </div>

                {/* Second row - Phone and Email */}
                <div className="flex items-center gap-4 self-stretch flex-col sm:flex-row">
                  <div className="flex flex-col items-start gap-2 flex-1 w-full">
                    <label className="self-stretch text-white text-base font-normal">
                      {t.phone}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+994 XX XXX XX XX"
                      className={`w-full py-5 px-4 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-orange ${
                        formErrors.phone ? 'border-2 !border-red-500' : ''
                      }`}
                    />
                    {formErrors.phone && (
                      <span className="text-red-400 text-sm">{formErrors.phone[0]}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-2 flex-1 w-full">
                    <label className="self-stretch text-white text-base font-normal">
                      {t.email}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@mail.com"
                      className={`w-full py-5 px-4 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-orange ${
                        formErrors.email ? 'border-2 !border-red-500' : ''
                      }`}
                    />
                    {formErrors.email && (
                      <span className="text-red-400 text-sm">{formErrors.email[0]}</span>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col items-start gap-2 self-stretch">
                  <label className="self-stretch text-white text-base font-normal">
                    {t.message}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={t.messagePlaceholder}
                    rows={5}
                    className={`w-full py-5 px-4 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-orange ${
                      formErrors.message ? 'border-2 !border-red-500' : ''
                    }`}
                  />
                  {formErrors.message && (
                    <span className="text-red-400 text-sm">{formErrors.message[0]}</span>
                  )}
                </div>

                {/* Terms and Submit */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.terms}
                      onChange={handleCheckboxChange}
                      className="w-5 h-5 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                    />
                    <label htmlFor="terms" className="text-white text-sm">
                      {t.terms}
                    </label>
                  </div>
                  {formErrors.terms && (
                    <span className="text-red-400 text-sm">{formErrors.terms[0]}</span>
                  )}
                  
                  <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="px-8 py-3 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t.submit}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col gap-6 lg:w-[400px]">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t.contactInfo}</h3>

              {contactData && (
                <div className="space-y-4">
                  {/* Company Information */}
                  {(contactData.company_name || contactData.legal_name || contactData.voen) && (
                    <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                      {contactData.company_name && (
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {contactData.company_name}
                        </h4>
                      )}
                      {contactData.legal_name && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {contactData.legal_name}
                        </p>
                      )}
                      {contactData.voen && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          VÖEN: {contactData.voen}
                        </p>
                      )}
                      {contactData.chief_editor && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                          {contactData.chief_editor}
                        </p>
                      )}
                    </div>
                  )}
                  {/* Address */}
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-brand-orange mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1 text-gray-900 dark:text-white">{t.address}</p>
                      <p className="text-gray-600 dark:text-gray-400">{contactData.address}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-3">
                    <Phone className="w-5 h-5 text-brand-orange mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1 text-gray-900 dark:text-white">{t.phone}</p>
                      <a href={`tel:${contactData.phone}`} className="text-gray-600 dark:text-gray-400 hover:text-brand-orange dark:hover:text-brand-orange">
                        {contactData.phone}
                      </a>
                      {contactData.phone_2 && (
                        <>
                          <br />
                          <a href={`tel:${contactData.phone_2}`} className="text-gray-600 dark:text-gray-400 hover:text-brand-orange dark:hover:text-brand-orange">
                            {contactData.phone_2}
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-3">
                    <Mail className="w-5 h-5 text-brand-orange mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1 text-gray-900 dark:text-white">{t.email}</p>
                      <a href={`mailto:${contactData.email}`} className="text-gray-600 dark:text-gray-400 hover:text-brand-orange dark:hover:text-brand-orange">
                        {contactData.email}
                      </a>
                      {contactData.email_2 && (
                        <>
                          <br />
                          <a href={`mailto:${contactData.email_2}`} className="text-gray-600 dark:text-gray-400 hover:text-brand-orange dark:hover:text-brand-orange">
                            {contactData.email_2}
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Social Links */}
            {contactData?.social_links && Object.keys(contactData.social_links).length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t.followUs}</h3>
                <div className="flex gap-3">
                  {Object.entries(contactData.social_links).map(([platform, url]) => {
                    const Icon = socialIcons[platform as keyof typeof socialIcons];
                    return Icon ? (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-brand-orange hover:text-white dark:hover:bg-brand-orange dark:text-gray-400 transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Map */}
            {contactData?.map_embed_url && (
              <div className="rounded-2xl overflow-hidden h-[300px]">
                <iframe
                  src={contactData.map_embed_url}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;