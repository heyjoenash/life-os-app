'use client';

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Create a single Supabase client for the browser
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? localStorage : undefined,
    },
  },
);
