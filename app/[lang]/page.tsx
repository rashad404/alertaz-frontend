'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, Bell, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export default function HomePage({ params }: HomePageProps) {
  const router = useRouter();
  const [lang, setLang] = useState('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [email, setEmail] = useState('');

  useEffect(() => {
    params.then((p) => {
      setLang(p.lang);
      checkApiStatus();
    });
  }, [params]);

  const checkApiStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://100.89.150.50:8007/api';
      const response = await axios.get(`${apiUrl}/health`);
      if (response.data.status === 'healthy') {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      setApiStatus('offline');
    }
  };

  const features = [
    {
      icon: '₿',
      title: 'Crypto Monitoring',
      desc: 'Track Bitcoin, Ethereum, and 100+ cryptocurrencies in real-time',
      gradient: 'from-orange-400 to-yellow-500'
    },
    {
      icon: '☁️',
      title: 'Weather Alerts',
      desc: 'Get notified about weather changes and severe conditions',
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      icon: '🌐',
      title: 'Website Uptime',
      desc: 'Monitor website availability and response times 24/7',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      icon: '📈',
      title: 'Stock Market',
      desc: 'Follow NYSE, NASDAQ, and global stock movements',
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      icon: '💱',
      title: 'Currency Rates',
      desc: 'Track AZN, USD, EUR and other exchange rates',
      gradient: 'from-indigo-400 to-blue-500'
    },
    {
      icon: '🔔',
      title: 'Multi-Channel',
      desc: 'SMS, Email, Telegram, WhatsApp, Slack notifications',
      gradient: 'from-red-400 to-orange-500'
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '50M+', label: 'Alerts Sent' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Monitoring' },
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      router.push(`/${lang}/register?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* API Status Badge */}
      {apiStatus === 'online' && (
        <div className="absolute top-20 right-4 z-10">
          <span className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full shadow-lg">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            API Online
          </span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative px-4 py-20 lg:py-32 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Intelligent Alert System</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8">
            Never Miss an
            <br />
            <span className="bg-gradient-to-r from-[rgb(81,91,195)] to-indigo-400 bg-clip-text text-transparent">
              Important Update
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Set up intelligent alerts for cryptocurrencies, stocks, weather, and more.
            Get notified instantly through your preferred channel when conditions are met.
          </p>

          {/* Email capture form */}
          <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto mb-8">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to get started"
                className="flex-1 px-5 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(81,91,195)] focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[rgb(81,91,195)] to-indigo-400 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all font-medium flex items-center gap-2"
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Instant setup</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative px-4 py-16 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-[rgb(81,91,195)] to-indigo-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative px-4 py-20 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Monitor Everything That Matters
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Choose from our wide range of monitoring services
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}></div>

                <div className="relative">
                  {/* Icon with gradient background */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                    <span className="text-3xl filter drop-shadow-lg">{feature.icon}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>

                  <Link
                    href={`/${lang}/alerts/create`}
                    className="inline-flex items-center gap-1 mt-4 text-[rgb(81,91,195)] hover:gap-2 transition-all font-medium"
                  >
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative px-4 py-20 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Get started in just 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connection line for desktop */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-[rgb(81,91,195)] to-indigo-400 opacity-30"></div>

            {[
              { step: 1, title: 'Sign Up', desc: 'Create account with email, phone, or social login', icon: '👤' },
              { step: 2, title: 'Choose Service', desc: 'Select crypto, stocks, weather, or other services', icon: '🎯' },
              { step: 3, title: 'Set Conditions', desc: 'Define when you want to be alerted', icon: '⚡' },
              { step: 4, title: 'Get Notified', desc: 'Receive alerts via your preferred channels', icon: '🔔' },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-white dark:bg-gray-800 rounded-full shadow-lg mb-6 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-[rgb(81,91,195)] to-indigo-400 rounded-full opacity-10"></div>
                  <span className="text-3xl">{item.icon}</span>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[rgb(81,91,195)] to-indigo-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials/Benefits */}
      <section className="relative px-4 py-20 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-[rgb(81,91,195)] to-indigo-400 rounded-3xl p-12 lg:p-20 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20"></div>
            </div>

            <div className="relative">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">
                  Why Choose Alert.az?
                </h2>
                <p className="text-xl opacity-90">
                  The most reliable monitoring platform in Azerbaijan
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Real-time Monitoring</h3>
                  <p className="opacity-90">24/7 monitoring with instant notifications</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Bank-level Security</h3>
                  <p className="opacity-90">Your data is encrypted and secure</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                    <Bell className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Smart Alerts</h3>
                  <p className="opacity-90">Customizable conditions and channels</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 py-20 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of users who never miss important updates
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${lang}/register`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[rgb(81,91,195)] to-indigo-400 text-white rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all text-lg font-medium"
            >
              <Bell className="w-5 h-5" />
              Create Free Account
            </Link>
            <Link
              href={`/${lang}/pricing`}
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-[rgb(81,91,195)] hover:text-[rgb(81,91,195)] transition-all text-lg font-medium"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}