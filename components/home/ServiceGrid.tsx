'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, TrendingUp, Globe, Cloud, DollarSign, Plane, Building, Package, Bitcoin } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ServiceCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
  gradient: string;
  size: 'small' | 'medium' | 'large';
  stats?: string;
  highlight?: boolean;
  pulse?: boolean;
}

export default function ServiceGrid() {
  const t = useTranslations();
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleServiceClick = (serviceId: string) => {
    router.push(`/alerts/quick-setup?service=${serviceId}`);
  };

  const services: ServiceCard[] = [
    {
      id: 'crypto',
      name: t('services.crypto.name'),
      description: t('services.crypto.description'),
      icon: <Bitcoin className="w-8 h-8" />,
      gradient: 'from-orange-500 to-yellow-500',
      size: 'large',
      stats: '₿ $67,450',
      highlight: true,
      pulse: true
    },
    {
      id: 'stocks',
      name: t('services.stocks.name'),
      description: t('services.stocks.description'),
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-500',
      size: 'medium',
      stats: 'S&P +1.2%'
    },
    {
      id: 'website',
      name: t('services.website.name'),
      description: t('services.website.description'),
      icon: <Globe className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-500',
      size: 'small',
      stats: '99.9%'
    },
    {
      id: 'weather',
      name: t('services.weather.name'),
      description: t('services.weather.description'),
      icon: <Cloud className="w-6 h-6" />,
      gradient: 'from-purple-500 to-pink-500',
      size: 'medium',
      stats: '23°C'
    },
    {
      id: 'currency',
      name: t('services.currency.name'),
      description: t('services.currency.description'),
      icon: <DollarSign className="w-6 h-6" />,
      gradient: 'from-indigo-500 to-purple-500',
      size: 'small',
      stats: '$ 1.08'
    },
    {
      id: 'flight',
      name: t('services.flight.name'),
      description: t('services.flight.description'),
      icon: <Plane className="w-6 h-6" />,
      gradient: 'from-sky-500 to-blue-500',
      size: 'small',
      stats: t('services.flight.stats')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
      {services.map((service) => {
        const isHovered = hoveredCard === service.id;
        const gridClass = '';

        return (
          <div
            key={service.id}
            className={`${gridClass} relative group cursor-pointer`}
            onMouseEnter={() => setHoveredCard(service.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleServiceClick(service.id)}
          >
            {/* Card Background */}
            <div className={`
              absolute inset-0 rounded-3xl
              bg-gradient-to-br ${service.gradient}
              opacity-10 group-hover:opacity-15
              transition-all duration-500
              ${service.pulse ? 'animate-pulse' : ''}
            `} />

            {/* Glass Card */}
            <div className={`
              relative h-full rounded-3xl p-6
              bg-white/80 dark:bg-gray-900/80
              backdrop-blur-xl
              border border-white/30 dark:border-gray-700/30
              transition-all duration-500
              ${isHovered ? 'scale-[1.02] shadow-2xl' : 'shadow-lg'}
              overflow-hidden
            `}>
              {/* Hover Gradient Effect */}
              <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-50
                bg-gradient-to-br ${service.gradient}
                transition-opacity duration-500
                blur-3xl
              `} />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between">
                {/* Top Section */}
                <div>
                  {/* Icon Container */}
                  <div className={`
                    inline-flex items-center justify-center
                    w-12 h-12 rounded-2xl mb-3
                    bg-gradient-to-br ${service.gradient}
                    text-white shadow-lg
                    group-hover:scale-110 transition-transform duration-300
                  `}>
                    {service.icon}
                  </div>

                  {/* Title & Description */}
                  <h3 className={`
                    font-bold text-gray-900 dark:text-white mb-2
                    ${service.size === 'large' ? 'text-xl' : 'text-base'}
                  `}>
                    {service.name}
                  </h3>
                  <p className={`
                    text-gray-800 dark:text-gray-200 leading-relaxed
                    ${service.size === 'small' ? 'text-xs font-normal' : 'text-sm font-normal'}
                    ${service.size === 'large' ? 'line-clamp-2' : 'line-clamp-2'}
                  `}>
                    {service.description}
                  </p>
                </div>

                {/* Bottom Section */}
                <div className="flex items-center justify-between mt-4">
                  {/* Stats or Badge */}
                  {service.stats ? (
                    <span className={`
                      px-3 py-1.5 rounded-full text-xs font-semibold
                      bg-gradient-to-r ${service.gradient}
                      text-white shadow-md
                    `}>
                      {service.stats}
                    </span>
                  ) : service.highlight ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                      <Sparkles className="w-3 h-3" />
                      {t('services.popular')}
                    </span>
                  ) : (
                    <span />
                  )}

                  {/* Arrow */}
                  <div className={`
                    w-8 h-8 rounded-full
                    bg-gradient-to-r ${service.gradient}
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    transform translate-x-2 group-hover:translate-x-0
                    transition-all duration-300
                  `}>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Shine Effect on Hover */}
              <div className="
                absolute inset-0 opacity-0 group-hover:opacity-100
                bg-gradient-to-r from-transparent via-white/10 to-transparent
                -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%]
                transition-all duration-1000 ease-out
                pointer-events-none
              " />
            </div>
          </div>
        );
      })}

    </div>
  );
}