'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/lib/navigation';
import { usePathname } from 'next/navigation';
import { ArrowRight, Code, Megaphone, Zap, Users, Clock, Shield, BarChart3, Mail, MessageSquare, Filter, Repeat, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { openWalletLogin, getLocaleFromPathname } from '@/lib/utils/walletAuth';

export default function CampaignsShowcase() {
  const t = useTranslations('campaigns');
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

  const apiFeatures = [
    { icon: Zap, key: 'instantDelivery' },
    { icon: Code, key: 'simpleIntegration' },
    { icon: Shield, key: 'reliable' },
  ];

  const campaignFeatures = [
    { icon: Filter, key: 'smartSegmentation' },
    { icon: Repeat, key: 'automation' },
    { icon: BarChart3, key: 'analytics' },
  ];

  const channels = [
    { icon: MessageSquare, label: 'SMS', color: 'emerald' },
    { icon: Mail, label: 'Email', color: 'blue' },
  ];

  return (
    <section className="relative px-6 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            {t('sectionLabel')}
          </span>
          <h2 className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
            {t('sectionTitle')}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('sectionSubtitle')}
          </p>

          {/* Channel Badges */}
          <div className="flex justify-center gap-3 mt-6">
            {channels.map((channel) => (
              <span
                key={channel.label}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${channel.color}-100 dark:bg-${channel.color}-900/30 text-${channel.color}-700 dark:text-${channel.color}-400 text-sm font-medium`}
              >
                <channel.icon className="w-4 h-4" />
                {channel.label}
              </span>
            ))}
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* API Card */}
          <div className="relative group">
            {/* Background Gradient */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 opacity-10 group-hover:opacity-15 transition-all duration-500" />

            {/* Glass Card */}
            <div className="relative h-full rounded-3xl p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-emerald-500/10 overflow-hidden">
              {/* Hover Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-br from-emerald-500 to-teal-500 blur-3xl transition-opacity duration-500" />

              <div className="relative z-10">
                {/* Icons */}
                <div className="flex gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Code className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">SMS</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">Email</span>
                    </div>
                  </div>
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
                  {apiFeatures.map((feature) => (
                    <div key={feature.key} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t(`api.features.${feature.key}`)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <Link
                    href="/docs/sms-api"
                    className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300 text-sm"
                  >
                    SMS API
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/docs/email-api"
                    className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 text-sm"
                  >
                    Email API
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Campaigns Card */}
          <div className="relative group">
            {/* Background Gradient */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 group-hover:opacity-15 transition-all duration-500" />

            {/* Glass Card */}
            <div className="relative h-full rounded-3xl p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-purple-500/10 overflow-hidden">
              {/* Hover Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-br from-purple-500 to-pink-500 blur-3xl transition-opacity duration-500" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="flex gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Megaphone className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400">SMS</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-400">Email</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400">Both</span>
                    </div>
                  </div>
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
                  {campaignFeatures.map((feature) => (
                    <div key={feature.key} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
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
                    href="/projects"
                    className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300"
                  >
                    {t('campaigns.cta')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300"
                  >
                    {t('campaigns.cta')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Segmentation Preview */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('segmentation.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('segmentation.subtitle')}
            </p>
          </div>

          {/* Segmentation Visual */}
          <div className="relative rounded-3xl p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Condition Examples */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {t('segmentation.conditions')}
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-medium">subscription_end</span>
                    <span className="text-gray-500">=</span>
                    <span className="text-gray-900 dark:text-white font-medium">7 days</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 text-xs font-medium">domain_expiry</span>
                    <span className="text-gray-500">&lt;</span>
                    <span className="text-gray-900 dark:text-white font-medium">30 days</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium">plan</span>
                    <span className="text-gray-500">=</span>
                    <span className="text-gray-900 dark:text-white font-medium">premium</span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Results */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {t('segmentation.results')}
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('segmentation.matchingContacts')}</span>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">1,247</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-center">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">SMS</div>
                    <div className="text-xs text-gray-500">1,180</div>
                  </div>
                  <div className="flex-1 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">Email</div>
                    <div className="text-xs text-gray-500">1,247</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
