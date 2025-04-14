import { NextRequest, NextResponse } from "next/server";
import { PostService } from "@/lib/services/post";
import { getPubkeyFromRequest } from "@/lib/auth/request";

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