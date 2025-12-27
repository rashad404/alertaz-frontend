/**
 * Date formatting utilities with timezone support
 * All run hours are stored in UTC in the database
 */

// Common timezones list
export const TIMEZONES = [
  { value: 'Asia/Baku', label: 'Bakı (GMT+4)' },
  { value: 'Europe/Moscow', label: 'Moskva (GMT+3)' },
  { value: 'Europe/Istanbul', label: 'İstanbul (GMT+3)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'Europe/Berlin', label: 'Berlin (GMT+1)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'America/Chicago', label: 'Chicago (GMT-6)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
];

// Custom month names for each locale (Intl.DateTimeFormat doesn't work well for az-AZ)
const monthNames: Record<string, string[]> = {
  az: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
};

export interface FormatDateOptions {
  includeTime?: boolean;
  locale?: string;
}

/**
 * Format a date string in a specific timezone
 * @param dateString - ISO date string or null
 * @param timezone - IANA timezone string (e.g., 'Asia/Baku')
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDateInTimezone(
  dateString: string | null | undefined,
  timezone: string = 'Asia/Baku',
  options: FormatDateOptions = {}
): string {
  if (!dateString) return '-';

  const { includeTime = false, locale = 'az' } = options;

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '-';
    }

    // Get date parts in the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';

    const day = getPart('day');
    const monthIndex = parseInt(getPart('month'), 10) - 1;
    const year = getPart('year');
    const hours = getPart('hour');
    const minutes = getPart('minute');

    const months = monthNames[locale] || monthNames.en;
    const month = months[monthIndex] || '';

    let result = `${day} ${month} ${year}`;
    if (includeTime) {
      result += `, ${hours}:${minutes}`;
    }

    return result;
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
}

/**
 * Format time only in a specific timezone
 * @param dateString - ISO date string or null
 * @param timezone - IANA timezone string
 * @returns Formatted time string (HH:MM)
 */
export function formatTimeInTimezone(
  dateString: string | null | undefined,
  timezone: string = 'Asia/Baku'
): string {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '-';
    }

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return formatter.format(date);
  } catch (error) {
    console.error('Time formatting error:', error);
    return '-';
  }
}

/**
 * Convert an hour from user's timezone to UTC
 * Used when saving run hours to database
 * @param hour - Hour in user's timezone (0-23)
 * @param fromTimezone - User's timezone
 * @returns Hour in UTC (0-23)
 */
export function convertHourToUTC(hour: number, fromTimezone: string): number {
  try {
    // Create a date with the hour in UTC
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    // Create a UTC date
    const utcDate = new Date(Date.UTC(year, month, day, hour, 0, 0));

    // Format in user's timezone to find the offset
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: fromTimezone,
      hour: '2-digit',
      hour12: false,
    });

    const localHour = parseInt(formatter.format(utcDate), 10);

    // Calculate the offset: if UTC hour 12 shows as 16 in Baku, offset is +4
    let offset = localHour - hour;

    // The hour we want in user timezone, we need to subtract the offset to get UTC
    let utcHour = hour - offset;

    // Normalize to 0-23 range
    if (utcHour < 0) utcHour += 24;
    if (utcHour >= 24) utcHour -= 24;

    return utcHour;
  } catch (error) {
    console.error('Hour to UTC conversion error:', error);
    return hour;
  }
}

/**
 * Convert an hour from UTC to user's timezone
 * Used when displaying run hours from database
 * @param utcHour - Hour in UTC (0-23)
 * @param toTimezone - User's timezone
 * @returns Hour in user's timezone (0-23)
 */
export function convertHourFromUTC(utcHour: number, toTimezone: string): number {
  try {
    // Create a date with the hour in UTC
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    const utcDate = new Date(Date.UTC(year, month, day, utcHour, 0, 0));

    // Format in user's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: toTimezone,
      hour: '2-digit',
      hour12: false,
    });

    return parseInt(formatter.format(utcDate), 10);
  } catch (error) {
    console.error('Hour from UTC conversion error:', error);
    return utcHour;
  }
}

/**
 * Convert run hours from UTC to user's timezone for display
 * @param startHour - Start hour in UTC (0-23)
 * @param endHour - End hour in UTC (0-23)
 * @param userTimezone - User's timezone
 * @returns Object with converted start and end hours, and formatted string
 */
export function convertRunHoursToTimezone(
  startHour: number | null | undefined,
  endHour: number | null | undefined,
  userTimezone: string
): { startHour: number; endHour: number; formatted: string } | null {
  if (startHour == null || endHour == null) {
    return null;
  }

  try {
    // Create dates in UTC
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    // Hours are stored in UTC, so create UTC dates directly
    const startDate = new Date(Date.UTC(year, month, day, startHour, 0, 0));
    const endDate = new Date(Date.UTC(year, month, day, endHour, 0, 0));

    // Format in user's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: userTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const startFormatted = formatter.format(startDate);
    const endFormatted = formatter.format(endDate);

    // Extract hours
    const startHourConverted = parseInt(startFormatted.split(':')[0], 10);
    const endHourConverted = parseInt(endFormatted.split(':')[0], 10);

    return {
      startHour: startHourConverted,
      endHour: endHourConverted,
      formatted: `${startFormatted} - ${endFormatted}`,
    };
  } catch (error) {
    console.error('Run hours conversion error:', error);
    return null;
  }
}

/**
 * Get the current time in a specific timezone
 * @param timezone - IANA timezone string
 * @returns Current time as Date object adjusted for display
 */
export function getCurrentTimeInTimezone(timezone: string = 'UTC'): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
}
