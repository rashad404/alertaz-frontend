/**
 * Helper function to generate locale-aware paths
 * For 'az' locale, returns path without locale prefix
 * For other locales, returns path with locale prefix
 */
export function getLocalizedPath(locale: string, path: string = ''): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // For 'az' locale, return path without locale prefix
  if (locale === 'az') {
    return normalizedPath;
  }
  
  // For other locales, add locale prefix
  return `/${locale}${normalizedPath}`;
}

/**
 * Helper function to extract the base path from a localized path
 * Removes locale prefix if present
 */
export function getBasePath(pathname: string, locale: string): string {
  if (locale === 'az') {
    // For 'az', the pathname is already the base path
    return pathname;
  }
  
  // For other locales, remove the locale prefix
  const localePrefix = `/${locale}`;
  if (pathname.startsWith(localePrefix)) {
    return pathname.slice(localePrefix.length) || '/';
  }
  
  return pathname;
}