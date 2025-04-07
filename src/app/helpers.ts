'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types';

/**
 * Helper to get the server-side authentication state
 * This is safe to use with cookies as it's in a server action
 */
export async function getAuthState() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      },
    );

    const { data } = await supabase.auth.getSession();
    return {
      session: data.session,
      user: data.session?.user || null,
      isAuthenticated: !!data.session,
    };
  } catch (error) {
    console.error('Error getting auth state:', error);
    return {
      session: null,
      user: null,
      isAuthenticated: false,
    };
  }
}
