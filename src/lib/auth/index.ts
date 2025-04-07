/**
 * Auth utility exports for Life OS
 *
 * This is a backwards compatibility file - please import directly from:
 * - @/lib/supabase/client for client-side auth
 * - @/lib/supabase/server for server-side auth
 */

// Export client-side utilities for backwards compatibility
export * from './client';

// Export server-side utilities for backwards compatibility
export { createServerSupabaseClient, requireAuth, getCurrentUserId } from '@/lib/supabase/server';
