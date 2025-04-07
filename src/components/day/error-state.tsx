'use client';

import { Button } from '@/components/ui/button';
import { RefreshCcw, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface ErrorStateProps {
  message: string | null;
  title?: string;
  showRetryButton?: boolean;
}

/**
 * Client component for displaying error states with a refresh button
 */
export function ErrorState({
  message,
  title = 'Error loading day data',
  showRetryButton = true,
}: ErrorStateProps) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // Check for client-side auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // If we actually have a session but still see the auth error,
        // it could be a server-client sync issue, try refreshing
        if (message === 'NEXT_REDIRECT' || message?.includes('auth')) {
          window.location.reload();
        }
      }
      setIsCheckingAuth(false);
    };

    if (message === 'NEXT_REDIRECT' || message?.includes('auth')) {
      checkAuth();
    }
  }, [message]);

  if (!message) return null;

  // Check if it's a redirect error which likely means auth issues
  const isAuthError =
    message === 'NEXT_REDIRECT' ||
    message?.includes('authentication') ||
    message?.includes('auth') ||
    message?.includes('login');

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="bg-red-50 p-4 rounded-md text-red-800 my-4">
      <h3 className="text-lg font-bold mb-2">{isAuthError ? 'Authentication Required' : title}</h3>
      <p className="mb-2">{isAuthError ? 'You need to log in to access this page' : message}</p>
      <p>
        {isAuthError
          ? 'Please log in to view this content.'
          : 'You can still use the widgets below, but data may not be saved properly.'}
      </p>

      <div className="mt-4 flex gap-3">
        {isAuthError ? (
          <Button
            onClick={handleLogin}
            size="sm"
            variant="outline"
            className="bg-white flex items-center"
            disabled={isCheckingAuth}
          >
            <LogIn className="h-4 w-4 mr-2" />
            {isCheckingAuth ? 'Checking...' : 'Go to Login'}
          </Button>
        ) : (
          showRetryButton && (
            <Button
              onClick={handleRefresh}
              size="sm"
              variant="outline"
              className="bg-white flex items-center"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          )
        )}
      </div>
    </div>
  );
}

/**
 * Smaller error indicator with refresh button
 */
export function ErrorButton({ message }: { message: string | null }) {
  const router = useRouter();

  if (!message) return null;

  // Check if it's a redirect error which likely means auth issues
  const isAuthError =
    message === 'NEXT_REDIRECT' ||
    message?.includes('authentication') ||
    message?.includes('auth') ||
    message?.includes('login');

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="ml-4">
      <Button
        onClick={isAuthError ? handleLogin : handleRefresh}
        size="sm"
        variant="outline"
        className="flex items-center space-x-1"
      >
        {isAuthError ? (
          <>
            <LogIn className="h-4 w-4 mr-1" />
            Login
          </>
        ) : (
          <>
            <RefreshCcw className="h-4 w-4 mr-1" />
            Retry
          </>
        )}
      </Button>
    </div>
  );
}
