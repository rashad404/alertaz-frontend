'use client';

import { useEffect, useState } from 'react';
import SearchMonitor from '@/components/home/SearchMonitor';
import ServiceGrid from '@/components/home/ServiceGrid';
import SMSShowcase from '@/components/home/SMSShowcase';
import { Bell, Sparkles, Zap, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export default function HomePage({ params }: HomePageProps) {
  const t = useTranslations();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Mouse tracking for gradient effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 z-[-10]">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 70%)',
            left: `${mousePosition.x - 200}px`,
            top: `${mousePosition.y - 200}px`,
            transition: 'all 0.3s ease-out',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Hero Section with Premium Design */}
      <section className="relative pt-12 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Animated Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-50 animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1px] animate-float">
                <div className="w-full h-full rounded-3xl bg-white dark:bg-gray-900 flex items-center justify-center">
                  <div className="relative">
                    <Bell className="w-10 h-10 text-indigo-600 dark:text-indigo-400" strokeWidth={2} fill="none" />
                    <div className="absolute inset-0 w-10 h-10">
                      <Bell className="w-10 h-10 text-purple-500 opacity-50" strokeWidth={2} fill="none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Heading with Gradient Text */}
          <div className="text-center mb-4">
            <h1 className="text-6xl md:text-7xl font-bold">
              <span className="gradient-text">Alert.az</span>
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 font-light">
              {t('home.subtitle')}
            </p>
          </div>

          {/* Premium Labels */}
          <div className="flex justify-center gap-3 mb-12">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{t('home.aiPowered')}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <Zap className="w-3 h-3 text-purple-500" />
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{t('home.realtime')}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
              <Shield className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{t('home.secure')}</span>
            </span>
          </div>

          {/* Search Section */}
          <SearchMonitor />
        </div>
      </section>

      {/* SMS Showcase Section */}
      <SMSShowcase />

      {/* Bento Grid Services */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">{t('home.services')}</span>
            <h2 className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
              {t('home.servicesTitle')}
            </h2>
          </div>
          <ServiceGrid />
        </div>
      </section>

      {/* Premium Stats */}
      <section className="relative px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl p-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">99.9%</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('home.uptime')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">10ms</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('home.responseTime')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">50K+</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('home.activeAlerts')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">24/7</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('home.monitoring')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}