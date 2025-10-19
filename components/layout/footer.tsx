'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Bell,
  Mail,
  MapPin,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Send
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubscribed(true);
    setIsSubscribing(false);
    setEmail('');

    // Reset success message after 3 seconds
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: 'Crypto Monitor', href: '/alerts/create?type=crypto' },
      { name: 'Weather Alerts', href: '/alerts/create?type=weather' },
      { name: 'Website Monitor', href: '/alerts/create?type=website' },
      { name: 'Stock Alerts', href: '/alerts/create?type=stock' },
      { name: 'Currency Rates', href: '/alerts/create?type=currency' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' },
      { name: 'Press', href: '/press' },
      { name: 'Partners', href: '/partners' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'Status', href: '/status' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Security', href: '/security' },
      { name: 'Compliance', href: '/compliance' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/alertaz' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/alertaz' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/alertaz' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/alertaz' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@alertaz' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/alertaz' },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[rgb(81,91,195)] to-indigo-400 rounded-lg blur"></div>
                <div className="relative bg-gradient-to-r from-[rgb(81,91,195)] to-indigo-400 text-white font-bold text-xl px-3 py-1 rounded-lg">
                  <Bell className="w-5 h-5 inline-block mr-1" />
                  Alert.az
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your intelligent monitoring and notification platform. Track crypto, weather, websites, stocks, and currency rates with real-time alerts delivered to your preferred channels.
            </p>

            {/* Newsletter Subscription */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Subscribe to our newsletter
              </h3>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(81,91,195)] focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="px-4 py-2 bg-gradient-to-r from-[rgb(81,91,195)] to-indigo-400 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {isSubscribing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
              {isSubscribed && (
                <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                  Successfully subscribed to newsletter!
                </p>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-[rgb(81,91,195)]" />
                <a href="mailto:info@alert.az" className="hover:text-[rgb(81,91,195)] transition-colors">
                  info@alert.az
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-[rgb(81,91,195)]" />
                <a href="tel:+994123456789" className="hover:text-[rgb(81,91,195)] transition-colors">
                  +994 12 345 67 89
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-[rgb(81,91,195)]" />
                <span>Baku, Azerbaijan</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-8 lg:col-span-3">
            {/* Services */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Services</h3>
              <ul className="space-y-2">
                {footerLinks.services.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-[rgb(81,91,195)] transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-[rgb(81,91,195)] transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-[rgb(81,91,195)] transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-[rgb(81,91,195)] transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-center sm:text-left">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © {currentYear} Alert.az. All rights reserved.
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                Made with ❤️ in Azerbaijan
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-[rgb(81,91,195)] hover:text-white transition-all group"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tech Stack Badge */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-500">
          <span className="flex items-center gap-1">
            Built with
          </span>
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">Next.js</span>
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">Laravel</span>
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">TypeScript</span>
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">Tailwind CSS</span>
        </div>
      </div>
    </footer>
  );
}