import { prisma } from '../db';
import type { User } from '../generated/prisma';

/**
 * Service for managing users
 */
export const UserService = {
  /**
   * Create a new user
   */
  async create(pubkey: string): Promise<User> {
    return prisma.user.create({
      data: {
        pubkey,
      },
    });
  },

  /**
   * Get a user by pubkey
   */
  async getByPubkey(pubkey: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        pubkey,
      },
    });
  },

  /**
   * Get or create a user by pubkey
   */
  async getOrCreate(pubkey: string): Promise<User> {
    const existingUser = await this.getByPubkey(pubkey);
    if (existingUser) {
      return existingUser;
    }
    return this.create(pubkey);
  },

  /**
   * Get all accounts a user has access to
   */
  async getAccounts(pubkey: string) {
    return prisma.accountUser.findMany({
      where: {
        userPubkey: pubkey,
      },
      include: {
        account: true,
      },
    });
  },
};