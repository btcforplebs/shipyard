"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface RepostScheduleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    postId: string;
    postType: "repost" | "quote";
    onSchedule?: (scheduleData: { date?: Date }) => Promise<void> | void;
}

export function RepostScheduleModal({ open, onOpenChange, postId, postType, onSchedule }: RepostScheduleModalProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { toast } = useToast();

    const handleSchedule = async () => {
        if (onSchedule) {
            await onSchedule({ date });
        }
        toast({
            title: `${postType === "repost" ? "Repost" : "Quote"} scheduled`,
            description: `Your ${postType} has been scheduled successfully.`,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px]">
                <DialogHeader>
                    <DialogTitle>Schedule {postType === "repost" ? "Repost" : "Quote"}</DialogTitle>
                    <DialogDescription>Choose when to publish this {postType}.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 py-4">
                    <div>
                        <Label>Date</Label>
                        <Calendar mode="single" selected={date} onSelect={setDate} className="border rounded-md" />
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

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSchedule}>Schedule {postType === "repost" ? "Repost" : "Quote"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
