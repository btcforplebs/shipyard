import { NextRequest, NextResponse } from 'next/server';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { validateNIP98Event } from '@/lib/nostr/validateNIP98Event';
import { issueJWT } from '@/lib/auth/jwt';

/**
 * POST /api/auth/login
 * Authenticates a user using NIP-98 AUTH event
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request URL for validation
    const url = request.nextUrl.pathname;
    
    // Parse the request body
    const body = await request.json();
    
    // Check if the body contains a NIP-98 event
    if (!body || !body.event) {
      return NextResponse.json(
        { error: 'Missing NIP-98 AUTH event in request body' },
        { status: 400 }
      );
    }
    
    // Create an NDKEvent from the event data
    const event = new NDKEvent(undefined, body.event);
    
    // Validate the NIP-98 event
    const validationResult = await validateNIP98Event(event, {
      url,
      method: 'POST',
      maxAgeSecs: 60, // Event must be less than 60 seconds old
      checkReplay: true // Prevent replay attacks
    });
    
    // If validation fails, return an error
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid NIP-98 AUTH event',
          details: validationResult.error
        },
        { status: 401 }
      );
    }
    
    // At this point, the event is valid and we have the pubkey
    const pubkey = validationResult.pubkey!;
    
    // Issue a JWT token for the pubkey
    const token = await issueJWT(pubkey, {
      // Add any additional claims here
      authMethod: 'nip98',
      iat: Math.floor(Date.now() / 1000)
    });
    
    // Return the JWT token
    return NextResponse.json({
      token,
      pubkey
    });
  } catch (error) {
    console.error('Error in NIP-98 authentication:', error);
    
    // Return a generic error response
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}