"use client";

import { useTimezone } from "@/providers/timezone-provider";
import { formatDateInTimezone, formatTimeInTimezone } from "@/lib/utils/date";

interface FormattedDateProps {
  date: string | null | undefined;
  includeTime?: boolean;
  locale?: string;
  className?: string;
}

export function FormattedDate({ date, includeTime = false, locale = "az", className }: FormattedDateProps) {
  const { timezone, mounted } = useTimezone();

  if (!mounted) {
    // Return placeholder during SSR to prevent hydration mismatch
    return <span className={className}>-</span>;
  }

  const formatted = formatDateInTimezone(date, timezone, { includeTime, locale });
  return <span className={className}>{formatted}</span>;
}

interface FormattedTimeProps {
  date: string | null | undefined;
  className?: string;
}

export function FormattedTime({ date, className }: FormattedTimeProps) {
  const { timezone, mounted } = useTimezone();

  if (!mounted) {
    return <span className={className}>-</span>;
  }

  const formatted = formatTimeInTimezone(date, timezone);
  return <span className={className}>{formatted}</span>;
}
