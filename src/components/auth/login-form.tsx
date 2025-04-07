'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      console.log('Attempting login with email:', email);
      setDebugInfo('Starting login process...');

      // Use debug test login for easier testing
      let loginEmail = email;
      let loginPassword = password;

      // Use demo account for testing if specified
      if (email === 'demo' || email === 'demo@example.com') {
        loginEmail = 'demo@example.com';
        loginPassword = 'password123';
        setDebugInfo('Using demo account credentials');
      }

      // Sign in directly with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        console.error('Login error:', error);
        setDebugInfo(`Auth error: ${error.message}`);
        throw error;
      }

      if (data?.session) {
        setDebugInfo(
          `Login successful! User ID: ${data.session.user.id.substring(0, 8)}... | Expires: ${data.session.expires_at ? new Date(data.session.expires_at * 1000).toString() : 'unknown'}`,
        );

        console.log('Login successful');
        console.log('Session data:', {
          userId: data.session.user.id,
          email: data.session.user.email,
          expiresAt: data.session.expires_at
            ? new Date(data.session.expires_at * 1000).toString()
            : 'unknown',
        });

        // Verify the session was stored correctly
        const verifySession = await supabase.auth.getSession();
        if (verifySession.data.session) {
          setDebugInfo((prevState) => `${prevState}\nSession verified in browser storage.`);
          console.log('Session verified in browser storage');
        } else {
          setDebugInfo(
            (prevState) => `${prevState}\nWARNING: Session not found in browser storage!`,
          );
          console.warn('WARNING: Session not found in browser storage after login!');
        }

        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push('/day');
          router.refresh();
        }, 500);
      } else {
        setError('Login returned no session data');
        setDebugInfo('No session in response');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      setError(error instanceof AuthError ? error.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const createDemoUser = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo('Creating demo user...');

    try {
      // Since we're using the client-side approach, just set the form fields
      setEmail('demo@example.com');
      setPassword('password123');
      setDebugInfo('Demo credentials filled. Click login to continue.');
    } catch (error) {
      console.error('Error setting demo user:', error);
      setError(error instanceof Error ? error.message : 'Failed to set demo user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      {debugInfo && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-md text-xs">
          <strong>Debug:</strong> {debugInfo}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Logging in...' : 'Log in'}
      </Button>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={createDemoUser}
          disabled={loading}
          className="mt-2"
        >
          Use Demo Account
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500 mt-2">
        <p>Demo account: demo@example.com / password123</p>
      </div>
    </form>
  );
}
