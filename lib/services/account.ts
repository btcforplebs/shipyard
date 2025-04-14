import { prisma } from '../db';
import type { Account, AccountUser, Setting } from '../generated/prisma';

/**
 * Service for managing accounts
 */
export const AccountService = {
  /**
   * Create a new account
   */
  async create(pubkey: string): Promise<Account> {
    return prisma.account.create({
      data: {
        pubkey,
      },
    });
  },

  /**
   * Get an account by pubkey
   */
  async getByPubkey(pubkey: string): Promise<Account | null> {
    return prisma.account.findUnique({
      where: {
        pubkey,
      },
    });
  },

  /**
   * Get or create an account by pubkey
   */
  async getOrCreate(pubkey: string): Promise<Account> {
    const existingAccount = await this.getByPubkey(pubkey);
    if (existingAccount) {
      return existingAccount;
    }
    return this.create(pubkey);
  },

  /**
   * Get account with settings
   */
  async getWithSettings(pubkey: string): Promise<(Account & { settings: Setting | null }) | null> {
    return prisma.account.findUnique({
      where: {
        pubkey,
      },
      include: {
        settings: true,
      },
    });
  },

  /**
   * Get all users with access to an account
   */
  async getUsers(accountPubkey: string): Promise<AccountUser[]> {
    return prisma.accountUser.findMany({
      where: {
        accountPubkey,
      },
      include: {
        user: true,
      },
    });
  },

  /**
   * Add a user to an account with specified permissions
   */
  async addUser(
    accountPubkey: string,
    userPubkey: string,
    permissions: {
      canCreateDrafts?: boolean;
      canSchedule?: boolean;
      canPublish?: boolean;
      canManageQueues?: boolean;
      canManageCollaborators?: boolean;
      canViewMetrics?: boolean;
    } = {},
    invitationStatus: 'pending' | 'accepted' | 'declined' = 'pending'
  ): Promise<AccountUser> {
    return prisma.accountUser.create({
      data: {
        accountPubkey,
        userPubkey,
        canCreateDrafts: permissions.canCreateDrafts ?? false,
        canSchedule: permissions.canSchedule ?? false,
        canPublish: permissions.canPublish ?? false,
        canManageQueues: permissions.canManageQueues ?? false,
        canManageCollaborators: permissions.canManageCollaborators ?? false,
        canViewMetrics: permissions.canViewMetrics ?? false,
        invitationStatus,
      },
    });
  },

  /**
   * Update user permissions on an account
   */
  async updateUserPermissions(
    accountPubkey: string,
    userPubkey: string,
    permissions: {
      canCreateDrafts?: boolean;
      canSchedule?: boolean;
      canPublish?: boolean;
      canManageQueues?: boolean;
      canManageCollaborators?: boolean;
      canViewMetrics?: boolean;
      invitationStatus?: 'pending' | 'accepted' | 'declined';
    }
  ): Promise<AccountUser> {
    return prisma.accountUser.update({
      where: {
        accountPubkey_userPubkey: {
          accountPubkey,
          userPubkey,
        },
      },
      data: permissions,
    });
  },

  /**
   * Remove a user from an account
   */
  async removeUser(accountPubkey: string, userPubkey: string): Promise<void> {
    await prisma.accountUser.delete({
      where: {
        accountPubkey_userPubkey: {
          accountPubkey,
          userPubkey,
        },
      },
    });
  },

  /**
   * Update or create account settings
   */
  async updateSettings(
    accountPubkey: string,
    settings: {
      relays: string[];
    }
  ): Promise<Setting> {
    // Convert relays array to JSON string for SQLite storage
    const relaysJson = JSON.stringify(settings.relays);

    return prisma.setting.upsert({
      where: {
        accountPubkey,
      },
      update: {
        relays: relaysJson,
      },
      create: {
        accountPubkey,
        relays: relaysJson,
      },
    });
  },

  /**
   * Get account settings
   */
  async getSettings(accountPubkey: string): Promise<Setting | null> {
    return prisma.setting.findUnique({
      where: {
        accountPubkey,
      },
    });
  },
};