'use client';

import React, { useState } from 'react';

interface SupabaseTestResult {
  success: boolean;
  message?: string;
  error?: any;
  stage?: string;
  record?: any;
  details?: any;
  [key: string]: any;
}

export default function DebugPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SupabaseTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testSupabase = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/direct-insert');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Debug Page</h1>

      <div className="mb-6">
        <button
          onClick={testSupabase}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Testing...' : 'Test Supabase Connection'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Result</h2>
          <div className="p-4 bg-gray-100 rounded">
            <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Manual API Tests</h2>
        <ul className="list-disc pl-5">
          <li className="mb-2">
            <a href="/api/direct-insert" target="_blank" className="text-blue-500 hover:underline">
              Test Direct Insert API
            </a>
          </li>
          <li className="mb-2">
            <a href="/api/debug" target="_blank" className="text-blue-500 hover:underline">
              Check Debug Info
            </a>
          </li>
          <li className="mb-2">
            <a href="/api/test-supabase" target="_blank" className="text-blue-500 hover:underline">
              Run Supabase Test Suite
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
