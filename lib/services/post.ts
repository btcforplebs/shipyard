import { prisma } from "../db";
import type { Post } from "../generated/prisma";

/**
 * Service for managing posts
 */
export const PostService = {
    /**
     * Create a new post
     */
    async create(data: {
        accountPubkey: string;
        authorPubkey: string;
        kind: number;
        rawEvents: object[];
        originalPostNostrId?: string;
        isDraft?: boolean;
        nostrEventId?: string;
    }): Promise<Post> {
        // Convert rawEvents array to JSON string for SQLite storage
        const rawEventsJson = JSON.stringify(data.rawEvents);

        return prisma.post.create({
            data: {
                accountPubkey: data.accountPubkey,
                authorPubkey: data.authorPubkey,
                kind: data.kind,
                rawEvents: rawEventsJson,
                originalPostNostrId: data.originalPostNostrId,
                isDraft: data.isDraft ?? true,
                nostrEventId: data.nostrEventId,
            },
        });
    },

    /**
     * Get a post by ID
     */
    async getById(id: string): Promise<Post | null> {
        const post = await prisma.post.findUnique({
            where: {
                id,
            },
        });

        if (post) {
            // Parse the rawEvents JSON string back to an array
            return {
                ...post,
                rawEvents: JSON.parse(post.rawEvents),
            } as unknown as Post;
        }

        return null;
    },

    /**
     * Get a post by Nostr event ID
     */
    async getByNostrEventId(nostrEventId: string): Promise<Post | null> {
        const post = await prisma.post.findUnique({
            where: {
                nostrEventId,
            },
        });

        if (post) {
            // Parse the rawEvents JSON string back to an array
            return {
                ...post,
                rawEvents: JSON.parse(post.rawEvents),
            } as unknown as Post;
        }

        return null;
    },

    /**
     * Update a post
     */
    async update(
        id: string,
        data: {
            rawEvents?: object[];
            isDraft?: boolean;
            nostrEventId?: string;
        },
    ): Promise<Post> {
        const updateData: any = {};

        if (data.rawEvents !== undefined) {
            console.log("PostService.update - rawEvents:", data.rawEvents);
            updateData.rawEvents = JSON.stringify(data.rawEvents);
            console.log("PostService.update - stringified rawEvents:", updateData.rawEvents);
        }

        if (data.isDraft !== undefined) {
            updateData.isDraft = data.isDraft;
        }

        if (data.nostrEventId !== undefined) {
            updateData.nostrEventId = data.nostrEventId;
        }

        const post = await prisma.post.update({
            where: {
                id,
            },
            data: updateData,
        });

        // Parse the rawEvents JSON string back to an array
        return {
            ...post,
            rawEvents: JSON.parse(post.rawEvents),
        } as unknown as Post;
    },

    /**
     * Delete a post
     */
    async delete(id: string): Promise<void> {
        await prisma.post.delete({
            where: {
                id,
            },
        });
    },

    /**
     * Get all posts for an account
     */
    async getByAccount(
        accountPubkey: string,
        options?: {
            isDraft?: boolean;
            limit?: number;
            offset?: number;
        },
    ): Promise<Post[]> {
        const where: any = {
            accountPubkey,
        };

        if (options?.isDraft !== undefined) {
            where.isDraft = options.isDraft;
        }

        const posts = await prisma.post.findMany({
            where,
            take: options?.limit,
            skip: options?.offset,
            orderBy: {
                createdAt: "desc",
            },
        });

        // Parse the rawEvents JSON string back to an array for each post
        return posts.map((post) => ({
            ...post,
            rawEvents: JSON.parse(post.rawEvents),
        })) as unknown as Post[];
    },

    /**
     * Get all posts by an author
     */
    async getByAuthor(
        authorPubkey: string,
        options?: {
            isDraft?: boolean;
            limit?: number;
            offset?: number;
        },
    ): Promise<Post[]> {
        const where: any = {
            authorPubkey,
        };

        if (options?.isDraft !== undefined) {
            where.isDraft = options.isDraft;
        }

        const posts = await prisma.post.findMany({
            where,
            take: options?.limit,
            skip: options?.offset,
            orderBy: {
                createdAt: "desc",
            },
        });

        // Parse the rawEvents JSON string back to an array for each post
        return posts.map((post) => ({
            ...post,
            rawEvents: JSON.parse(post.rawEvents),
        })) as unknown as Post[];
    },
};
