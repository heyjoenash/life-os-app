'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

/**
 * POST /api/debug/create-user
 * Creates a demo user for testing - only available in development
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoint not available in production' },
      { status: 403 },
    );
  }

  try {
    // Create a direct client
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Get request body
    const body = await request.json();
    const email = body.email || 'demo@example.com';
    const password = body.password || 'password123';

    // Create user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json({
          message: 'User already exists, try logging in with demo@example.com / password123',
          email,
          password,
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Demo user created',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      loginWith: {
        email,
        password,
      },
    });
  } catch (error) {
    console.error('Error creating demo user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
