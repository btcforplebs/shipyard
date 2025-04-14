import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "./jwt";

/**
 * Options for the auth middleware
 */
interface AuthMiddlewareOptions {
    optional?: boolean;
}

/**
 * Middleware to authenticate requests using JWT
 *
 * @param req The Next.js request object
 * @param res The Next.js response object
 * @param next The next middleware function
 * @param options Options for the middleware
 */
export async function authMiddleware(req: any, res: any, next: () => void, options: AuthMiddlewareOptions = {}) {
    // If authentication is optional and no Authorization header is present, skip
    if (options.optional && !req.headers.authorization) {
        return next();
    }

    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            error: "Missing authorization header",
        });
    }

    // Check Authorization format (Bearer token)
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
            error: 'Invalid authorization format, expected "Bearer token"',
        });
    }

    const token = parts[1];

    // Verify the JWT token
    const result = await verifyJWT(token);

    if (!result.valid) {
        return res.status(401).json({
            error: result.error || "Invalid token",
            ...(result.newToken ? { newToken: result.newToken } : {}),
        });
    }

    // Attach pubkey and claims to request for use in route handlers
    req.pubkey = result.pubkey;
    req.claims = result.claims;

    // Continue to the next middleware or route handler
    next();
}

/**
 * Next.js middleware for API routes
 *
 * @param handler The route handler function
 * @param options Options for the middleware
 */
export function withAuth(handler: (req: NextRequest) => Promise<NextResponse>, options: AuthMiddlewareOptions = {}) {
    return async function (req: NextRequest): Promise<NextResponse> {
        // Extract the token from the Authorization header
        const authHeader = req.headers.get("authorization");

        // If authentication is optional and no Authorization header is present, proceed
        if (options.optional && !authHeader) {
            return handler(req);
        }

        // Check for Authorization header
        if (!authHeader) {
            return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
        }

        // Check Authorization format (Bearer token)
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return NextResponse.json(
                { error: 'Invalid authorization format, expected "Bearer token"' },
                { status: 401 },
            );
        }

        const token = parts[1];

        // Verify the JWT token
        const result = await verifyJWT(token);

        if (!result.valid) {
            return NextResponse.json({ error: result.error || "Invalid token" }, { status: 401 });
        }

        // Extend the request with auth properties
        // Using NextRequest doesn't allow direct property assignment, so we use a workaround
        const requestWithAuth = Object.assign(req, {
            pubkey: result.pubkey,
            claims: result.claims,
        });

        // Call the handler with the authenticated request
        return handler(requestWithAuth as NextRequest);
    };
}
