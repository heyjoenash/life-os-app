import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/notes
 * Get note for a specific day
 */
export async function GET(request: NextRequest) {
  try {
    // Get day_id from query parameter
    const { searchParams } = new URL(request.url);
    const dayId = searchParams.get('day_id');

    if (!dayId) {
      return NextResponse.json({ error: 'Missing day_id parameter' }, { status: 400 });
    }

    // Validate that dayId is a valid UUID or development ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const devIdRegex = /^dev-\d+$/;
    if (!uuidRegex.test(dayId) && !devIdRegex.test(dayId)) {
      return NextResponse.json({ error: 'Invalid day_id format' }, { status: 400 });
    }

    // Handle development IDs with mock data
    if (devIdRegex.test(dayId)) {
      return NextResponse.json({ dayId, content: '' });
    }

    try {
      // Create Supabase client
      const supabase = await createServerSupabaseClient();

      // Query for day record to get the note
      const { data, error } = await supabase
        .from('days')
        .select('id, daily_note')
        .eq('id', dayId)
        .single();

      if (error) {
        console.error('Error fetching note:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ dayId: data.id, content: data.daily_note });
    } catch (supabaseError) {
      console.error('Supabase error:', supabaseError);

      // For development without Supabase
      return NextResponse.json({ dayId, content: '' });
    }
  } catch (error) {
    console.error('Error getting note:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get note' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/notes
 * Save a note for a specific day
 */
export async function POST(request: NextRequest) {
  try {
    const { day_id, content } = await request.json();

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
      return NextResponse.json({ dayId: day_id, content });
    }

    try {
      // Create Supabase client
      const supabase = await createServerSupabaseClient();

      // Update the day record with the note
      const { data, error } = await supabase
        .from('days')
        .update({
          daily_note: content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', day_id)
        .select('id, daily_note')
        .single();

      if (error) {
        console.error('Error saving note:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ dayId: data.id, content: data.daily_note });
    } catch (supabaseError) {
      console.error('Supabase error:', supabaseError);

      // For development without Supabase
      return NextResponse.json({ dayId: day_id, content });
    }
  } catch (error) {
    console.error('Error saving note:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save note' },
      { status: 500 },
    );
  }
}
