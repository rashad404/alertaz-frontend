'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play } from 'lucide-react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

const ArrowUpRightIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_3081_3016)">
      <path d="M21.7501 20.6L12.3235 30.03L9.9668 27.6717L19.3951 18.245L11.1451 9.995H30.0001V28.85L21.7501 20.6Z" fill="#FF6021"/>
    </g>
    <defs>
      <clipPath id="clip0_3081_3016">
        <rect width="40" height="40" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const AboutPage = () => {
  const params = useParams();
  const locale = params.lang || 'az';

  // Fetch main about data
  const { data: aboutData, isLoading: isLoadingAbout } = useQuery({
    queryKey: ['about', locale],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/${locale}/haqqimizda`);
      return response.data.data;
    }
  });

  // Fetch missions data
  const { data: missions, isLoading: isLoadingMissions } = useQuery({
    queryKey: ['missions', locale],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/${locale}/haqqimizda/missions`);
      return response.data.data;
    }
  });

  // Fetch dynamic sections
  const { data: dynamicSections } = useQuery({
    queryKey: ['dynamicSections', locale],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/${locale}/haqqimizda/dynamic-sections`);
      return response.data.data;
    }
  });

  if (isLoadingAbout || isLoadingMissions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Section */}
      <div className="flex px-4 md:px-8 lg:px-36 py-9 justify-center items-center">
        <div className="flex w-full max-w-5xl justify-between items-center">
          <div className="flex justify-center items-center gap-1">
            <h1 className="text-black dark:text-white text-3xl md:text-5xl font-bold leading-tight">
              {locale === 'az' ? 'Haqqımızda' : locale === 'en' ? 'About Us' : 'О нас'}
            </h1>
          </div>
          <div className="hidden md:flex justify-center items-center gap-1">
            <Link href={`/${locale}`} className="text-black dark:text-gray-300 hover:text-brand-orange dark:hover:text-brand-orange transition-colors text-base font-normal leading-6">
              {locale === 'az' ? 'Ana səhifə' : locale === 'en' ? 'Home' : 'Главная'} 
            </Link>
            <span className="mx-2 text-gray-600 dark:text-gray-400">›</span>
            <span className="text-brand-orange text-base font-normal leading-6 underline">
              {locale === 'az' ? 'Haqqımızda' : locale === 'en' ? 'About Us' : 'О нас'}
            </span>
          </div>
        </div>
      </div>

      {/* Purpose Section */}
      {aboutData && (
        <div className="flex px-4 md:px-8 lg:px-36 pb-12 flex-col justify-center items-center">
          <div className="flex w-full max-w-5xl justify-between items-center flex-col lg:flex-row gap-12">
            <div className="flex flex-col items-start flex-1">
              <div className="flex flex-col items-start gap-3 w-full">
                <p className="text-brand-text-secondary dark:text-gray-400 text-base font-normal leading-6 whitespace-pre-line">
                  {aboutData.purpose_description}
                </p>
              </div>
            </div>
            {aboutData.purpose_image && (
              <img 
                className="w-full lg:w-auto lg:max-w-lg h-auto rounded-3xl flex-shrink-0"
                src={aboutData.purpose_image}
                alt="Purpose"
              />
            )}
          </div>

        </div>
      )}

{/* Mission Section */}
      {missions && missions.length > 0 && aboutData && (
        <div className="flex px-4 md:px-8 lg:px-36 py-20 flex-col justify-center items-center gap-14">
          <div className="flex w-full max-w-5xl flex-col items-start gap-14">
            <div className="flex flex-col items-start gap-16 max-w-lg">
              <div className="flex flex-col items-start gap-3 w-full">
                <h2 className="text-black dark:text-white text-3xl md:text-4xl font-bold leading-tight">
                  {aboutData.mission_title}
                </h2>
                <p className="text-brand-text-muted dark:text-gray-400 text-lg font-normal leading-7 whitespace-pre-line">
                  {aboutData.mission_description}
                </p>
              </div>
            </div>

            {/* Mission Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
              {Array.isArray(missions) && missions.map((mission: { id: number; title: string; description: string; icon?: string }) => (
                <div key={mission.id} className="flex p-8 md:p-10 flex-col items-start gap-10 rounded-lg bg-brand-orange-light dark:bg-gray-800">
                  <div className="flex flex-col items-start gap-14">
                    {mission.icon ? (
                      <img src={mission.icon} alt={mission.title} className="w-10 h-10" />
                    ) : (
                      <ArrowUpRightIcon />
                    )}
                    <div className="flex flex-col items-center gap-3">
                      <h3 className="text-brand-text-primary dark:text-white text-xl md:text-2xl font-bold leading-8">
                        {mission.title}
                      </h3>
                      <p className="text-brand-text-primary dark:text-gray-300 opacity-60 dark:opacity-100 text-base font-normal leading-relaxed">
                        {mission.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Sections */}
      {dynamicSections && dynamicSections.length > 0 && (
        <div className="flex px-4 md:px-8 lg:px-36 py-10 flex-col gap-20">
          {Array.isArray(dynamicSections) && dynamicSections.map((section: { id: number; title: string; description: string; content?: string; image?: string }) => (
            <div key={section.id} className="flex w-full max-w-5xl mx-auto flex-col lg:flex-row items-center gap-12">
              {section.image && (
                <img 
                  className="w-full lg:w-1/2 h-auto rounded-2xl"
                  src={section.image}
                  alt={section.title}
                />
              )}
              <div className="flex flex-col gap-4 flex-1">
                <h3 className="text-black dark:text-white text-2xl md:text-3xl font-bold leading-tight">
                  {section.title}
                </h3>
                <div 
                  className="text-brand-text-secondary dark:text-gray-400 text-base font-normal leading-6"
                  dangerouslySetInnerHTML={{ __html: section.content || section.description }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Join Team Section */}
      {aboutData && aboutData.career_section.title && (
        <div className="flex px-4 md:px-8 lg:px-36 py-20 flex-col justify-center items-center">
          <div className="flex w-full max-w-5xl p-8 md:p-14 flex-col lg:flex-row items-start gap-14 rounded-[28px] bg-brand-gray-light dark:bg-gray-800">
            <div className="flex flex-col items-start gap-4 flex-1">
              <h2 className="text-black dark:text-white text-3xl md:text-4xl font-bold leading-tight">
                {aboutData.career_section.title}
              </h2>
              <p className="text-brand-text-secondary dark:text-gray-400 text-base font-normal leading-6 whitespace-pre-line">
                {aboutData.career_section.description}
              </p>
            </div>
            {aboutData.career_section.button_text && aboutData.career_section.button_link && (
              <div className="flex justify-end items-center gap-2">
                <Link 
                  href={aboutData.career_section.button_link}
                  className="flex px-10 py-5 justify-center items-center gap-2 rounded-[10px] bg-brand-orange hover:bg-brand-orange-dark transition-colors"
                >
                  <span className="text-black text-base font-bold leading-6">
                    {aboutData.career_section.button_text}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutPage;