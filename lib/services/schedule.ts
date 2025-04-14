import { prisma } from "../db";
import type { Schedule } from "../generated/prisma";

/**
 * Service for managing schedules
 */
export const ScheduleService = {
    /**
     * Create a new schedule
     */
    async create(data: {
        postId: string;
        queueId: string;
        accountPubkey: string;
        authorPubkey: string;
        scheduledAt?: Date;
        triggerType?: "time" | "user_online" | "keyword" | "engagement";
        triggerDetails?: object;
        triggerExpiresAt?: Date;
        relays: string[];
        status?: "pending" | "processing" | "published" | "failed" | "expired";
    }): Promise<Schedule> {
        // Convert arrays and objects to JSON strings for SQLite storage
        const relaysJson = JSON.stringify(data.relays);
        const triggerDetailsJson = data.triggerDetails ? JSON.stringify(data.triggerDetails) : undefined;

        return prisma.schedule.create({
            data: {
                postId: data.postId,
                queueId: data.queueId,
                accountPubkey: data.accountPubkey,
                authorPubkey: data.authorPubkey,
                scheduledAt: data.scheduledAt,
                triggerType: data.triggerType,
                triggerDetails: triggerDetailsJson,
                triggerExpiresAt: data.triggerExpiresAt,
                relays: relaysJson,
                status: data.status || "pending",
            },
        });
    },

    /**
     * Get a schedule by ID
     */
    async getById(id: string): Promise<Schedule | null> {
        const schedule = await prisma.schedule.findUnique({
            where: {
                id,
            },
            include: {
                post: true,
                queue: true,
            },
        });

        if (schedule) {
            // Parse JSON strings back to objects
            return {
                ...schedule,
                relays: JSON.parse(schedule.relays),
                triggerDetails: schedule.triggerDetails ? JSON.parse(schedule.triggerDetails) : null,
                post: {
                    ...schedule.post,
                    rawEvent: JSON.parse(schedule.post.rawEvent),
                },
            } as unknown as Schedule;
        }

        return null;
    },

    /**
     * Update a schedule
     */
    async update(
        id: string,
        data: {
            scheduledAt?: Date;
            triggerType?: "time" | "user_online" | "keyword" | "engagement";
            triggerDetails?: object;
            triggerExpiresAt?: Date;
            relays?: string[];
            status?: "pending" | "processing" | "published" | "failed" | "expired";
            publishAttemptedAt?: Date;
            publishError?: string;
        },
    ): Promise<Schedule> {
        const updateData: any = {};

        if (data.scheduledAt !== undefined) {
            updateData.scheduledAt = data.scheduledAt;
        }

        if (data.triggerType !== undefined) {
            updateData.triggerType = data.triggerType;
        }

        if (data.triggerDetails !== undefined) {
            updateData.triggerDetails = JSON.stringify(data.triggerDetails);
        }

        if (data.triggerExpiresAt !== undefined) {
            updateData.triggerExpiresAt = data.triggerExpiresAt;
        }

        if (data.relays !== undefined) {
            updateData.relays = JSON.stringify(data.relays);
        }

        if (data.status !== undefined) {
            updateData.status = data.status;
        }

        if (data.publishAttemptedAt !== undefined) {
            updateData.publishAttemptedAt = data.publishAttemptedAt;
        }

        if (data.publishError !== undefined) {
            updateData.publishError = data.publishError;
        }

        const schedule = await prisma.schedule.update({
            where: {
                id,
            },
            data: updateData,
            include: {
                post: true,
                queue: true,
            },
        });

        // Parse JSON strings back to objects
        return {
            ...schedule,
            relays: JSON.parse(schedule.relays),
            triggerDetails: schedule.triggerDetails ? JSON.parse(schedule.triggerDetails) : null,
            post: {
                ...schedule.post,
                rawEvent: JSON.parse(schedule.post.rawEvent),
            },
        } as unknown as Schedule;
    },

    /**
     * Delete a schedule
     */
    async delete(id: string): Promise<void> {
        await prisma.schedule.delete({
            where: {
                id,
            },
        });
    },

    /**
     * Get all schedules for an account
     */
    async getByAccount(
        accountPubkey: string,
        options?: {
            status?: "pending" | "processing" | "published" | "failed" | "expired";
            queueId?: string;
            limit?: number;
            offset?: number;
        },
    ): Promise<Schedule[]> {
        const where: any = {
            accountPubkey,
        };

        if (options?.status) {
            where.status = options.status;
        }

        if (options?.queueId) {
            where.queueId = options.queueId;
        }

        const schedules = await prisma.schedule.findMany({
            where,
            include: {
                post: true,
                queue: true,
            },
            take: options?.limit,
            skip: options?.offset,
            orderBy: {
                scheduledAt: "asc",
            },
        });

        // Parse JSON strings back to objects for each schedule
        return schedules.map((schedule) => ({
            ...schedule,
            relays: JSON.parse(schedule.relays),
            triggerDetails: schedule.triggerDetails ? JSON.parse(schedule.triggerDetails) : null,
            post: {
                ...schedule.post,
                rawEvent: JSON.parse(schedule.post.rawEvent),
            },
        })) as unknown as Schedule[];
    },

    /**
     * Get all schedules due for publishing
     */
    async getDueSchedules(): Promise<Schedule[]> {
        const now = new Date();

        const schedules = await prisma.schedule.findMany({
            where: {
                status: "pending",
                scheduledAt: {
                    lte: now,
                },
                triggerType: "time",
            },
            include: {
                post: true,
                queue: true,
            },
        });

        // Parse JSON strings back to objects for each schedule
        return schedules.map((schedule) => ({
            ...schedule,
            relays: JSON.parse(schedule.relays),
            triggerDetails: schedule.triggerDetails ? JSON.parse(schedule.triggerDetails) : null,
            post: {
                ...schedule.post,
                rawEvent: JSON.parse(schedule.post.rawEvent),
            },
        })) as unknown as Schedule[];
    },

    /**
     * Mark a schedule as published
     */
    async markAsPublished(id: string, nostrEventId?: string): Promise<Schedule> {
        const schedule = await prisma.schedule.update({
            where: {
                id,
            },
            data: {
                status: "published",
                publishAttemptedAt: new Date(),
                post: nostrEventId
                    ? {
                          update: {
                              nostrEventId,
                              isDraft: false,
                          },
                      }
                    : undefined,
            },
            include: {
                post: true,
                queue: true,
            },
        });

        // Parse JSON strings back to objects
        return {
            ...schedule,
            relays: JSON.parse(schedule.relays),
            triggerDetails: schedule.triggerDetails ? JSON.parse(schedule.triggerDetails) : null,
            post: {
                ...schedule.post,
                rawEvent: JSON.parse(schedule.post.rawEvent),
            },
        } as unknown as Schedule;
    },

    /**
     * Mark a schedule as failed
     */
    async markAsFailed(id: string, error: string): Promise<Schedule> {
        const schedule = await prisma.schedule.update({
            where: {
                id,
            },
            data: {
                status: "failed",
                publishAttemptedAt: new Date(),
                publishError: error,
            },
            include: {
                post: true,
                queue: true,
            },
        });

        // Parse JSON strings back to objects
        return {
            ...schedule,
            relays: JSON.parse(schedule.relays),
            triggerDetails: schedule.triggerDetails ? JSON.parse(schedule.triggerDetails) : null,
            post: {
                ...schedule.post,
                rawEvent: JSON.parse(schedule.post.rawEvent),
            },
        } as unknown as Schedule;
    },
};
