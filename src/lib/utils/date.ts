/**
 * Date utility functions for Life OS
 */

import { DATE_REGEX } from '@/lib/types/day';

/**
 * Get today's date in YYYY-MM-DD format, with optional offset in days
 * @param offset Optional number of days to offset (e.g., -1 for yesterday, 1 for tomorrow)
 */
export function getTodayDate(offset: number = 0): string {
  const now = new Date();
  if (offset !== 0) {
    now.setDate(now.getDate() + offset);
  }
  return formatDateToISO(now);
}

/**
 * Format a date to YYYY-MM-DD
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get a human-readable date format
 */
export function formatDateForDisplay(dateStr: string): string {
  // Check date format validity
  if (!DATE_REGEX.test(dateStr)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  // Parse with timezone handling
  const dateObj = new Date(dateStr + 'T12:00:00Z');

  // Format for friendly display
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
export function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDateToISO(yesterday);
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
export function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateToISO(tomorrow);
}

/**
 * Check if a date string is valid
 */
export function isValidDateString(dateStr: string): boolean {
  if (!DATE_REGEX.test(dateStr)) {
    return false;
  }

  const dateObj = new Date(dateStr + 'T12:00:00Z');
  return !isNaN(dateObj.getTime());
}
