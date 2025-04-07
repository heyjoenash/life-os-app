'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

/**
 * Component for displaying and generating AI summaries of a day
 */
export function DailySummary({
  dayId,
  initialSummary = '',
}: {
  dayId?: string;
  initialSummary?: string;
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegenerateSummary = async () => {
    if (!dayId) {
      setError('Cannot generate summary: missing day ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ day_id: dayId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate summary: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred generating the summary');
      console.error('Error generating summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {!summary && !isLoading && (
        <div className="text-center py-4">
          <p className="text-gray-500 mb-4">No summary available yet.</p>
          <Button
            variant="outline"
            onClick={handleRegenerateSummary}
            disabled={isLoading || !dayId}
          >
            Generate Summary
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-primary-500" />
            <span className="text-gray-600">Generating summary...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleRegenerateSummary}
            disabled={isLoading || !dayId}
          >
            Try Again
          </Button>
        </div>
      )}

      {summary && !isLoading && (
        <div>
          <div className="prose prose-sm max-w-none">
            {summary.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerateSummary}
              disabled={isLoading || !dayId}
              className="text-xs flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
