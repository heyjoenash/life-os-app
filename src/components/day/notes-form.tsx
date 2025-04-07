'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Component for editing day notes with auto-save functionality
 */
export function NotesForm({ dayId, initialValue = '' }: { dayId?: string; initialValue?: string }) {
  const [notes, setNotes] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update local state when initialValue changes
  useEffect(() => {
    setNotes(initialValue);
  }, [initialValue]);

  // Handle auto-save with debounce
  useEffect(() => {
    const saveNotes = async () => {
      if (!dayId) {
        console.log('NotesForm: No dayId provided, skipping save');
        setSaveStatus('error');
        setErrorMessage('Cannot save notes: missing day ID');
        return;
      }

      // Don't save if there's no change
      if (notes === initialValue) return;

      try {
        console.log('NotesForm: Saving notes for dayId:', dayId);
        setIsSaving(true);
        setSaveStatus('saving');
        setErrorMessage(null);

        // Save notes using the API
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            day_id: dayId,
            content: notes,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save notes: ${response.status}`);
        }

        console.log('NotesForm: Notes saved successfully');
        setSaveStatus('saved');

        // Reset to idle after 3 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      } catch (error) {
        console.error('NotesForm: Error saving notes:', error);
        setSaveStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to save notes');
      } finally {
        setIsSaving(false);
      }
    };

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a new timeout for debouncing (only if notes have changed)
    if (notes !== initialValue) {
      saveTimeoutRef.current = setTimeout(saveNotes, 1000);
    }

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes, dayId, initialValue]);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-500 mb-1">Your daily notes</h3>
      <textarea
        className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        placeholder="Type your notes for today..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={isSaving}
      />

      {/* Save status indicator */}
      <div className="flex justify-end items-center h-5 text-xs">
        {saveStatus === 'saving' && <span className="text-gray-500">Saving...</span>}
        {saveStatus === 'saved' && <span className="text-green-600">Saved</span>}
        {saveStatus === 'error' && <span className="text-red-600">Error: {errorMessage}</span>}
      </div>
    </div>
  );
}
