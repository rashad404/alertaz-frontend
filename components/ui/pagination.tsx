import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  locale: string;
  baseUrl?: string;
  onPageChange?: (page: number) => void;
  className?: string;
  scrollToId?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  locale,
  baseUrl,
  onPageChange,
  className,
  scrollToId
}: PaginationProps) {
  const translations = {
    az: { previous: 'Əvvəlki', next: 'Növbəti' },
    en: { previous: 'Previous', next: 'Next' },
    ru: { previous: 'Предыдущая', next: 'Следующая' }
  };
  const t = translations[locale as keyof typeof translations] || translations.az;

  if (totalPages <= 1) return null;

  // Determine if we're using Links or buttons
  const useLinks = !!baseUrl;

  const getPageUrl = (page: number) => {
    if (!baseUrl) return '#';
    const url = page === 1 ? baseUrl : `${baseUrl}?page=${page}`;
    return scrollToId ? `${url}#${scrollToId}` : url;
  };

  const handleButtonClick = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
      // Scroll to element after state update
      if (scrollToId) {
        setTimeout(() => {
          const element = document.getElementById(scrollToId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  };

  const renderPageButton = (page: number) => {
    const isActive = currentPage === page;
    const pageUrl = getPageUrl(page);

    const buttonClass = cn(
      "w-10 h-10 rounded-lg transition-colors flex items-center justify-center cursor-pointer",
      isActive
        ? "bg-[#FF6021] text-white"
        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    );

    if (useLinks) {
      return (
        <Link
          key={page}
          href={pageUrl}
          scroll={true}
          shallow={false}
          className={buttonClass}
        >
          {page}
        </Link>
      );
    }

    return (
      <button
        key={page}
        onClick={() => handleButtonClick(page)}
        className={buttonClass}
      >
        {page}
      </button>
    );
  };

  const renderPrevious = () => {
    const prevPage = Math.max(1, currentPage - 1);
    const prevUrl = getPageUrl(prevPage);
    const isDisabled = currentPage === 1;

    const buttonClass = cn(
      "px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer",
      isDisabled && "opacity-50 cursor-not-allowed"
    );

    if (useLinks) {
      return (
        <Link
          href={currentPage === 2 ? baseUrl! : prevUrl}
          scroll={true}
          shallow={false}
          className={buttonClass}
        >
          {t.previous}
        </Link>
      );
    }

    return (
      <button
        onClick={() => handleButtonClick(prevPage)}
        disabled={isDisabled}
        className={buttonClass}
      >
        {t.previous}
      </button>
    );
  };

  const renderNext = () => {
    const nextPage = Math.min(totalPages, currentPage + 1);
    const nextUrl = getPageUrl(nextPage);
    const isDisabled = currentPage === totalPages;

    const buttonClass = cn(
      "px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer",
      isDisabled && "opacity-50 cursor-not-allowed"
    );

    if (useLinks) {
      return (
        <Link
          href={nextUrl}
          scroll={true}
          shallow={false}
          className={buttonClass}
        >
          {t.next}
        </Link>
      );
    }

    return (
      <button
        onClick={() => handleButtonClick(nextPage)}
        disabled={isDisabled}
        className={buttonClass}
      >
        {t.next}
      </button>
    );
  };

  return (
    <div className={cn("mt-8 flex justify-center items-center gap-2", className)}>
      {renderPrevious()}

      <div className="flex gap-1">
        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1;
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return renderPageButton(page);
          } else if (
            page === currentPage - 2 ||
            page === currentPage + 2
          ) {
            return (
              <span key={page} className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400">
                ...
              </span>
            );
          }
          return null;
        })}
      </div>

      {renderNext()}
    </div>
  );
}
