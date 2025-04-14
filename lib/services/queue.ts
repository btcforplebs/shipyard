import { prisma } from '../db';
import type { Queue } from '../generated/prisma';

/**
 * Service for managing queues
 */
export const QueueService = {
  /**
   * Create a new queue
   */
  async create(data: {
    accountPubkey: string;
    name: string;
    description?: string;
  }): Promise<Queue> {
    return prisma.queue.create({
      data: {
        accountPubkey: data.accountPubkey,
        name: data.name,
        description: data.description,
      },
    });
  },

  /**
   * Get a queue by ID
   */
  async getById(id: string): Promise<Queue | null> {
    return prisma.queue.findUnique({
      where: {
        id,
      },
    });
  },

  /**
   * Update a queue
   */
  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
    }
  ): Promise<Queue> {
    return prisma.queue.update({
      where: {
        id,
      },
      data,
    });
  },

  /**
   * Delete a queue
   */
  async delete(id: string): Promise<void> {
    await prisma.queue.delete({
      where: {
        id,
      },
    });
  },

  /**
   * Get all queues for an account
   */
  async getByAccount(accountPubkey: string): Promise<Queue[]> {
    return prisma.queue.findMany({
      where: {
        accountPubkey,
      },
      orderBy: {
        name: 'asc',
      },
    });
  },

  /**
   * Get a queue by account and name
   */
  async getByAccountAndName(accountPubkey: string, name: string): Promise<Queue | null> {
    return prisma.queue.findUnique({
      where: {
        accountPubkey_name: {
          accountPubkey,
          name,
        },
      },
    });
  },

  /**
   * Get or create a queue by account and name
   */
  async getOrCreate(accountPubkey: string, name: string, description?: string): Promise<Queue> {
    const existingQueue = await this.getByAccountAndName(accountPubkey, name);
    if (existingQueue) {
      return existingQueue;
    }
    return this.create({ accountPubkey, name, description });
  },

  /**
   * Get all scheduled posts in a queue
   */
  async getScheduledPosts(queueId: string) {
    return prisma.schedule.findMany({
      where: {
        queueId,
      },
      include: {
        post: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  },
};