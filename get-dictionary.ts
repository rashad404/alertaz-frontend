import 'server-only';
import type { Locale } from './i18n-config';

// We enumerate all dictionaries here for better linting and typescript support
const dictionaries = {
  az: () => import('./messages/az.json').then((module) => module.default),
  en: () => import('./messages/en.json').then((module) => module.default),
  ru: () => import('./messages/ru.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();