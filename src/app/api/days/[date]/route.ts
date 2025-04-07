import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getUserId } from '@/lib/supabase/server';
import { MOCK_USER_ID } from '@/lib/utils/constants';

/**
 * GET /api/days/[date]
 * Get a day record for a specific date
 */
export async function GET(
  request: NextRequest,
  context: { params: { date: string } }
) {
  try {
    // Properly await params in Next.js 15
    const { date } = await Promise.resolve(context.params);
    console.log('Days API: Getting day for date:', date);

    try {
      // Create Supabase client
      const supabase = await createServerSupabaseClient();
      const userId = await getUserId();

      // Query for the day record
      const { data, error } = await supabase
        .from('days')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();

      if (error) {
        console.error('Error fetching day:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Handle case where no data is found
      if (!data) {
        return NextResponse.json({ message: 'Day not found' }, { status: 404 });
      }

      return NextResponse.json(data);
    } catch (supabaseError) {
      console.error('Supabase error:', supabaseError);

      // Generate a mock response for development without Supabase
      const mockDay = {
        id: `dev-${Date.now()}`,
        date,
        user_id: '29a03cc5-4c65-4ef8-a48b-f5cfe83a4c79',
        daily_note: '',
        summary: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json(mockDay);
    }
  } catch (error) {
    console.error('Error getting day:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get day' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/days/[date]
 * Create or update a day record
 */
export async function POST(
  request: NextRequest,
  context: { params: { date: string } }
) {
  try {
    // Properly await params in Next.js 15
    const { date } = await Promise.resolve(context.params);
    console.log('Days API: Creating/updating day for date:', date);

    let body: { daily_note?: string; summary?: string } = {};
    try {
      body = await request.json();
    } catch {
      console.log('No body provided or invalid JSON, using empty object');
    }

    try {
      // Create Supabase client
      const supabase = await createServerSupabaseClient();
      const userId = await getUserId();

      console.log('Days API: Using userId:', userId);
      console.log('Days API: Creating with date:', date);

      // Check if the day record already exists
      console.log('Days API: Checking if day exists for date:', date, 'and userId:', userId);
      const { data: existingDay, error: queryError } = await supabase
        .from('days')
        .select('id')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when no records exist

      if (queryError) {
        console.error('Error checking existing day:', queryError);
        console.log(
          'Error details:',
          JSON.stringify({
            code: queryError.code,
            message: queryError.message,
            details: queryError.details,
          }),
        );
        return NextResponse.json(
          {
            error: queryError.message,
            code: queryError.code,
            details: queryError.details,
            hint: 'Database query error when checking for existing day',
          },
          { status: 500 },
        );
      }

      // Log result of the check
      console.log('Days API: Existing day found?', !!existingDay, existingDay?.id || 'none');

      let result;

      if (existingDay) {
        // Update existing day
        console.log('Days API: Updating existing day:', existingDay.id);
        const { data, error } = await supabase
          .from('days')
          .update({
            ...body,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDay.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating day:', error);
          console.log(
            'Error details:',
            JSON.stringify({
              code: error.code,
              message: error.message,
              details: error.details,
            }),
          );
          return NextResponse.json(
            {
              error: error.message,
              code: error.code,
              details: error.details,
              hint: 'Database update error for existing day',
            },
            { status: 500 },
          );
        }

        result = data;
      } else {
        // Create new day
        console.log(
          'Days API: Creating new day with data:',
          JSON.stringify({
            user_id: userId,
            date,
            ...body,
          }),
        );

        const { data, error } = await supabase
          .from('days')
          .insert({
            user_id: userId,
            date,
            ...body,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating day:', error);
          console.log(
            'Error details:',
            JSON.stringify({
              code: error.code,
              message: error.message,
              details: error.details,
            }),
          );

          // Return more detailed error
          return NextResponse.json(
            {
              error: error.message,
              code: error.code,
              details: error.details,
              hint: 'Database insertion error for new day. Check if the table exists and RLS is properly configured.',
            },
            { status: 500 },
          );
        }

        result = data;
      }

      console.log('Days API: Successfully completed operation. Result ID:', result?.id);
      return NextResponse.json(result);
    } catch (supabaseError) {
      console.error('Supabase error:', supabaseError);
      console.log('Error details:', JSON.stringify(supabaseError));

      // Generate a mock response for development without Supabase
      const mockDay = {
        id: `dev-${Date.now()}`,
        date,
        user_id: '29a03cc5-4c65-4ef8-a48b-f5cfe83a4c79',
        daily_note: body.daily_note || '',
        summary: body.summary || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Days API: Returning mock day with ID:', mockDay.id);
      return NextResponse.json(mockDay);
    }
  } catch (error) {
    console.error('Error creating/updating day:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create/update day',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/days/[date]
 * Delete a day record
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { date: string } }
): Promise<NextResponse> {
  try {
    // Get authentication session
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete day record
    const { error } = await supabase
      .from('days')
      .delete()
      .eq('date', context.params.date)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting day:', error);
      return NextResponse.json({ error: 'Failed to delete day record' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in day API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Something went wrong';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
