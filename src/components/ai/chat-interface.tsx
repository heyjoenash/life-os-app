'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, RefreshCw, AlertTriangle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ErrorInfo {
  message: string;
  type: 'quota' | 'rate_limit' | 'timeout' | 'auth' | 'general';
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error types
        let errorType: ErrorInfo['type'] = 'general';

        if (response.status === 401) {
          errorType = 'auth';
        } else if (response.status === 429) {
          errorType = 'rate_limit';
        } else if (response.status === 503 && data.details === 'API quota exceeded') {
          errorType = 'quota';
        } else if (response.status === 504) {
          errorType = 'timeout';
        }

        throw new Error(data.error || 'Failed to send message', {
          cause: { type: errorType },
        });
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Extract error type if available
      const errorType =
        error instanceof Error &&
        error.cause &&
        typeof error.cause === 'object' &&
        'type' in error.cause
          ? (error.cause.type as ErrorInfo['type'])
          : 'general';

      setError({
        message: error instanceof Error ? error.message : 'An error occurred',
        type: errorType,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setError(null);
  };

  // Get appropriate error message and action button
  const getErrorDisplay = () => {
    if (!error) return null;

    let actionButton = null;
    let description = '';

    switch (error.type) {
      case 'quota':
        description =
          'The AI service has reached its usage limit. This is usually a temporary issue.';
        actionButton = (
          <Button size="sm" variant="outline" className="mt-2" onClick={resetChat}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset Conversation
          </Button>
        );
        break;
      case 'rate_limit':
        description =
          'Too many requests to the AI service. Please wait a moment before trying again.';
        actionButton = (
          <Button size="sm" variant="outline" className="mt-2" onClick={() => setError(null)}>
            Try Again
          </Button>
        );
        break;
      case 'timeout':
        description =
          'The request took too long to complete. This might be due to high service load.';
        actionButton = (
          <Button size="sm" variant="outline" className="mt-2" onClick={() => sendMessage()}>
            Retry Request
          </Button>
        );
        break;
      case 'auth':
        description = 'You need to be logged in to use the AI assistant.';
        actionButton = (
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => (window.location.href = '/login')}
          >
            Log In
          </Button>
        );
        break;
      default:
        description = 'There was a problem connecting to the AI service.';
        actionButton = (
          <Button size="sm" variant="outline" className="mt-2" onClick={() => setError(null)}>
            Dismiss
          </Button>
        );
    }

    return (
      <div className="bg-red-50 text-red-700 p-3 rounded-lg max-w-[90%] mx-auto">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{error.message}</p>
            <p className="mt-1 text-sm text-red-600">{description}</p>
            {actionButton}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">AI Assistant</h3>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={resetChat} className="text-xs text-gray-500">
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Ask me anything about your day</div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'user' ? 'bg-primary-100 ml-auto' : 'bg-gray-100'
              } max-w-[80%] ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
            >
              {message.content}
            </div>
          ))
        )}

        {isLoading && (
          <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
            <div className="flex space-x-2">
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        {getErrorDisplay()}

        {/* Invisible element for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
