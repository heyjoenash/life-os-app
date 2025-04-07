/**
 * API utilities for day record operations using Supabase
 */
import { Day, DayUpdate, DATE_REGEX } from '@/lib/types/day';

// Helper function to get the base URL for API calls
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return '';
  }

  // Server-side calls - use local absolute URL
  // Note: In Next.js, server components can use relative URLs for API routes
  return 'http://localhost:3000';
}

// Last resort function to try inserting directly with Supabase client
async function createDayWithClient(date: string): Promise<Day | null> {
  console.log('Direct client: Creating day with Supabase client for date:', date);

  // Create a direct client
  try {
    // Only import in this function to avoid issues with server/client rendering
    const { createClient } = await import('@supabase/supabase-js');

    // Create client with hardcoded credentials
    const supabaseUrl = 'https://xtouqvhsqcltuijceljm.supabase.co';
    const supabaseKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0b3VxdmhzcWNsdHVpamNlbGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMzM4NTAsImV4cCI6MjA1OTYwOTg1MH0.Ig22W3nlQRASFM0m6c0e5uonAMH98I1BvdMwW_Tz_SY';

    const supabase = createClient(supabaseUrl, supabaseKey);
    const userId = '29a03cc5-4c65-4ef8-a48b-f5cfe83a4c79'; // Development user ID

    // Try to insert the day
    console.log('Direct client: Attempting insert with:', { userId, date });
    const { data, error } = await supabase
      .from('days')
      .insert({
        date,
        user_id: userId,
        daily_note: '',
        summary: '',
      })
      .select()
      .single();

    if (error) {
      console.error('Direct client error creating day:', error);
      console.log(
        'Error details:',
        JSON.stringify({
          code: error.code,
          message: error.message,
          details: error.details,
        }),
      );
      return null;
    }

    console.log('Direct client: Successfully created day:', data.id);
    return data as Day;
  } catch (error) {
    console.error('Direct client unexpected error:', error);
    return null;
  }
}

/**
 * Get a day record by date
 * If no record exists, create a new one
 * @param date ISO date string (YYYY-MM-DD)
 * @returns The day record or null if there's an error
 */
export async function getDay(date: string): Promise<Day | null> {
  try {
    console.log('getDay: Starting for date:', date);

    // Validate date format
    if (!DATE_REGEX.test(date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    // Create an immediately available fallback for server-side failures
    const fallbackDay: Day = {
      id: `dev-${Date.now()}`,
      date,
      user_id: '29a03cc5-4c65-4ef8-a48b-f5cfe83a4c79',
      daily_note: '',
      summary: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${getBaseUrl()}/api/days/${date}`);
      console.log(
        `getDay: Fetched from ${getBaseUrl()}/api/days/${date} with status ${response.status}`,
      );

      // If we found it, return it
      if (response.ok) {
        const day = await response.json();
        console.log('getDay: Found day in database:', day.id);
        return day as Day;
      }

      // If we got a 404, create a new day
      if (response.status === 404) {
        console.log('getDay: Day not found, creating new day record');

        try {
          const createResponse = await fetch(`${getBaseUrl()}/api/days/${date}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });

          if (!createResponse.ok) {
            console.error(`Failed to create day record: ${createResponse.status}`);

            // If API fails, try to create directly with client
            console.log('getDay: API failed, trying direct client insertion...');
            const directDay = await createDayWithClient(date);
            if (directDay) {
              return directDay;
            }

            return fallbackDay;
          }

          const newDay = await createResponse.json();
          console.log('getDay: Created new day record:', newDay.id);
          return newDay as Day;
        } catch (createError) {
          console.error('Error creating day:', createError);

          // Try direct client if API errors
          console.log('getDay: Error in API, trying direct client insertion...');
          const directDay = await createDayWithClient(date);
          if (directDay) {
            return directDay;
          }

          return fallbackDay;
        }
      }

      // Handle any other errors gracefully
      console.error(`Failed to get day: ${response.status}`);

      // Try direct client as a last resort for other status codes
      console.log('getDay: Non-404 error, trying direct client insertion...');
      const directDay = await createDayWithClient(date);
      if (directDay) {
        return directDay;
      }

      return fallbackDay;
    } catch (fetchError) {
      console.error('Error fetching day:', fetchError);
      console.log('Using fallback day with development ID');

      // Try direct client if fetch failed
      console.log('getDay: Fetch error, trying direct client insertion...');
      const directDay = await createDayWithClient(date);
      if (directDay) {
        return directDay;
      }

      return fallbackDay;
    }
  } catch (error) {
    console.error('getDay: Unexpected error:', error);

    // Return a mock day as fallback for development
    const fallbackDay: Day = {
      id: `dev-${Date.now()}`,
      date,
      user_id: '29a03cc5-4c65-4ef8-a48b-f5cfe83a4c79',
      daily_note: '',
      summary: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return fallbackDay;
  }
}

/**
 * Create or update a day record
 * @param date ISO date string (YYYY-MM-DD)
 * @param data Data to update
 * @returns The updated day record
 */
export async function updateDay(date: string, data: Partial<DayUpdate>): Promise<Day> {
  try {
    console.log('updateDay: Starting for date:', date);

    // Create fallback day for any errors
    const fallbackDay: Day = {
      id: `dev-${Date.now()}`,
      date,
      user_id: '29a03cc5-4c65-4ef8-a48b-f5cfe83a4c79',
      daily_note: data.daily_note || '',
      summary: data.summary || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // Update the day through the API
      const response = await fetch(`${getBaseUrl()}/api/days/${date}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error(`Failed to update day: ${response.status}`);
        return fallbackDay;
      }

      const updatedDay = await response.json();
      console.log('updateDay: Updated day record:', updatedDay.id);
      return updatedDay as Day;
    } catch (fetchError) {
      console.error('Error updating day:', fetchError);
      console.log('Using fallback day with development ID');
      return fallbackDay;
    }
  } catch (error) {
    console.error('updateDay: Unexpected error:', error);

    // Return a mock day as fallback for development
    const fallbackDay: Day = {
      id: `dev-${Date.now()}`,
      date,
      user_id: '29a03cc5-4c65-4ef8-a48b-f5cfe83a4c79',
      daily_note: data.daily_note || '',
      summary: data.summary || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return fallbackDay;
  }
}

/**
 * Update the daily note for a day
 * @param date ISO date string (YYYY-MM-DD)
 * @param note The note content
 * @returns The updated day record
 */
export async function updateDailyNote(date: string, note: string): Promise<Day> {
  return updateDay(date, { daily_note: note });
}

/**
 * Generate an AI summary for a day
 * @param date ISO date string (YYYY-MM-DD)
 * @returns The generated summary
 */
export async function generateDailySummary(date: string): Promise<string> {
  try {
    console.log('generateDailySummary: Starting for date:', date);
    const defaultSummary = `This is a placeholder summary for ${date}. The summary feature is not available right now.`;

    try {
      const response = await fetch(`${getBaseUrl()}/api/days/${date}/summary`, {
        method: 'POST',
      });

      if (!response.ok) {
        console.error(`Failed to generate summary: ${response.status}`);
        return defaultSummary;
      }

      const data = await response.json();
      return data.summary || defaultSummary;
    } catch (fetchError) {
      console.error('Error generating summary:', fetchError);
      return defaultSummary;
    }
  } catch (error) {
    console.error('Failed to generate summary:', error);
    return `This is a placeholder summary for ${date}. The summary feature is not available right now.`;
  }
}
