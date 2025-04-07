import { redirect } from 'next/navigation';
import { getTodayDate } from '@/lib/utils/date';

/**
 * Redirects /day to /day/YYYY-MM-DD where YYYY-MM-DD is today's date
 */
export default function DayRedirect() {
  // Get today's date using our utility
  const today = getTodayDate();

  // Redirect to the current date
  redirect(`/day/${today}`);
}
