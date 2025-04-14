import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJWT } from '@/lib/auth/jwt';

/**
 * GET /api/accounts
 * Returns a list of accounts the authenticated user has access to
 * Authentication is handled by middleware
 */
export async function GET(request: NextRequest) {
  try {
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
    
    // Debug log the pubkey
    
    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { pubkey: userPubkey },
      include: {
        // Include accounts the user has access to through AccountUser
        accountUsers: {
          include: {
            account: true
          }
        }
      }
    });
    
    if (!user) {
      // Create the user if they don't exist
      await prisma.user.create({
        data: {
          pubkey: userPubkey
        }
      });
      
      // Return just the user's own account
      // Create the user's own account
      const newAccount = await prisma.account.create({
        data: {
          pubkey: userPubkey
        }
      });
      
      // Return just the user's own account
      return NextResponse.json([
        {
          pubkey: userPubkey,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    }
    
    // Get accounts the user has access to
    const collaboratorAccounts = user.accountUsers.map(au => au.account);
    
    // Check if the user's own account exists
    const ownAccount = await prisma.account.findUnique({
      where: { pubkey: userPubkey }
    });
    
    // Combine accounts, ensuring the user's own account is included
    let accounts = [...collaboratorAccounts];
    
    if (ownAccount) {
      // Add own account if not already in the list
      if (!accounts.some(a => a.pubkey === userPubkey)) {
        accounts.push(ownAccount);
      }
    } else {
      // Create the user's own account if it doesn't exist
      const newAccount = await prisma.account.create({
        data: {
          pubkey: userPubkey
        }
      });
      
      accounts.push(newAccount);
    }
    
    // Return the accounts
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}