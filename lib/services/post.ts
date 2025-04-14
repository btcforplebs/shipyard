import { prisma } from '../db';
import type { Post } from '../generated/prisma';

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
    rawEvent: object;
    originalPostNostrId?: string;
    isDraft?: boolean;
    nostrEventId?: string;
  }): Promise<Post> {
    // Convert rawEvent object to JSON string for SQLite storage
    const rawEventJson = JSON.stringify(data.rawEvent);

    return prisma.post.create({
      data: {
        accountPubkey: data.accountPubkey,
        authorPubkey: data.authorPubkey,
        kind: data.kind,
        rawEvent: rawEventJson,
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
      // Parse the rawEvent JSON string back to an object
      return {
        ...post,
        rawEvent: JSON.parse(post.rawEvent),
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
      // Parse the rawEvent JSON string back to an object
      return {
        ...post,
        rawEvent: JSON.parse(post.rawEvent),
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
      rawEvent?: object;
      isDraft?: boolean;
      nostrEventId?: string;
    }
  ): Promise<Post> {
    const updateData: any = {};

    if (data.rawEvent) {
      updateData.rawEvent = JSON.stringify(data.rawEvent);
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

    // Parse the rawEvent JSON string back to an object
    return {
      ...post,
      rawEvent: JSON.parse(post.rawEvent),
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
  async getByAccount(accountPubkey: string, options?: {
    isDraft?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Post[]> {
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
        createdAt: 'desc',
      },
    });

    // Parse the rawEvent JSON string back to an object for each post
    return posts.map(post => ({
      ...post,
      rawEvent: JSON.parse(post.rawEvent),
    })) as unknown as Post[];
  },

  /**
   * Get all posts by an author
   */
  async getByAuthor(authorPubkey: string, options?: {
    isDraft?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Post[]> {
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
        createdAt: 'desc',
      },
    });

    // Parse the rawEvent JSON string back to an object for each post
    return posts.map(post => ({
      ...post,
      rawEvent: JSON.parse(post.rawEvent),
    })) as unknown as Post[];
  },
};