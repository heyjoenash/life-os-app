import { NextRequest, NextResponse } from 'next/server';

// Define Email type for better type safety
interface Email {
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
}

// Mock in-memory storage for emails
const emailStore: Record<string, Email[]> = {};

/**
 * GET /api/emails
 * Get emails for a specific day
 */
export async function GET(request: NextRequest) {
  try {
    // Get day_id from query parameter
    const { searchParams } = new URL(request.url);
    const dayId = searchParams.get('day_id');

    if (!dayId) {
      return NextResponse.json({ error: 'Missing day_id parameter' }, { status: 400 });
    }

    // Return emails from memory store or empty array
    const emails = emailStore[dayId] || [];

    return NextResponse.json(emails);
  } catch (error) {
    console.error('Error getting emails:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get emails' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/emails
 * Create a new email
 */
export async function POST(request: NextRequest) {
  try {
    const { day_id, subject, sender, recipient, content, received_at } = await request.json();

    if (!day_id) {
      return NextResponse.json({ error: 'Missing day_id parameter' }, { status: 400 });
    }

    // Create a new email
    const newEmail: Email = {
      id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      day_id,
      subject: subject || null,
      sender: sender || null,
      recipient: recipient || null,
      content: content || null,
      received_at: received_at || new Date().toISOString(),
      is_read: false,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to store
    if (!emailStore[day_id]) {
      emailStore[day_id] = [];
    }

    emailStore[day_id].push(newEmail);

    return NextResponse.json(newEmail);
  } catch (error) {
    console.error('Error creating email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create email' },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/emails
 * Update an email (mark as read, archive, etc.)
 */
export async function PATCH(request: NextRequest) {
  try {
    const { id, is_read, is_archived } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Find and update the email in the appropriate day array
    let updatedEmail: Email | null = null;

    for (const dayId in emailStore) {
      const emailIndex = emailStore[dayId].findIndex((email) => email.id === id);

      if (emailIndex !== -1) {
        // Update the email
        emailStore[dayId][emailIndex] = {
          ...emailStore[dayId][emailIndex],
          is_read: is_read !== undefined ? is_read : emailStore[dayId][emailIndex].is_read,
          is_archived:
            is_archived !== undefined ? is_archived : emailStore[dayId][emailIndex].is_archived,
          updated_at: new Date().toISOString(),
        };

        updatedEmail = emailStore[dayId][emailIndex];
        break;
      }
    }

    if (!updatedEmail) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json(updatedEmail);
  } catch (error) {
    console.error('Error updating email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update email' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/emails
 * Delete an email
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    // Find and delete the email
    let deleted = false;

    for (const dayId in emailStore) {
      const emailIndex = emailStore[dayId].findIndex((email) => email.id === id);

      if (emailIndex !== -1) {
        // Remove the email
        emailStore[dayId].splice(emailIndex, 1);
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete email' },
      { status: 500 },
    );
  }
}
