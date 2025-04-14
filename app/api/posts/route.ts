import { NextRequest, NextResponse } from "next/server";
import { PostService } from "@/lib/services/post";

// POST /api/posts
// Body: { account_pubkey: string, rawEvents: object[], author_pubkey?: string, kind?: number }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { account_pubkey, rawEvents, author_pubkey, kind = 1 } = body;

    if (!account_pubkey || !Array.isArray(rawEvents) || rawEvents.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // author_pubkey is optional, fallback to account_pubkey if not provided
    const post = await PostService.create({
      accountPubkey: account_pubkey,
      authorPubkey: author_pubkey || account_pubkey,
      kind,
      rawEvents,
      isDraft: true,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create post", details: String(err) }, { status: 500 });
  }
}

// GET /api/posts?account_pubkey=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const account_pubkey = searchParams.get("account_pubkey");
    if (!account_pubkey) {
      return NextResponse.json({ error: "Missing account_pubkey" }, { status: 400 });
    }

    const posts = await PostService.getByAccount(account_pubkey, { isDraft: false });
    return NextResponse.json({ posts }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch posts", details: String(err) }, { status: 500 });
  }
}