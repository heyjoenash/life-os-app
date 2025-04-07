'use server';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

/**
 * GET /api/debug
 * Debug endpoint for session status - only available in development
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoint not available in production' },
      { status: 403 },
    );
  }

  try {
    // Create a direct client without complex cookie handling
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xtouqvhsqcltuijceljm.supabase.co';
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0b3VxdmhzcWNsdHVpamNlbGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMzM4NTAsImV4cCI6MjA1OTYwOTg1MH0.Ig22W3nlQRASFM0m6c0e5uonAMH98I1BvdMwW_Tz_SY';

    console.log('Debug: Creating Supabase client with URL:', supabaseUrl);
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

    // Get session info
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    // Test a simple database query
    let dbStatus = 'Unknown';
    let dbError = null;
    let rowCount = 0;
    try {
      // Simple query to test the connection
      const { data, error } = await supabase.from('days').select('count').limit(1);

      if (error) {
        dbStatus = 'Error';
        dbError = error.message;
      } else {
        dbStatus = 'Connected';
        rowCount = data ? data.length : 0;
      }
    } catch (e) {
      dbStatus = 'Exception';
      dbError = e instanceof Error ? e.message : String(e);
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      hasSession: !!sessionData.session,
      sessionData: sessionData.session
        ? {
            userId: sessionData.session.user.id,
            email: sessionData.session.user.email,
            expires_at: sessionData.session.expires_at,
          }
        : null,
      sessionError: sessionError?.message,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : null,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? '****' : null,
      },
      database: {
        status: dbStatus,
        error: dbError,
        rowCount,
      },
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
