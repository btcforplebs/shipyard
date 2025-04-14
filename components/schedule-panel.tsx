"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Clock, User, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SchedulePanelProps {
    isPremium?: boolean;
}

export function SchedulePanel({ isPremium = false }: SchedulePanelProps) {
    const [scheduleType, setScheduleType] = useState<"time" | "trigger">("time");
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
        <Card>
            <CardHeader>
                <CardTitle>Schedule Options</CardTitle>
                <CardDescription>Choose when your content will be published</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Tabs defaultValue="time" onValueChange={(v) => setScheduleType(v as "time" | "trigger")}>
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="time" className="gap-2">
                            <Clock className="h-4 w-4" /> Time-based
                        </TabsTrigger>
                        <TabsTrigger value="trigger" className="gap-2" disabled={!isPremium}>
                            <User className="h-4 w-4" /> Trigger-based
                            {!isPremium && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                    PRO
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="time" className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Date</Label>
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="border rounded-md"
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="time">Time</Label>
                                    <Input type="time" id="time" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Select defaultValue="utc">
                                        <SelectTrigger id="timezone">
                                            <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="utc">UTC</SelectItem>
                                            <SelectItem value="est">Eastern Time (EST)</SelectItem>
                                            <SelectItem value="cst">Central Time (CST)</SelectItem>
                                            <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="queue">Add to Queue</Label>
                                    <Select defaultValue="default">
                                        <SelectTrigger id="queue">
                                            <SelectValue placeholder="Select queue" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Default Queue</SelectItem>
                                            <SelectItem value="important">Important</SelectItem>
                                            <SelectItem value="evergreen">Evergreen Content</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="trigger" className="space-y-4 mt-4">
                        {!isPremium ? (
                            <div className="flex items-center p-4 border rounded-md bg-muted/50">
                                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                                <div>
                                    <p className="font-medium">Premium Feature</p>
                                    <p className="text-sm text-muted-foreground">
                                        Upgrade to Pro to unlock trigger-based scheduling.
                                    </p>
                                </div>
                                <Button className="ml-auto" size="sm">
                                    Upgrade
                                </Button>
                            </div>
                        ) : null}

                        <div className={isPremium ? "" : "opacity-60 pointer-events-none"}>
                            <div className="space-y-2">
                                <Label htmlFor="trigger-type">Trigger Type</Label>
                                <Select defaultValue="user-online" disabled={!isPremium}>
                                    <SelectTrigger id="trigger-type">
                                        <SelectValue placeholder="Select trigger type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user-online">User comes online</SelectItem>
                                        <SelectItem value="keyword">Keyword mentioned</SelectItem>
                                        <SelectItem value="engagement">Engagement threshold</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Schedule posts based on user activity or content triggers
                                </p>
                            </div>

                            <div className="space-y-2 mt-4">
                                <Label htmlFor="user-npub">User NPUB</Label>
                                <Input id="user-npub" placeholder="npub1..." disabled={!isPremium} />
                                <p className="text-xs text-muted-foreground">
                                    Enter the public key of a user to post when they come online
                                </p>
                            </div>

                            <div className="space-y-2 mt-4">
                                <Label htmlFor="keyword-trigger">Keyword Trigger</Label>
                                <Input id="keyword-trigger" placeholder="bitcoin, nostr, etc." disabled={!isPremium} />
                                <p className="text-xs text-muted-foreground">
                                    Post when these keywords are trending in your network
                                </p>
                            </div>

                            <div className="flex items-center space-x-2 mt-4">
                                <Switch id="expire" disabled={!isPremium} />
                                <Label htmlFor="expire">Expire after 24 hours</Label>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
