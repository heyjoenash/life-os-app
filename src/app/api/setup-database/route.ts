import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { MOCK_USER_ID } from '@/lib/utils/constants';

// Create a database table setup script
const createTablesScript = `
-- Create days table (central table)
CREATE TABLE IF NOT EXISTS public.days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  daily_note TEXT,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create todos table
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES public.days(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emails table
CREATE TABLE IF NOT EXISTS public.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES public.days(id) ON DELETE CASCADE,
  subject TEXT,
  sender TEXT,
  recipient TEXT,
  content TEXT,
  received_at TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_days_user_id ON public.days(user_id);
CREATE INDEX IF NOT EXISTS idx_days_date ON public.days(date);
CREATE INDEX IF NOT EXISTS idx_todos_day_id ON public.todos(day_id);
CREATE INDEX IF NOT EXISTS idx_emails_day_id ON public.emails(day_id);
`;

/**
 * POST /api/setup-database
 * Initialize the database schema by creating necessary tables
 */
export async function POST(_request: NextRequest) {
  try {
    // Check for required environment variables
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Fallback to hardcoded values for testing purposes ONLY
    // SECURITY NOTE: In production, these should NEVER be hardcoded
    if (!supabaseUrl) {
      supabaseUrl = 'https://xtouqvhsqcltuijceljm.supabase.co';
    }

    if (!supabaseServiceKey) {
      // Consider how to provide this securely for testing
      // This is a temporary solution for development only
      supabaseServiceKey =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0b3VxdmhzcWNsdHVpamNlbGptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDAzMzg1MCwiZXhwIjoyMDU5NjA5ODUwfQ.AwwXRJuJK_jE1q-H-LCW8Fq2Z0mUC5n_BnNQbPaZtlo';
    }

    console.log('Supabase URL:', supabaseUrl?.substring(0, 20) + '...');
    console.log('Supabase Service Key exists:', !!supabaseServiceKey);

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          error: 'Missing environment variables',
          message: 'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required',
        },
        { status: 500 },
      );
    }

    // Create a Supabase client with admin privileges
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Execute the create tables script
    const { error: schemaError } = await supabaseAdmin.rpc('exec_sql', {
      sql_string: createTablesScript,
    });

    if (schemaError) {
      console.error('Error creating schema:', schemaError);
      return NextResponse.json({ error: schemaError.message }, { status: 500 });
    }

    // Create a sample day record for today
    const today = new Date().toISOString().split('T')[0];

    const { data: existingDay, error: checkDayError } = await supabaseAdmin
      .from('days')
      .select('id')
      .eq('user_id', MOCK_USER_ID)
      .eq('date', today)
      .maybeSingle();

    if (checkDayError) {
      console.error('Error checking for existing day:', checkDayError);
      return NextResponse.json({ error: checkDayError.message }, { status: 500 });
    }

    // Create a day record if it doesn't exist
    if (!existingDay) {
      const { data: dayData, error: createDayError } = await supabaseAdmin
        .from('days')
        .insert({
          user_id: MOCK_USER_ID,
          date: today,
          daily_note: 'This is a sample note created during database setup.',
          summary: 'Sample summary for the day.',
        })
        .select()
        .single();

      if (createDayError) {
        console.error('Error creating sample day:', createDayError);
        return NextResponse.json({ error: createDayError.message }, { status: 500 });
      }

      // Create sample todos
      const { error: createTodosError } = await supabaseAdmin.from('todos').insert([
        {
          day_id: dayData.id,
          title: 'Setup the database',
          is_completed: true,
        },
        {
          day_id: dayData.id,
          title: 'Add Todo functionality',
          is_completed: false,
        },
        {
          day_id: dayData.id,
          title: 'Test the application',
          is_completed: false,
        },
      ]);

      if (createTodosError) {
        console.error('Error creating sample todos:', createTodosError);
        return NextResponse.json({ error: createTodosError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully',
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initialize database' },
      { status: 500 },
    );
  }
}
