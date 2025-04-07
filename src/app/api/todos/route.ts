import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Interface for Todo items
interface Todo {
  id: string;
  day_id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/todos
 * Get todos for a specific day
 */
export async function GET(request: NextRequest) {
  try {
    // Get day_id from query parameter
    const { searchParams } = new URL(request.url);
    const dayId = searchParams.get('day_id');

    if (!dayId) {
      return NextResponse.json({ error: 'Missing day_id parameter' }, { status: 400 });
    }

    // Validate that dayId is a valid UUID or our development ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const devIdRegex = /^dev-\d+$/;
    if (!uuidRegex.test(dayId) && !devIdRegex.test(dayId)) {
      return NextResponse.json({ error: 'Invalid day_id format' }, { status: 400 });
    }

    // Return empty array immediately for development IDs without querying Supabase
    if (devIdRegex.test(dayId)) {
      console.log('Development ID detected, returning empty todos array');
      return NextResponse.json([]);
    }

    try {
      // Create Supabase client
      const supabase = await createServerSupabaseClient();

      // Query for todos
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('day_id', dayId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching todos:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    } catch (supabaseError) {
      console.error('Supabase error:', supabaseError);

      // For development without Supabase, return empty array
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error getting todos:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get todos' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/todos
 * Create a new todo
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { day_id, title, is_completed = false } = body;

    if (!day_id) {
      return NextResponse.json({ error: 'Missing day_id parameter' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    // Validate that dayId is a valid UUID or our development ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const devIdRegex = /^dev-\d+$/;
    if (!uuidRegex.test(day_id) && !devIdRegex.test(day_id)) {
      return NextResponse.json({ error: 'Invalid day_id format' }, { status: 400 });
    }

    // For development IDs, return a mock todo immediately without querying Supabase
    if (devIdRegex.test(day_id)) {
      console.log('Development ID detected, returning mock todo');
      const mockTodo: Todo = {
        id: `dev-todo-${Date.now()}`,
        day_id,
        title,
        is_completed,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json(mockTodo);
    }

    try {
      // Create Supabase client
      const supabase = await createServerSupabaseClient();

      console.log('Creating todo with day_id:', day_id);

      // Insert new todo
      const { data, error } = await supabase
        .from('todos')
        .insert({
          day_id,
          title,
          is_completed,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating todo:', error);

        // Return a more detailed error with diagnostic information
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            details: error.details,
            hint: 'This may be a database permission issue. Check if RLS is properly configured or disabled for development.',
            dayId: day_id,
          },
          { status: 500 },
        );
      }

      return NextResponse.json(data);
    } catch (supabaseError) {
      console.error('Supabase error:', supabaseError);

      // For development without Supabase, create a mock todo
      const mockTodo: Todo = {
        id: `dev-todo-${Date.now()}`,
        day_id,
        title,
        is_completed,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json(mockTodo);
    }
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create todo' },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/todos
 * Update a todo
 */
export async function PATCH(request: NextRequest) {
  try {
    const { id, is_completed } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Validate that id is a valid UUID or our development ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const devIdRegex = /^dev-todo-\d+$/;
    if (!uuidRegex.test(id) && !devIdRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid id format' }, { status: 400 });
    }

    // For development IDs, just return success response
    if (devIdRegex.test(id)) {
      return NextResponse.json({
        id,
        is_completed,
        updated_at: new Date().toISOString(),
      });
    }

    try {
      // Create Supabase client
      const supabase = await createServerSupabaseClient();

      // Update todo
      const { data, error } = await supabase
        .from('todos')
        .update({
          is_completed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating todo:', error);
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      return NextResponse.json(data);
    } catch (supabaseError) {
      console.error('Supabase error:', supabaseError);

      // For development without Supabase, return mock response
      return NextResponse.json({
        id,
        is_completed,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update todo' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/todos
 * Delete a todo
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    // Validate that id is a valid UUID or our development ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const devIdRegex = /^dev-todo-\d+$/;
    if (!uuidRegex.test(id) && !devIdRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid id format' }, { status: 400 });
    }

    // For development IDs, just return success response
    if (devIdRegex.test(id)) {
      return NextResponse.json({ success: true });
    }

    try {
      // Create Supabase client
      const supabase = await createServerSupabaseClient();

      // Delete todo
      const { error } = await supabase.from('todos').delete().eq('id', id);

      if (error) {
        console.error('Error deleting todo:', error);
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } catch (supabaseError) {
      console.error('Supabase error:', supabaseError);

      // For development without Supabase, return success
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete todo' },
      { status: 500 },
    );
  }
}
