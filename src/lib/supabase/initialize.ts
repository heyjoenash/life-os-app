import { getAdminClient } from './admin';
import { MOCK_USER_ID } from '@/lib/utils/constants';

/**
 * Initialize the database schema with tables required for the application
 */
export async function initializeDatabase() {
  try {
    console.log('Initializing database schema...');

    // Check if admin client is available
    const adminClient = getAdminClient();
    if (!adminClient) {
      console.log('Skipping database initialization - admin client not available');
      return false;
    }

    // Create users table if it doesn't exist
    const { error: createUsersError } = await adminClient.rpc('exec_sql', {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.days (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          date DATE NOT NULL,
          daily_note TEXT,
          summary TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, date)
        );
      `,
    });

    if (createUsersError) {
      console.error('Error creating days table:', createUsersError);
      return false;
    }

    // Create todos table if it doesn't exist
    const { error: createTodosError } = await adminClient.rpc('exec_sql', {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.todos (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          day_id UUID REFERENCES public.days NOT NULL,
          title TEXT NOT NULL,
          is_completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    });

    if (createTodosError) {
      console.error('Error creating todos table:', createTodosError);
      return false;
    }

    // Create emails table if it doesn't exist
    const { error: createEmailsError } = await adminClient.rpc('exec_sql', {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.emails (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          day_id UUID REFERENCES public.days NOT NULL,
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
      `,
    });

    if (createEmailsError) {
      console.error('Error creating emails table:', createEmailsError);
      return false;
    }

    // Create indexes
    const { error: createIndexesError } = await adminClient.rpc('exec_sql', {
      sql_string: `
        CREATE INDEX IF NOT EXISTS idx_days_user_id ON public.days(user_id);
        CREATE INDEX IF NOT EXISTS idx_days_date ON public.days(date);
        CREATE INDEX IF NOT EXISTS idx_todos_day_id ON public.todos(day_id);
        CREATE INDEX IF NOT EXISTS idx_emails_day_id ON public.emails(day_id);
      `,
    });

    if (createIndexesError) {
      console.error('Error creating indexes:', createIndexesError);
      return false;
    }

    // Check if our mock user has any data
    const { data: existingDays, error: checkDaysError } = await adminClient
      .from('days')
      .select('id')
      .eq('user_id', MOCK_USER_ID)
      .limit(1);

    if (checkDaysError) {
      console.error('Error checking existing days:', checkDaysError);
      return false;
    }

    // Create sample data if none exists
    if (!existingDays || existingDays.length === 0) {
      console.log('Creating sample data...');

      // Create a day record for today
      const today = new Date().toISOString().split('T')[0];

      const { data: dayData, error: createDayError } = await adminClient
        .from('days')
        .insert({
          user_id: MOCK_USER_ID,
          date: today,
          daily_note: 'This is a sample note for testing.',
          summary: 'Sample summary for the day.',
        })
        .select()
        .single();

      if (createDayError) {
        console.error('Error creating sample day:', createDayError);
        return false;
      }

      // Create a few sample todos
      const { error: createTodosError } = await adminClient.from('todos').insert([
        {
          day_id: dayData.id,
          title: 'Complete database setup',
          is_completed: true,
        },
        {
          day_id: dayData.id,
          title: 'Implement todo functionality',
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
        return false;
      }

      console.log('Sample data created successfully!');
    } else {
      console.log('Sample data already exists. Skipping creation.');
    }

    console.log('Database initialization completed successfully!');
    return true;
  } catch (error) {
    console.error('Unexpected error during database initialization:', error);
    return false;
  }
}

/**
 * Check if the database is initialized
 */
export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    // Check if admin client is available
    const adminClient = getAdminClient();
    if (!adminClient) {
      console.log('Cannot check database initialization - admin client not available');
      // Return true to prevent initialization attempts
      return true;
    }

    // Check if the days table exists
    const { error } = await adminClient.from('days').select('id').limit(1);

    if (error) {
      console.error('Error checking database initialization:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking database initialization:', error);
    return false;
  }
}
