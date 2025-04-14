import { NextRequest, NextResponse } from "next/server";
import { PostService } from "@/lib/services/post";

// POST /api/posts/[post-id]/schedule
// Body: { scheduleAt?: string, ... }
export async function POST(
  req: NextRequest,
  { params }: { params: { "post-id": string } }
) {
  try {
    const { "post-id": postId } = params;
    if (!postId) {
      return NextResponse.json({ error: "Missing post id" }, { status: 400 });
    }

    const body = await req.json();
    // Optionally handle scheduleAt or other scheduling fields here

    // For now, just mark as not draft (scheduled)
    const updated = await PostService.update(postId, {
      isDraft: false,
      // Add schedule fields here if needed
    });

    return NextResponse.json({ post: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to schedule post", details: String(err) }, { status: 500 });
  }
}