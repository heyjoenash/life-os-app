import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types';

/**
 * GET /api/days
 * List days for the current user, optionally filtered by date range
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    // Query days within the date range
    const { data, error } = await supabase
      .from('days')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('user_id', session.user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching days:', error);
      return NextResponse.json({ error: 'Failed to fetch days' }, { status: 500 });
    }

    return NextResponse.json({ days: data });
  } catch (error: unknown) {
    console.error('Error in days API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Something went wrong';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
