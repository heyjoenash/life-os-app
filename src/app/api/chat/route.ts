import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { openai } from '@/lib/ai/openai-client';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * POST /api/chat
 * Chat API endpoint that integrates with OpenAI
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get request body
    const { messages } = (await request.json()) as { messages?: ChatMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages must be an array' },
        { status: 400 },
      );
    }

    // Check if OpenAI client is available
    if (!openai) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please check your OpenAI API key.' },
        { status: 503 },
      );
    }

    try {
      // Call OpenAI API with timeout and error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const chatCompletion = await openai.chat.completions.create(
        {
          model: 'gpt-3.5-turbo',
          messages: messages.map((msg: ChatMessage) => ({
            role: msg.role,
            content: msg.content,
          })),
        },
        { signal: controller.signal },
      );

      clearTimeout(timeoutId);

      const responseMessage = chatCompletion.choices[0].message;

      return NextResponse.json({
        message: responseMessage.content,
      });
    } catch (openaiError: unknown) {
      console.error('Error calling OpenAI API:', openaiError);

      // Handle different OpenAI error types
      if (openaiError instanceof Error) {
        if (openaiError.name === 'AbortError') {
          return NextResponse.json(
            { error: 'Request timed out. Please try again.' },
            { status: 504 },
          );
        }

        // Handle OpenAI specific errors
        const apiError = openaiError as { code?: string; status?: number };

        if (apiError.code === 'insufficient_quota') {
          return NextResponse.json(
            {
              error:
                'AI service is currently unavailable due to quota limits. Please try again later.',
              details: 'API quota exceeded',
            },
            { status: 503 },
          );
        }

        if (apiError.status === 429) {
          return NextResponse.json(
            {
              error: 'Too many requests. Please try again in a moment.',
              details: 'Rate limit exceeded',
            },
            { status: 429 },
          );
        }
      }

      // Fallback error response
      return NextResponse.json(
        { error: 'Failed to generate AI response. Please try again.' },
        { status: 500 },
      );
    }
  } catch (error: unknown) {
    console.error('General error in chat API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Something went wrong';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
