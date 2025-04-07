/**
 * Day-related types for Life OS
 *
 * These types provide a standardized way to work with day data
 * across the application.
 */

import type { Database } from '../supabase/types';

/**
 * Day record from the database
 */
export type Day = Database['public']['Tables']['days']['Row'];

/**
 * Data for updating a day record
 */
export type DayUpdate = Database['public']['Tables']['days']['Update'];

/**
 * Todo item related to a day
 */
export type Todo = Database['public']['Tables']['todos']['Row'];

/**
 * Email item related to a day
 */
export type Email = Database['public']['Tables']['emails']['Row'];

/**
 * Props for day-related components
 */
export interface DayComponentProps {
  date: string;
  dayId?: number;
}

/**
 * Props for components that display or edit day summaries
 */
export interface DailySummaryProps {
  date: string;
  initialSummary?: string | null;
}

/**
 * Props for components that display or edit day notes
 */
export interface DayNotesProps {
  date: string;
  initialValue?: string;
}

/**
 * Date validation regex (YYYY-MM-DD)
 */
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
