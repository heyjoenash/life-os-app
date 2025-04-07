import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for testing
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xtouqvhsqcltuijceljm.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0b3VxdmhzcWNsdHVpamNlbGptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDAzMzg1MCwiZXhwIjoyMDU5NjA5ODUwfQ.AwwXRJuJK_jE1q-H-LCW8Fq2Z0mUC5n_BnNQbPaZtlo';

/**
 * POST /api/setup-database/disable-rls
 * Temporarily disable row-level security for development
 * WARNING: This should NEVER be used in production
 */
export async function POST(_request: NextRequest) {
  try {
    // Create a Supabase client with admin privileges
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // SQL to disable RLS
    const disableRlsScript = `
      -- Disable RLS for all tables during development
      ALTER TABLE IF EXISTS public.days DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.todos DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.emails DISABLE ROW LEVEL SECURITY;
    `;

    // Execute the disable RLS script
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql_string: disableRlsScript,
    });

    if (error) {
      console.error('Error disabling RLS:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Row-level security disabled for development',
    });
  } catch (error) {
    console.error('Error disabling RLS:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to disable RLS' },
      { status: 500 },
    );
  }
}
