import { NextRequest } from "next/server";

/**
 * Extracts the authenticated pubkey from a request
 *
 * This function retrieves the pubkey from the x-auth-pubkey header
 * that was injected by the middleware after JWT verification.
 *
 * @param req The Next.js request object
 * @returns The authenticated pubkey
 * @throws Error if the pubkey is not found in the request
 */
export function getPubkeyFromRequest(req: Request | NextRequest): string {
    const pubkey = req.headers.get("x-auth-pubkey");

    if (!pubkey) {
        throw new Error("Authentication required: No pubkey found in request");
    }

    return pubkey;
}
