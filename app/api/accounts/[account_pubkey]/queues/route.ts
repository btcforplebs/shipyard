import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPubkeyFromRequest } from "@/lib/auth/request";

/**
 * GET /api/accounts/[account_pubkey]/queues
 * Returns a list of queues for a specific account
 * Authentication is handled by middleware
 */
export async function GET(request: NextRequest, { params }: { params: { account_pubkey: string } }) {
    try {
        const accountPubkey = params.account_pubkey;

        // Get the authenticated user's pubkey from the request header
        // This header was injected by the middleware after JWT verification
        const userPubkey = getPubkeyFromRequest(request);

        // Check if the user has access to this account
        // A user always has access to their own account
        if (userPubkey !== accountPubkey) {
            // Check if the user is a collaborator on this account
            const accountUser = await prisma.accountUser.findUnique({
                where: {
                    accountPubkey_userPubkey: {
                        accountPubkey,
                        userPubkey,
                    },
                },
            });

            if (!accountUser) {
                return NextResponse.json({ error: "You do not have access to this account" }, { status: 403 });
            }
        }

        // Get the queues for this account
        const queues = await prisma.queue.findMany({
            where: {
                accountPubkey,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Return the queues
        return NextResponse.json(queues);
    } catch (error) {
        console.error("Error fetching queues:", error);

        return NextResponse.json({ error: "Failed to fetch queues" }, { status: 500 });
    }
}
