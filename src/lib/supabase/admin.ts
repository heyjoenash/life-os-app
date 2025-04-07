import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for testing
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xtouqvhsqcltuijceljm.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0b3VxdmhzcWNsdHVpamNlbGptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDAzMzg1MCwiZXhwIjoyMDU5NjA5ODUwfQ.AwwXRJuJK_jE1q-H-LCW8Fq2Z0mUC5n_BnNQbPaZtlo';

// Create a Supabase client with the Service Role key for admin operations
// Only create if the required environment variables are available
const supabaseAdmin =
  supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// Export a function that will safely use the admin client if available
export function getAdminClient() {
  if (!supabaseAdmin) {
    console.warn('Supabase admin client not initialized - missing environment variables');
    return null;
  }
  return supabaseAdmin;
}

export default supabaseAdmin;
