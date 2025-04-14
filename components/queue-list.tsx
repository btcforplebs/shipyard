"use client";

import { ContentCard } from "@/components/content-card";

import type { Post } from "@/types/nostr";

export function QueueList({ items }: { items?: Post[] }) {
    if (!items || items.length === 0) {
        return <div className="text-muted-foreground text-center py-8">No posts found.</div>;
    }

    return (
        <div className="space-y-4">
            {items.map((post) => (
                <ContentCard key={post.id} {...post} />
            ))}
        </div>
    );
}
