import OpenAI from 'openai';

/**
 * Create and configure the OpenAI client
 */
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('Missing OpenAI API key - features requiring AI will be limited');
}

// Create OpenAI client only if key is available
export const openai = apiKey ? new OpenAI({ apiKey }) : null;

/**
 * Generate an AI response for the chat interface
 */
export async function generateChatResponse(
  messages: { role: 'user' | 'assistant'; content: string }[],
) {
  try {
    // If no API key, return fallback response
    if (!openai) {
      console.log('No OpenAI API key available, returning fallback response');
      return {
        message:
          'AI features are currently unavailable. Please check your OpenAI API key configuration.',
        success: false,
      };
    }

    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return {
      message: chatCompletion.choices[0].message.content,
      success: true,
    };
  } catch (error) {
    console.error('Error generating chat response:', error);

    // Handle quota exceeded errors specifically
    if (
      error instanceof Error &&
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'insufficient_quota'
    ) {
      return {
        message:
          'The AI service quota has been exceeded. Please check your OpenAI account settings.',
        success: false,
      };
    }

    return {
      message: 'Sorry, I encountered an error while processing your request.',
      success: false,
    };
  }
}

/**
 * Generate embeddings for vector search
 */
export async function generateEmbedding(text: string) {
  try {
    // If no API key, return empty embedding
    if (!openai) {
      console.log('No OpenAI API key available, returning empty embedding');
      return {
        embedding: null,
        success: false,
      };
    }

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return {
      embedding: response.data[0].embedding,
      success: true,
    };
  } catch (error) {
    console.error('Error generating embedding:', error);
    return {
      embedding: null,
      success: false,
    };
  }
}
