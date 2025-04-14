"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, ListIcon, PlusIcon } from "lucide-react";
import { QueueList } from "@/components/queue-list";
import { QueueCalendar } from "@/components/queue-calendar";
import { QueueSelector } from "@/components/queue-selector";
import { NewQueueDialog } from "@/components/new-queue-dialog";

export default function QueuesPage() {
    const [isNewQueueDialogOpen, setIsNewQueueDialogOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Content Queues</h1>
                <Button className="gap-2" onClick={() => setIsNewQueueDialogOpen(true)}>
                    <PlusIcon className="h-4 w-4" /> New Queue
                </Button>
            </div>

            <div className="flex items-center space-x-4">
                <QueueSelector />
            </div>

            <Tabs defaultValue="list">
                <TabsList>
                    <TabsTrigger value="list" className="gap-2">
                        <ListIcon className="h-4 w-4" /> List
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="gap-2">
                        <CalendarIcon className="h-4 w-4" /> Calendar
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="list" className="mt-4">
                    <div className="max-w-xl mx-auto">
                        <QueueList />
                    </div>
                </TabsContent>
                <TabsContent value="calendar" className="mt-4">
                    <QueueCalendar />
                </TabsContent>
            </Tabs>

            <NewQueueDialog open={isNewQueueDialogOpen} onOpenChange={setIsNewQueueDialogOpen} />
        </div>
    );
}
