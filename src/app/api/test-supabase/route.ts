import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/types';

/**
 * GET /api/test-supabase
 * Test endpoint to verify Supabase connection and operations
 */
export async function GET() {
  try {
    // Create a direct client with hardcoded credentials as fallback
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xtouqvhsqcltuijceljm.supabase.co';
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0b3VxdmhzcWNsdHVpamNlbGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMzM4NTAsImV4cCI6MjA1OTYwOTg1MH0.Ig22W3nlQRASFM0m6c0e5uonAMH98I1BvdMwW_Tz_SY';

    console.log('Test: Creating Supabase client with URL:', supabaseUrl);
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

    // Get the current timestamp to use in our test operations
    const timestamp = new Date().toISOString();
    const testUserId = '29a03cc5-4c65-4ef8-a48b-f5cfe83a4c79'; // Development user ID
    const testDate = '2025-04-07'; // Today's date

    // 1. Test database connection
    console.log('Test: Checking database connection...');
    const { error: testError } = await supabase.from('days').select('count').limit(1);

    if (testError) {
      return NextResponse.json(
        {
          success: false,
          step: 'connection',
          error: testError.message,
          hint: 'Database connection failed',
        },
        { status: 500 },
      );
    }

    // 2. Test inserting a record
    console.log('Test: Creating a test day record...');
    const { data: insertData, error: insertError } = await supabase
      .from('days')
      .insert({
        user_id: testUserId,
        date: testDate,
        daily_note: `Test note created at ${timestamp}`,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        {
          success: false,
          step: 'insert',
          error: insertError.message,
          code: insertError.code,
          hint: 'Could not insert record. If error is related to permission, check that RLS is disabled or properly configured.',
        },
        { status: 500 },
      );
    }

    // 3. Test fetching the record we just created
    console.log('Test: Fetching the created record...');
    const { error: fetchError } = await supabase
      .from('days')
      .select('*')
      .eq('id', insertData.id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        {
          success: false,
          step: 'fetch',
          error: fetchError.message,
          hint: 'Could not fetch the record that was just created',
          recordId: insertData.id,
        },
        { status: 500 },
      );
    }

    // 4. Test updating the record
    console.log('Test: Updating the record...');
    const { data: updateData, error: updateError } = await supabase
      .from('days')
      .update({
        daily_note: `Test note updated at ${timestamp}`,
      })
      .eq('id', insertData.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          step: 'update',
          error: updateError.message,
          hint: 'Could not update the record',
          recordId: insertData.id,
        },
        { status: 500 },
      );
    }

    // All tests passed
    return NextResponse.json({
      success: true,
      message: 'All Supabase operations completed successfully',
      timestamp,
      record: {
        id: updateData.id,
        date: updateData.date,
        note: updateData.daily_note,
      },
      rls: 'Disabled (or properly configured)',
    });
  } catch (error) {
    console.error('Test Supabase endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Unexpected error occurred during Supabase testing',
      },
      { status: 500 },
    );
  }
}
