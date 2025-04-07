export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      days: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          daily_note: string | null;
          created_at: string;
          updated_at: string;
          summary: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          daily_note?: string | null;
          created_at?: string;
          updated_at?: string;
          summary?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          daily_note?: string | null;
          created_at?: string;
          updated_at?: string;
          summary?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'days_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      todos: {
        Row: {
          id: string;
          day_id: string;
          title: string;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          day_id: string;
          title: string;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          day_id?: string;
          title?: string;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'todos_day_id_fkey';
            columns: ['day_id'];
            referencedRelation: 'days';
            referencedColumns: ['id'];
          },
        ];
      };
      emails: {
        Row: {
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
        };
        Insert: {
          id?: string;
          day_id: string;
          subject?: string | null;
          sender?: string | null;
          recipient?: string | null;
          content?: string | null;
          received_at?: string | null;
          is_read?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          day_id?: string;
          subject?: string | null;
          sender?: string | null;
          recipient?: string | null;
          content?: string | null;
          received_at?: string | null;
          is_read?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'emails_day_id_fkey';
            columns: ['day_id'];
            referencedRelation: 'days';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_conversations: {
        Row: {
          id: string;
          day_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          day_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          day_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_conversations_day_id_fkey';
            columns: ['day_id'];
            referencedRelation: 'days';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_messages_conversation_id_fkey';
            columns: ['conversation_id'];
            referencedRelation: 'chat_conversations';
            referencedColumns: ['id'];
          },
        ];
      };
      content_embeddings: {
        Row: {
          id: string;
          content_type: string;
          content_id: string;
          day_id: string;
          embedding: number[] | null;
          content_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content_type: string;
          content_id: string;
          day_id: string;
          embedding?: number[] | null;
          content_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          content_type?: string;
          content_id?: string;
          day_id?: string;
          embedding?: number[] | null;
          content_text?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_embeddings_day_id_fkey';
            columns: ['day_id'];
            referencedRelation: 'days';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Export type aliases for ease of use
export type Day = Database['public']['Tables']['days']['Row'];
export type Email = Database['public']['Tables']['emails']['Row'];
export type Todo = Database['public']['Tables']['todos']['Row'];
export type ChatConversation = Database['public']['Tables']['chat_conversations']['Row'];
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
export type ContentEmbedding = Database['public']['Tables']['content_embeddings']['Row'];

// Insert types
export type DayInsert = Database['public']['Tables']['days']['Insert'];
export type EmailInsert = Database['public']['Tables']['emails']['Insert'];
export type TodoInsert = Database['public']['Tables']['todos']['Insert'];
export type ChatConversationInsert = Database['public']['Tables']['chat_conversations']['Insert'];
export type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert'];
export type ContentEmbeddingInsert = Database['public']['Tables']['content_embeddings']['Insert'];

// Update types
export type DayUpdate = Database['public']['Tables']['days']['Update'];
export type EmailUpdate = Database['public']['Tables']['emails']['Update'];
export type TodoUpdate = Database['public']['Tables']['todos']['Update'];
export type ChatConversationUpdate = Database['public']['Tables']['chat_conversations']['Update'];
export type ChatMessageUpdate = Database['public']['Tables']['chat_messages']['Update'];
export type ContentEmbeddingUpdate = Database['public']['Tables']['content_embeddings']['Update'];
