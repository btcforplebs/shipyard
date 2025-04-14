"use client";

import { ContentCard } from "@/components/content-card";

// Mock data for the queue items
const queueItems = [
    {
        id: "1",
        author: {
            name: "John Doe",
            handle: "johndoe",
            avatar: "/placeholder-user.jpg",
        },
        content: "Just finished working on my new Nostr client. Can't wait to share it with everyone!",
        scheduledFor: "2023-06-15T14:30:00Z",
        type: "short" as const,
        queue: "default",
        likes: 0,
        replies: 0,
        reposts: 0,
    },
    {
        id: "2",
        author: {
            name: "John Doe",
            handle: "johndoe",
            avatar: "/placeholder-user.jpg",
        },
        title: "Thoughts on the latest Bitcoin development",
        content:
            "Bitcoin's latest development brings significant improvements to scalability and privacy. This article explores what these changes mean for decentralized social networks and how they might impact the future of online communication. We'll dive deep into the technical aspects while keeping it accessible for non-technical readers.",
        scheduledFor: "2023-06-16T10:00:00Z",
        type: "long" as const,
        queue: "important",
        likes: 5,
        replies: 2,
        reposts: 1,
    },
    {
        id: "3",
        author: {
            name: "John Doe",
            handle: "johndoe",
            avatar: "/placeholder-user.jpg",
        },
        content: "5 tips for better privacy on Nostr. #1 will surprise you!",
        scheduledFor: "2023-06-17T08:15:00Z",
        type: "short" as const,
        queue: "evergreen",
        likes: 12,
        replies: 3,
        reposts: 4,
    },
    {
        id: "4",
        author: {
            name: "John Doe",
            handle: "johndoe",
            avatar: "/placeholder-user.jpg",
        },
        content: "Just released a new tutorial on how to set up your own Nostr relay. Check it out!",
        scheduledFor: "2023-06-18T16:45:00Z",
        type: "short" as const,
        queue: "default",
        likes: 8,
        replies: 1,
        reposts: 2,
    },
];

export function QueueList() {
    return (
        <div className="space-y-4">
            {queueItems.map((item) => (
                <ContentCard key={item.id} {...item} />
            ))}
        </div>
    );
}
