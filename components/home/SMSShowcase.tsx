'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/lib/navigation';
import { usePathname } from 'next/navigation';
import { ArrowRight, Code, Megaphone, Zap, Users, Clock, Shield, BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { openWalletLogin, getLocaleFromPathname } from '@/lib/utils/walletAuth';

export default function SMSShowcase() {
  const t = useTranslations('sms');
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const locale = getLocaleFromPathname(pathname);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginClick = () => {
    openWalletLogin({
      locale,
      onSuccess: () => setIsLoggedIn(true)
    });
  };

  const smsApiFeatures = [
    { icon: Zap, key: 'instantDelivery' },
    { icon: Code, key: 'simpleIntegration' },
    { icon: Shield, key: 'reliable' },
  ];

  const smsCampaignFeatures = [
    { icon: Users, key: 'audienceTargeting' },
    { icon: Clock, key: 'scheduling' },
    { icon: BarChart3, key: 'analytics' },
  ];

  return (
    <section className="relative px-6 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            {t('sectionLabel')}
          </span>
          <h2 className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
            {t('sectionTitle')}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('sectionSubtitle')}
          </p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SMS API Card */}
          <div className="relative group">
            {/* Background Gradient */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 opacity-10 group-hover:opacity-15 transition-all duration-500" />

            {/* Glass Card */}
            <div className="relative h-full rounded-3xl p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-emerald-500/10 overflow-hidden">
              {/* Hover Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-br from-green-500 to-emerald-500 blur-3xl transition-opacity duration-500" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                  <Code className="w-7 h-7 text-white" />
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('api.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {t('api.description')}
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {smsApiFeatures.map((feature) => (
                    <div key={feature.key} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t(`api.features.${feature.key}`)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link
                  href="/sms-api"
                  className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300"
                >
                  {t('api.cta')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* SMS Campaigns Card */}
          <div className="relative group">
            {/* Background Gradient */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 opacity-10 group-hover:opacity-15 transition-all duration-500" />

            {/* Glass Card */}
            <div className="relative h-full rounded-3xl p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-rose-500/10 overflow-hidden">
              {/* Hover Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-br from-pink-500 to-rose-500 blur-3xl transition-opacity duration-500" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/30">
                  <Megaphone className="w-7 h-7 text-white" />
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('campaigns.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {t('campaigns.description')}
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {smsCampaignFeatures.map((feature) => (
                    <div key={feature.key} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t(`campaigns.features.${feature.key}`)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                {isLoggedIn ? (
                  <Link
                    href="/settings/sms/projects"
                    className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-lg hover:shadow-rose-500/30 hover:scale-105 transition-all duration-300"
                  >
                    {t('campaigns.cta')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-lg hover:shadow-rose-500/30 hover:scale-105 transition-all duration-300"
                  >
                    {t('campaigns.cta')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
