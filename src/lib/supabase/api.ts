import { supabase } from './client';
import {
  Day,
  DayInsert,
  DayUpdate,
  Email,
  EmailInsert,
  EmailUpdate,
  ChatConversation,
  ChatConversationInsert,
  ChatMessage,
  ChatMessageInsert,
} from './types';

// ===== Days API =====

/**
 * Get a day record by date for the current user
 */
export async function getDayByDate(date: string, userId: string): Promise<Day | null> {
  const { data, error } = await supabase
    .from('days')
    .select('*')
    .eq('date', date)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching day:', error);
    return null;
  }

  return data;
}

/**
 * Create a new day record
 */
export async function createDay(day: DayInsert): Promise<Day | null> {
  const { data, error } = await supabase.from('days').insert(day).select().single();

  if (error) {
    console.error('Error creating day:', error);
    return null;
  }

  return data;
}

/**
 * Update a day record
 */
export async function updateDay(id: string, updates: DayUpdate): Promise<Day | null> {
  const { data, error } = await supabase
    .from('days')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating day:', error);
    return null;
  }

  return data;
}

/**
 * Get or create a day record by date
 */
export async function getOrCreateDay(date: string, userId: string): Promise<Day | null> {
  // First try to get the day
  const existingDay = await getDayByDate(date, userId);

  if (existingDay) {
    return existingDay;
  }

  // If day doesn't exist, create it
  return createDay({
    date,
    user_id: userId,
  });
}

// ===== Emails API =====

/**
 * Get emails for a specific day
 */
export async function getEmailsByDay(dayId: string): Promise<Email[]> {
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('day_id', dayId)
    .order('received_at', { ascending: false });

  if (error) {
    console.error('Error fetching emails:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a new email
 */
export async function createEmail(email: EmailInsert): Promise<Email | null> {
  const { data, error } = await supabase.from('emails').insert(email).select().single();

  if (error) {
    console.error('Error creating email:', error);
    return null;
  }

  return data;
}

/**
 * Update an email
 */
export async function updateEmail(id: string, updates: EmailUpdate): Promise<Email | null> {
  const { data, error } = await supabase
    .from('emails')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating email:', error);
    return null;
  }

  return data;
}

// ===== Chat API =====

/**
 * Get a conversation for a specific day, or create one if it doesn't exist
 */
export async function getOrCreateConversation(dayId: string): Promise<ChatConversation | null> {
  // First try to get existing conversation
  const { data: existingConversation, error: fetchError } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('day_id', dayId)
    .single();

  if (!fetchError && existingConversation) {
    return existingConversation;
  }

  // Create a new conversation if one doesn't exist
  const { data: newConversation, error: createError } = await supabase
    .from('chat_conversations')
    .insert({ day_id: dayId })
    .select()
    .single();

  if (createError) {
    console.error('Error creating conversation:', createError);
    return null;
  }

  return newConversation;
}

/**
 * Get messages for a specific conversation
 */
export async function getMessagesByConversation(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}

/**
 * Add a message to a conversation
 */
export async function addMessage(message: ChatMessageInsert): Promise<ChatMessage | null> {
  const { data, error } = await supabase.from('chat_messages').insert(message).select().single();

  if (error) {
    console.error('Error adding message:', error);
    return null;
  }

  return data;
}
