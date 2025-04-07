import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { MOCK_USER_ID } from '../../[date]/route';

// Define the day data interface
interface DayData {
  id: string;
  date: string;
  daily_note: string | null;
  [key: string]: any;
}

// Helper function to generate and save summary
async function generateAndSaveSummary(dayId: string, dayData: DayData) {
  // Create Supabase client
  const supabase = await createServerSupabaseClient();

  // Get todos for this day
  const { data: todos, error: todosError } = await supabase
    .from('todos')
    .select('*')
    .eq('day_id', dayId);

  if (todosError) {
    console.error('Error fetching todos for summary:', todosError);
    return NextResponse.json({ error: todosError.message }, { status: 500 });
  }

  // Generate a simple mock summary
  const todoSummary = todos?.length
    ? `${todos.length} tasks: ${todos.filter((t) => t.is_completed).length} completed, ${
        todos.filter((t) => !t.is_completed).length
      } pending`
    : 'No tasks';

  const notesSummary = dayData.daily_note
    ? `Notes: ${dayData.daily_note.substring(0, 50)}...`
    : 'No notes';

  const summary = `
Summary for ${dayData.date}:

• ${todoSummary}
• ${notesSummary}
• This is a mock summary generated for development.
`;

  // Save the summary
  const { data: updateResult, error: updateError } = await supabase
    .from('days')
    .update({
      summary,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dayId)
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
}

/**
 * POST /api/days/[date]/summary
 * Generate and save a summary for a specific date
 */
export async function POST(request: NextRequest, { params }: { params: { date: string } }) {
  try {
    // Properly await params in Next.js 15
    const { date } = await Promise.resolve(params);
    console.log('Summary API: Generating summary for date:', date);

    // Get the day ID first
    const supabase = await createServerSupabaseClient();

    // Try to get the day
    const { data: day, error: dayError } = await supabase
      .from('days')
      .select('id, date, daily_note')
      .eq('date', date)
      .eq('user_id', MOCK_USER_ID)
      .single();

    if (dayError) {
      if (dayError.code === 'PGSQL_ERROR_NO_DATA_FOUND') {
        // Create the day if it doesn't exist
        const { data: newDay, error: createError } = await supabase
          .from('days')
          .insert({
            date,
            user_id: MOCK_USER_ID,
          })
          .select('id, date, daily_note')
          .single();

        if (createError) {
          console.error('Error creating day record for summary:', createError);
          return NextResponse.json({ error: createError.message }, { status: 500 });
        }

        // Use the newly created day
        return generateAndSaveSummary(newDay.id, newDay);
      }

      console.error('Error fetching day for summary:', dayError);
      return NextResponse.json({ error: dayError.message }, { status: 500 });
    }

    // Generate and save summary for existing day
    return generateAndSaveSummary(day.id, day);
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate summary' },
      { status: 500 },
    );
  }
}
