'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { Database } from '@/lib/supabase/types';

/**
 * Create a server action Supabase client for authentication actions
 * This is safe to use with cookies as it's in a server action file
 */
async function getSupabaseAction() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
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
}

/**
 * Server action to sign in
 */
export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await getSupabaseAction();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/');
}

/**
 * Server action to sign out
 */
export async function signOutAction() {
  const supabase = await getSupabaseAction();
  await supabase.auth.signOut();
  redirect('/login');
}

/**
 * Server action to sign up
 */
export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await getSupabaseAction();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: 'Check your email to confirm your account' };
}
