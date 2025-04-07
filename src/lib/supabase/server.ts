import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { Database } from './types';

// Check if Supabase environment variables are available
// Add fallbacks for local development
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xtouqvhsqcltuijceljm.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0b3VxdmhzcWNsdHVpamNlbGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMzM4NTAsImV4cCI6MjA1OTYwOTg1MH0.Ig22W3nlQRASFM0m6c0e5uonAMH98I1BvdMwW_Tz_SY';

const hasSupabaseCredentials = !!supabaseUrl && !!supabaseAnonKey;

/**
 * Create a Supabase client for server components
 * In Next.js 15.2.4, cookies can only be modified in Server Actions or Route Handlers
 */
export async function createServerSupabaseClient() {
  if (!hasSupabaseCredentials) {
    console.warn('Missing Supabase credentials - returning null client');
    throw new Error('Supabase credentials not available');
  }

  try {
    // In Next.js 15.2.4, cookies() is async and must be awaited
    const cookieStore = await cookies();

    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          try {
            // Get cookie value safely - reading is allowed
            const cookie = cookieStore.get(name);
            return cookie?.value;
          } catch (error) {
            console.error('Error getting cookie:', error);
            return undefined;
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // In server components, we can only read cookies, not set them
            // This will work in API routes and Server Actions, but fail silently elsewhere
            if (typeof cookieStore.set === 'function') {
              cookieStore.set({ name, value, ...options });
            }
          } catch (error) {
            // Safely catch errors without breaking the app
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // In server components, we can only read cookies, not modify them
            // This will work in API routes and Server Actions, but fail silently elsewhere
            if (typeof cookieStore.set === 'function') {
              cookieStore.set({ name, value: '', ...options });
            }
          } catch (error) {
            // Safely catch errors without breaking the app
            console.error('Error removing cookie:', error);
          }
        },
      },
    });
  } catch (error) {
    console.error('Error creating server supabase client:', error);
    throw new Error(
      `Failed to create Supabase client: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Require authentication and redirect to login if not authenticated
 * Use this in server components or page components that require authentication
 */
export async function requireAuth() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect('/login');
    }

    return session;
  } catch (error) {
    console.error('Error in requireAuth:', error);
    redirect('/login');
  }
}

/**
 * Get the current user's ID or use a placeholder for development
 */
export async function getUserId(): Promise<string> {
  if (!hasSupabaseCredentials) {
    // For development without Supabase
    return '29a03cc5-4c65-4ef8-a48b-f5cfe83a4c79';
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user?.id) {
      return session.user.id;
    }

    // For development when not authenticated
    return '29a03cc5-4c65-4ef8-a48b-f5cfe83a4c79';
  } catch (error) {
    console.error('Error getting user ID:', error);
    // For development when Supabase fails
    return '29a03cc5-4c65-4ef8-a48b-f5cfe83a4c79';
  }
}
