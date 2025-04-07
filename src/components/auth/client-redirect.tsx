'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClientRedirectProps {
  to: string;
}

/**
 * Client component to handle redirects without Next.js REDIRECT errors
 * Use this instead of server-side redirect() for auth
 */
export function ClientRedirect({ to }: ClientRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    router.push(to);
  }, [router, to]);

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-3">Redirecting to {to}...</div>
        <div className="flex justify-center">
          <div className="animate-spin h-5 w-5 border-2 border-primary-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    </div>
  );
}
