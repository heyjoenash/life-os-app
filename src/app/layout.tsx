import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { initializeDatabase, isDatabaseInitialized } from '@/lib/supabase/initialize';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Life OS',
  description: 'Your personal productivity and AI-assisted dashboard',
};

// Initialize database when server starts if environment variables are available
async function initDb() {
  try {
    // Check if required environment variables exist
    const hasRequiredEnvVars =
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!hasRequiredEnvVars) {
      console.log('Skipping database initialization - required environment variables missing');
      console.log(
        'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable database features',
      );
      return;
    }

    console.log('Checking database initialization status...');
    const isInitialized = await isDatabaseInitialized();

    if (!isInitialized) {
      console.log('Database not initialized. Starting initialization...');
      const success = await initializeDatabase();
      if (success) {
        console.log('Database initialized successfully!');
      } else {
        console.error('Failed to initialize database. Check the logs for details.');
      }
    } else {
      console.log('Database already initialized.');
    }
  } catch (error) {
    console.error('Error during database check/initialization:', error);
  }
}

// Trigger initialization without blocking app startup
initDb().catch((error) => {
  console.error('Unhandled error during database initialization:', error);
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
