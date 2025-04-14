import { NextRequest, NextResponse } from 'next/server';
import { QueueService } from '@/lib/services';

/**
 * GET /api/queues
 * Retrieves queues for an account
 */
export async function GET(request: NextRequest) {
  try {
    // Get the account pubkey from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const accountPubkey = searchParams.get('accountPubkey');

    if (!accountPubkey) {
      return NextResponse.json(
        { error: 'Missing accountPubkey parameter' },
        { status: 400 }
      );
    }

    // Get all queues for the account
    const queues = await QueueService.getByAccount(accountPubkey);
    
    return NextResponse.json({ queues });
  } catch (error) {
    console.error('Error retrieving queues:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve queues' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/queues
 * Creates a new queue
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountPubkey, name, description } = body;

    if (!accountPubkey) {
      return NextResponse.json(
        { error: 'Missing accountPubkey in request body' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Missing name in request body' },
        { status: 400 }
      );
    }

    // Create the queue
    const queue = await QueueService.create({
      accountPubkey,
      name,
      description,
    });

    return NextResponse.json({ queue });
  } catch (error) {
    console.error('Error creating queue:', error);
    return NextResponse.json(
      { error: 'Failed to create queue' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/queues
 * Deletes a queue
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get the queue ID from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    // Delete the queue
    await QueueService.delete(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting queue:', error);
    return NextResponse.json(
      { error: 'Failed to delete queue' },
      { status: 500 }
    );
  }
}