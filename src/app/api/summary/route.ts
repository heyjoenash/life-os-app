import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/summary
 * Generate a summary for a day and save it to the database
 */
export async function POST(request: NextRequest) {
  try {
    const { day_id } = await request.json();

    if (!day_id) {
      return NextResponse.json({ error: 'Missing day_id parameter' }, { status: 400 });
    }

    // Validate that day_id is a valid UUID or development ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const devIdRegex = /^dev-\d+$/;
    if (!uuidRegex.test(day_id) && !devIdRegex.test(day_id)) {
      return NextResponse.json({ error: 'Invalid day_id format' }, { status: 400 });
    }

    // Handle development IDs with mock data
    if (devIdRegex.test(day_id)) {
      const mockSummary = `Summary for development day:\n\n• No tasks yet\n• No notes recorded\n• This is a placeholder summary for development.`;
      return NextResponse.json({ id: day_id, summary: mockSummary });
    }

    try {
      // Create Supabase client
      const supabase = await createServerSupabaseClient();

      // Get day record to understand what to summarize
      const { data: day, error: dayError } = await supabase
        .from('days')
        .select('*')
        .eq('id', day_id)
        .single();

      if (dayError) {
        console.error('Error fetching day:', dayError);
        return NextResponse.json({ error: dayError.message }, { status: 500 });
      }

      // Get todos for this day
      const { data: todos, error: todosError } = await supabase
        .from('todos')
        .select('*')
        .eq('day_id', day_id);

      if (todosError) {
        console.error('Error fetching todos:', todosError);
        return NextResponse.json({ error: todosError.message }, { status: 500 });
      }

      // Generate a mock summary for now (would be replaced with real AI in production)
      const todoSummary =
        todos && todos.length > 0
          ? `${todos.length} tasks: ${todos.filter((t) => t.is_completed).length} completed, ${todos.filter((t) => !t.is_completed).length} pending`
          : 'No tasks for the day';

      const noteSummary = day.daily_note
        ? `You wrote ${day.daily_note.split(' ').length} words in your notes.`
        : 'No notes recorded';

      const summary = `
Summary for ${day.date}:

• ${todoSummary}
• ${noteSummary}
• This is a placeholder summary generated without AI. In production, this would be generated using OpenAI or a similar service.
      `;

      // Save the summary to the database
      const { data: updateResult, error: updateError } = await supabase
        .from('days')
        .update({
          summary,
          updated_at: new Date().toISOString(),
        })
        .eq('id', day_id)
        .select('id, summary')
        .single();

      if (updateError) {
        console.error('Error saving summary:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({
        id: updateResult.id,
        summary: updateResult.summary,
      });
    } catch (supabaseError) {
      console.error('Supabase error:', supabaseError);

      // For development without Supabase
      const mockSummary = `Summary for development day:\n\n• No tasks yet\n• No notes recorded\n• This is a placeholder summary for development.`;
      return NextResponse.json({ id: day_id, summary: mockSummary });
    }
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate summary' },
      { status: 500 },
    );
  }
}
