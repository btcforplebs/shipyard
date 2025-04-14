import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth/jwt";

// Define paths that don't require authentication
const publicPaths = ["/login", "/api/auth/login", "/", "/terms", "/privacy"];

// Check if the path is public
function isPublicPath(path: string) {
    if (path.startsWith("/api") && !path.startsWith("/api/auth/login")) return false;

    return publicPaths.some((publicPath) => path.startsWith(publicPath));
}

// Middleware function
export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Allow public paths without authentication
    if (isPublicPath(path)) {
        return NextResponse.next();
    }

    // Check for API routes that need authentication
    if (path.startsWith("/api/")) {
        // Get the authorization header
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
        }

        // Extract the token
        const token = authHeader.split(" ")[1];

        // Verify the JWT token
        const verificationResult = await verifyJWT(token);

        if (!verificationResult.valid) {
            return NextResponse.json({ error: verificationResult.error || "Invalid token" }, { status: 401 });
        }

        // JWT is valid, inject the pubkey into a custom request header
        if (verificationResult.pubkey) {
            // Create a new headers object from the original request
            const requestHeaders = new Headers(request.headers);
            // Add the pubkey as a custom header
            requestHeaders.set("x-auth-pubkey", verificationResult.pubkey);

            // Create a new request with the modified headers
            const newRequest = new Request(request.url, {
                method: request.method,
                headers: requestHeaders,
                body: request.body,
                redirect: request.redirect,
                signal: request.signal,
            });

            // Continue with the modified request
            return NextResponse.next({
                request: newRequest,
            });
        }

        // Continue with the original request if no pubkey
        return NextResponse.next();
    }

    // For non-API routes that require authentication, redirect to login if no token in cookie
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
        // Redirect to login page with the original URL as a query parameter
        const url = new URL("/login", request.url);
        url.searchParams.set("from", request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    // Verify the JWT token
    const verificationResult = await verifyJWT(token);

    if (!verificationResult.valid) {
        // Clear the invalid token cookie
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("auth_token");
        return response;
    }

    // JWT is valid, inject the pubkey into a custom request header for dashboard routes
    if (verificationResult.pubkey) {
        // Create a new headers object from the original request
        const requestHeaders = new Headers(request.headers);
        // Add the pubkey as a custom header
        requestHeaders.set("x-auth-pubkey", verificationResult.pubkey);

        // Create a new request with the modified headers
        const newRequest = new Request(request.url, {
            method: request.method,
            headers: requestHeaders,
            body: request.body,
            redirect: request.redirect,
            signal: request.signal,
        });

        // Continue with the modified request
        return NextResponse.next({
            request: newRequest,
        });
    }

    // Continue with the original request if no pubkey
    return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
    matcher: [
        // Match all API routes except auth/login
        "/api/:path*",
        // Match all dashboard routes
        "/dashboard/:path*",
        // Match all compose routes
        "/compose/:path*",
    ],
};
