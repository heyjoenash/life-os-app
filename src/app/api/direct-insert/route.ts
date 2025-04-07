import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/direct-insert
 * Direct database insert test with admin privileges
 */
export async function GET() {
  console.log('Starting direct insert test...');

  // Create an ID for this test run
  const testId = Date.now().toString();

  try {
    // Create a client with the service role key (admin privileges)
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xtouqvhsqcltuijceljm.supabase.co';
    const supabaseKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0b3VxdmhzcWNsdHVpamNlbGptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDAzMzg1MCwiZXhwIjoyMDU5NjA5ODUwfQ.AwwXRJuJK_jE1q-H-LCW8Fq2Z0mUC5n_BnNQbPaZtlo';

    console.log(`Creating Supabase client with URL: ${supabaseUrl}`);
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // First, check if the 'days' table exists
    try {
      console.log('Testing connection with a simple query...');
      const { data: tablesData, error: tablesError } = await supabase.rpc('get_tables');

      if (tablesError) {
        console.error('Cannot get tables list:', tablesError);
        return NextResponse.json({
          success: false,
          stage: 'table_check',
          error: tablesError,
          message: 'Could not verify if tables exist',
        });
      } else {
        console.log('Available tables:', tablesData);
      }
    } catch (tableError) {
      console.error('Error checking tables:', tableError);
    }

    // Try a direct raw query first to check database connectivity
    console.log('Attempting raw SQL query...');
    try {
      const { data: rawData, error: rawError } = await supabase.rpc('exec_sql', {
        sql_string: 'SELECT NOW();',
      });

      if (rawError) {
        console.error('Raw SQL query failed:', rawError);
      } else {
        console.log('Raw SQL query result:', rawData);
      }
    } catch (rawQueryError) {
      console.error('Exception in raw query:', rawQueryError);
    }

    // Attempt to create a day record using direct insert
    console.log('Attempting direct insert to days table...');
    const userId = '29a03cc5-4c65-4ef8-a48b-f5cfe83a4c79'; // Development user ID
    const testDate = new Date().toISOString().split('T')[0]; // Today's date YYYY-MM-DD

    // First try to disable RLS
    try {
      console.log('Attempting to disable RLS temporarily...');
      const { error: rlsError } = await supabase.rpc('admin_disable_rls');

      if (rlsError) {
        console.error('Could not disable RLS:', rlsError);
      } else {
        console.log('RLS temporarily disabled');
      }
    } catch (rlsException) {
      console.error('Exception disabling RLS:', rlsException);
    }

    // Now try the insert with detailed error capture
    try {
      console.log(`Inserting record for date: ${testDate} and user: ${userId}`);
      const { data: insertData, error: insertError } = await supabase
        .from('days')
        .insert({
          user_id: userId,
          date: testDate,
          daily_note: `Test note created at ${testId}`,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.json({
          success: false,
          stage: 'insert',
          error: insertError,
          details: {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
          },
          params: { userId, testDate },
        });
      }

      console.log('Insert successful:', insertData);
      return NextResponse.json({
        success: true,
        message: 'Record inserted successfully',
        record: insertData,
      });
    } catch (insertException) {
      console.error('Exception during insert:', insertException);
      return NextResponse.json({
        success: false,
        stage: 'insert_exception',
        error: String(insertException),
        stack: insertException instanceof Error ? insertException.stack : undefined,
      });
    }
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        stage: 'setup',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
