import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJWT } from '@/lib/auth/jwt';

/**
 * GET /api/accounts/[account_pubkey]/queues
 * Returns a list of queues for a specific account
 * Authentication is handled by middleware
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { account_pubkey: string } }
) {
  try {
    const accountPubkey = params.account_pubkey;
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the JWT token
    const verificationResult = await verifyJWT(token);
    
    if (!verificationResult.valid || !verificationResult.pubkey) {
      return NextResponse.json(
        { error: verificationResult.error || 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Get the user's pubkey from the token
    const userPubkey = verificationResult.pubkey;
    
    // Check if the user has access to this account
    // A user always has access to their own account
    if (userPubkey !== accountPubkey) {
      // Check if the user is a collaborator on this account
      const accountUser = await prisma.accountUser.findUnique({
        where: {
          accountPubkey_userPubkey: {
            accountPubkey,
            userPubkey
          }
        }
      });
      
      if (!accountUser) {
        return NextResponse.json(
          { error: 'You do not have access to this account' },
          { status: 403 }
        );
      }
    }
    
    // Get the queues for this account
    const queues = await prisma.queue.findMany({
      where: {
        accountPubkey
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Return the queues
    return NextResponse.json(queues);
  } catch (error) {
    console.error('Error fetching queues:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch queues' },
      { status: 500 }
    );
  }
}