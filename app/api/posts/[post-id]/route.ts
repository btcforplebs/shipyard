import { NextRequest, NextResponse } from "next/server";
import { PostService } from "@/lib/services/post";
import { getPubkeyFromRequest } from "@/lib/auth/request";

/**
 * GET /api/posts/[post-id]
 * Retrieves a post by ID if the authenticated user is authorized.
 */
export async function GET(req: NextRequest, { params }: { params: { "post-id": string } }) {
  try {
    const pubkey = getPubkeyFromRequest(req);
    const postId = params["post-id"];

    if (!postId) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    const post = await PostService.getById(postId);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Only allow access if the authenticated user owns the post (accountPubkey or authorPubkey)
    if (post.accountPubkey !== pubkey && post.authorPubkey !== pubkey) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ post }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to retrieve post", details: String(err) }, { status: 500 });
  }
}

/**
 * DELETE /api/posts/[post-id]
 * Deletes a post if the authenticated user is authorized.
 */
export async function DELETE(req: NextRequest, { params }: { params: { "post-id": string } }) {
  try {
    const pubkey = getPubkeyFromRequest(req);
    const postId = params["post-id"];

    if (!postId) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    const post = await PostService.getById(postId);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Only allow deletion if the authenticated user owns the post (accountPubkey or authorPubkey)
    if (post.accountPubkey !== pubkey && post.authorPubkey !== pubkey) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await PostService.delete(postId);

    return new Response(null, { status: 204 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete post", details: String(err) }, { status: 500 });
  }
}

/**
 * PUT /api/posts/[post-id]
 * Updates a post (e.g., schedule, publish, etc.)
 */
export async function PUT(req: NextRequest, { params }: { params: { "post-id": string } }) {
  try {
    const pubkey = getPubkeyFromRequest(req);
    const postId = params["post-id"];
    if (!postId) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }
    const post = await PostService.getById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    // Only allow update if the authenticated user owns the post
    if (post.accountPubkey !== pubkey && post.authorPubkey !== pubkey) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    console.log("PUT /api/posts/[post-id] - Request body:", body);
    
    // Only allow updating certain fields
    const updateData: any = {};
    if (body.isDraft !== undefined) updateData.isDraft = body.isDraft;
    if (body.scheduledAt !== undefined) updateData.scheduledAt = body.scheduledAt;
    if (body.rawEvents !== undefined) updateData.rawEvents = body.rawEvents;
    
    console.log("PUT /api/posts/[post-id] - Update data:", updateData);
    // Add more fields as needed
    const updated = await PostService.update(postId, updateData);
    return NextResponse.json({ post: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update post", details: String(err) }, { status: 500 });
  }
}