"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, ListIcon } from "lucide-react";
import { QueueCalendar } from "@/components/queue-calendar";
import { QueueFilter } from "@/components/queues/queue-filter";

import { DashboardContentQueue } from "./content-queue";
import { useCurrentAccount } from "@/hooks/use-current-account";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

export default function Dashboard() {
    const accountPubkey = useCurrentAccount();

    // State for filtering and draft count
    const [filter, setFilter] = useState<"all" | "drafts" | "published">("all");
    const [draftCount, setDraftCount] = useState<number | null>(null);
    const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);

    // Fetch draft count
    useEffect(() => {
        async function fetchDraftCount() {
            if (!accountPubkey) return;
            try {
                const { posts } = await apiGet(`/api/posts?account_pubkey=${accountPubkey}&is_draft=true`);
                setDraftCount(posts.length);
            } catch {
                setDraftCount(null);
            }
        }
        fetchDraftCount();
    }, [accountPubkey]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">—</div>
                        <p className="text-xs text-muted-foreground">Posts scheduled for today</p>
                    </CardContent>
                </Card>
                <Card
                    className={filter === "drafts" ? "ring-2 ring-primary" : ""}
                    style={{ cursor: "pointer" }}
                    onClick={() => setFilter(filter === "drafts" ? "all" : "drafts")}
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {draftCount !== null ? draftCount : "—"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {filter === "drafts" ? "Showing drafts" : "Click to view drafts"}
                        </p>
                    </CardContent>
                </Card>
                <Card
                    className={filter === "published" ? "ring-2 ring-primary" : ""}
                    style={{ cursor: "pointer" }}
                    onClick={() => setFilter(filter === "published" ? "all" : "published")}
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Published</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">142</div>
                        <p className="text-xs text-muted-foreground">
                            {filter === "published" ? "Showing published" : "+12% from last month"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2,345</div>
                        <p className="text-xs text-muted-foreground">+18% from last month</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="list">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold">Content Queue</h2>
                        <QueueFilter
                            accountPubkey={accountPubkey}
                            onQueueChange={setSelectedQueueId}
                            className="w-[180px]"
                        />
                    </div>
                    <TabsList>
                        <TabsTrigger value="list" className="gap-2">
                            <ListIcon className="h-4 w-4" /> List
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="gap-2">
                            <CalendarIcon className="h-4 w-4" /> Calendar
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="list" className="mt-4">
                    <div className="max-w-xl mx-auto">
                        {accountPubkey ? (
                            <DashboardContentQueue
                                accountPubkey={accountPubkey}
                                isDraft={filter === "drafts" ? true : filter === "published" ? false : undefined}
                                queueId={selectedQueueId}
                            />
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">Loading account...</div>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="calendar" className="mt-4">
                    <QueueCalendar />
                </TabsContent>
            </Tabs>
        </div>
    );
}
