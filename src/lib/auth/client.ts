'use client';

/**
 * @deprecated - This file exists for backwards compatibility
 * Import directly from @/lib/supabase/client instead
 */

import { supabase } from '@/lib/supabase/client';
import type { Session } from '@supabase/supabase-js';

/**
 * Get the current user session on the client
 * Returns null if not authenticated
 */
export async function getClientSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('getClientSession error:', error);
    return null;
  }
  return data.session;
}

/**
 * Helper function to check if user is authenticated on client
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getClientSession();
  return !!session;
}

/**
 * Sign in with email and password on client
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * Sign out user on client
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * Create a new user account
 */
export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error signing up:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
