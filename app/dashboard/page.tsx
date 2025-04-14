import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, ListIcon } from "lucide-react";
import { QueueList } from "@/components/queue-list";
import { QueueCalendar } from "@/components/queue-calendar";

export default function Dashboard() {
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
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">3 posts scheduled for today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">Last edited 2 hours ago</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Published</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">142</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
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
                    <h2 className="text-xl font-bold">Content Queue</h2>
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
                        <QueueList />
                    </div>
                </TabsContent>
                <TabsContent value="calendar" className="mt-4">
                    <QueueCalendar />
                </TabsContent>
            </Tabs>
        </div>
    );
}
