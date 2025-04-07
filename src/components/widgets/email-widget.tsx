'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { WidgetContainer } from './widget-container';
import { Mail, Plus, Archive, Trash, Star, Clock } from 'lucide-react';

interface Email {
  id: string;
  day_id: string;
  subject: string | null;
  sender: string | null;
  recipient: string | null;
  content: string | null;
  received_at: string | null;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface EmailWidgetProps {
  dayId?: string;
  className?: string;
}

/**
 * Email Widget component for displaying emails for a specific day
 */
export function EmailWidget({ dayId, className }: EmailWidgetProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  // Load emails when the component mounts or dayId changes
  useEffect(() => {
    async function loadEmails() {
      if (!dayId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/emails?day_id=${dayId}`);

        if (!response.ok) {
          throw new Error(`Failed to load emails: ${response.status}`);
        }

        const data = await response.json();
        setEmails(data || []);
      } catch (err: unknown) {
        console.error('Error loading emails:', err);
        setError(err instanceof Error ? err.message : 'Failed to load emails');
      } finally {
        setIsLoading(false);
      }
    }

    loadEmails();
  }, [dayId]);

  // For now, this is a placeholder for composing a new email
  const handleComposeEmail = () => {
    // Mock creating a test email
    if (dayId) {
      createMockEmail(dayId);
    } else {
      console.log('Cannot compose email: No day ID available');
    }
  };

  // Create a mock email for testing
  const createMockEmail = async (dayId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day_id: dayId,
          subject: `Test Email ${new Date().toLocaleTimeString()}`,
          sender: 'test@example.com',
          recipient: 'you@example.com',
          content: 'This is a test email created for demonstration purposes.',
          received_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create email: ${response.status}`);
      }

      const newEmail = await response.json();
      setEmails([newEmail, ...emails]);
    } catch (err) {
      console.error('Error creating mock email:', err);
      setError(err instanceof Error ? err.message : 'Failed to create mock email');
    } finally {
      setIsLoading(false);
    }
  };

  // View an email
  const handleViewEmail = async (email: Email) => {
    // Mark as read if not already
    if (!email.is_read) {
      try {
        const response = await fetch('/api/emails', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: email.id,
            is_read: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to mark email as read: ${response.status}`);
        }

        // Update local state
        setEmails(emails.map((e) => (e.id === email.id ? { ...e, is_read: true } : e)));
      } catch (err) {
        console.error('Error marking email as read:', err);
      }
    }

    setSelectedEmail(email);
  };

  // Back to email list
  const handleBackToList = () => {
    setSelectedEmail(null);
  };

  // Archive email
  const handleArchiveEmail = async (email: Email) => {
    try {
      const response = await fetch('/api/emails', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: email.id,
          is_archived: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to archive email: ${response.status}`);
      }

      // Update local state
      setEmails(emails.map((e) => (e.id === email.id ? { ...e, is_archived: true } : e)));
      setSelectedEmail(null);
    } catch (err) {
      console.error('Error archiving email:', err);
      setError(err instanceof Error ? err.message : 'Failed to archive email');
    }
  };

  // Action button for the widget header
  const actionButton = (
    <Button size="sm" variant="ghost" onClick={handleComposeEmail}>
      <Plus className="h-4 w-4 mr-1" />
      Compose
    </Button>
  );

  // Email list display
  const renderEmailList = () => {
    if (emails.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Mail className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p>No emails for today</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {emails.map((email) => (
          <div
            key={email.id}
            className={`p-3 border rounded-md cursor-pointer transition-colors ${
              email.is_read
                ? 'border-gray-200 bg-white hover:bg-gray-50'
                : 'border-primary-200 bg-primary-50 hover:bg-primary-100'
            }`}
            onClick={() => handleViewEmail(email)}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="font-medium">{email.sender || 'Unknown'}</div>
              <div className="text-xs text-gray-500">
                {email.received_at
                  ? new Date(email.received_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Unknown time'}
              </div>
            </div>
            <div className="font-medium text-sm mb-1 truncate">
              {email.subject || '(No subject)'}
            </div>
            <div className="text-sm text-gray-600 truncate">
              {email.content?.substring(0, 100) || 'No content'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Email detail display
  const renderEmailDetail = () => {
    if (!selectedEmail) return null;

    return (
      <div>
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={handleBackToList}>
            &larr; Back to list
          </Button>
        </div>

        <div className="mb-4">
          <h4 className="text-xl font-medium mb-3">{selectedEmail.subject || '(No subject)'}</h4>

          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="font-medium">{selectedEmail.sender || 'Unknown'}</div>
              <div className="text-sm text-gray-500">
                To: {selectedEmail.recipient || 'Unknown'}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {selectedEmail.received_at
                ? new Date(selectedEmail.received_at).toLocaleString()
                : 'Unknown time'}
            </div>
          </div>

          <div className="flex space-x-2 mb-4">
            <Button size="sm" variant="ghost" onClick={() => handleArchiveEmail(selectedEmail)}>
              <Archive className="h-4 w-4 mr-1" />
              Archive
            </Button>
            <Button size="sm" variant="ghost">
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button size="sm" variant="ghost">
              <Star className="h-4 w-4 mr-1" />
              Star
            </Button>
            <Button size="sm" variant="ghost">
              <Clock className="h-4 w-4 mr-1" />
              Snooze
            </Button>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
          <p className="whitespace-pre-line">{selectedEmail.content || 'No content'}</p>
        </div>
      </div>
    );
  };

  return (
    <WidgetContainer
      title="Email"
      action={!selectedEmail ? actionButton : undefined}
      isLoading={isLoading}
      error={error}
      className={className}
    >
      {selectedEmail ? renderEmailDetail() : renderEmailList()}
    </WidgetContainer>
  );
}
