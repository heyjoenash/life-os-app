import { supabase } from './client';
import fs from 'fs';
import path from 'path';

/**
 * Initialize the database schema
 *
 * This function reads the SQL schema file and executes it in chunks
 * to ensure the database is properly set up
 */
export async function initializeDatabase() {
  try {
    // Read the SQL file
    const schemaPath = path.join(process.cwd(), 'supabase', 'migrations', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0)
      .map((statement) => statement + ';');

    console.log(`Found ${statements.length} SQL statements to execute.`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        // Skip CREATE EXTENSION statements when running from client
        if (statement.includes('CREATE EXTENSION')) {
          console.log(`Skipping extension creation: ${statement}`);
          continue;
        }

        // Execute the statement
        const { error } = await supabase.rpc('exec_sql', {
          sql_string: statement,
        });

        if (error) {
          console.error(`Error executing statement ${i + 1}: ${error.message}`);
          console.error('Statement:', statement);
        } else {
          console.log(`Successfully executed statement ${i + 1}`);
        }
      } catch (error) {
        console.error(`Exception executing statement ${i + 1}:`, error);
        console.error('Statement:', statement);
      }
    }

    console.log('Database initialization completed.');
    return { success: true };
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return { success: false, error };
  }
}

/**
 * Check if the database schema is already initialized
 */
export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    // Check if the days table exists
    const { error } = await supabase.from('days').select('id').limit(1);

    if (error) {
      console.error('Error checking database initialization:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception checking database initialization:', error);
    return false;
  }
}

/**
 * Initialize the database schema if it doesn't exist
 */
export async function ensureDatabaseInitialized() {
  const isInitialized = await isDatabaseInitialized();

  if (!isInitialized) {
    console.log('Database schema not found. Initializing...');
    return initializeDatabase();
  }

  console.log('Database already initialized.');
  return { success: true };
}
