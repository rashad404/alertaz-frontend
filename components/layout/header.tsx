'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Bell, Globe, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface Service {
  name: string;
  icon: string;
  path: string;
  description: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentLang, setCurrentLang] = useState('az');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const services: Service[] = [
    { name: 'Crypto Monitor', icon: '₿', path: '/alerts/create?type=crypto', description: 'Track cryptocurrency prices' },
    { name: 'Weather Alerts', icon: '☁️', path: '/alerts/create?type=weather', description: 'Weather condition monitoring' },
    { name: 'Website Monitor', icon: '🌐', path: '/alerts/create?type=website', description: 'Website uptime tracking' },
    { name: 'Stock Market', icon: '📈', path: '/alerts/create?type=stock', description: 'Stock price alerts' },
    { name: 'Currency Rates', icon: '💱', path: '/alerts/create?type=currency', description: 'Exchange rate monitoring' },
  ];

  const languages = [
    { code: 'az', name: 'AZ', flag: '🇦🇿' },
    { code: 'en', name: 'EN', flag: '🇬🇧' },
    { code: 'ru', name: 'RU', flag: '🇷🇺' },
  ];

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLang = (lang: string) => {
    setCurrentLang(lang);
    // Here you would typically update i18n context or cookie
    localStorage.setItem('language', lang);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg'
        : 'bg-white dark:bg-gray-900'
    }`}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[rgb(81,91,195)] to-indigo-400 rounded-lg blur group-hover:blur-md transition-all"></div>
                <div className="relative bg-gradient-to-r from-[rgb(81,91,195)] to-indigo-400 text-white font-bold text-xl px-3 py-1 rounded-lg">
                  <Bell className="w-5 h-5 inline-block mr-1" />
                  Alert.az
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`font-medium transition-colors hover:text-[rgb(81,91,195)] ${
                pathname === '/' ? 'text-[rgb(81,91,195)]' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Home
            </Link>

            {/* Services Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setIsServicesOpen(true)}
                onMouseLeave={() => setIsServicesOpen(false)}
                className="flex items-center space-x-1 font-medium text-gray-700 dark:text-gray-300 hover:text-[rgb(81,91,195)] transition-colors"
              >
                <span>Services</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isServicesOpen && (
                <div
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onMouseLeave={() => setIsServicesOpen(false)}
                  className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {services.map((service) => (
                    <Link
                      key={service.path}
                      href={service.path}
                      className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{service.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {service.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {service.description}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/alerts"
              className={`font-medium transition-colors hover:text-[rgb(81,91,195)] ${
                pathname === '/alerts' ? 'text-[rgb(81,91,195)]' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              My Alerts
            </Link>

            <Link
              href="/pricing"
              className={`font-medium transition-colors hover:text-[rgb(81,91,195)] ${
                pathname === '/pricing' ? 'text-[rgb(81,91,195)]' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Pricing
            </Link>

            <Link
              href="/docs"
              className={`font-medium transition-colors hover:text-[rgb(81,91,195)] ${
                pathname === '/docs' ? 'text-[rgb(81,91,195)]' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Docs
            </Link>
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{currentLang.toUpperCase()}</span>
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLang(lang.code)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      currentLang === lang.code ? 'bg-gray-50 dark:bg-gray-700' : ''
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* Auth Buttons / User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <User className="w-5 h-5" />
                  <ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings/profile"
                    className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Profile Settings
                  </Link>
                  <Link
                    href="/settings/notifications"
                    className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Notifications
                  </Link>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-[rgb(81,91,195)] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gradient-to-r from-[rgb(81,91,195)] to-indigo-400 text-white font-medium rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/alerts"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                My Alerts
              </Link>
              <Link
                href="/pricing"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Docs
              </Link>

              <hr className="border-gray-200 dark:border-gray-700" />

              <div className="px-4 py-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Services</div>
                {services.map((service) => (
                  <Link
                    key={service.path}
                    href={service.path}
                    className="flex items-center space-x-2 py-2 text-gray-700 dark:text-gray-300 hover:text-[rgb(81,91,195)] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{service.icon}</span>
                    <span>{service.name}</span>
                  </Link>
                ))}
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              <div className="flex items-center justify-between px-4">
                <div className="flex items-center space-x-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLang(lang.code)}
                      className={`px-2 py-1 text-sm font-medium rounded ${
                        currentLang === lang.code
                          ? 'bg-[rgb(81,91,195)] text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
                <ThemeToggle />
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings/profile"
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="mx-4 py-2 text-red-600 text-center border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-4">
                  <Link
                    href="/login"
                    className="py-2 text-center text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="py-2 text-center bg-gradient-to-r from-[rgb(81,91,195)] to-indigo-400 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}