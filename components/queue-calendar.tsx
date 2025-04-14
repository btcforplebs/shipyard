"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data for the calendar events
const events = [
    {
        id: "1",
        title: "New Nostr client announcement",
        date: new Date(2023, 5, 15),
        type: "short",
    },
    {
        id: "2",
        title: "Bitcoin development article",
        date: new Date(2023, 5, 16),
        type: "long",
    },
    {
        id: "3",
        title: "Privacy tips thread",
        date: new Date(2023, 5, 17),
        type: "short",
    },
    {
        id: "4",
        title: "Nostr relay tutorial",
        date: new Date(2023, 5, 18),
        type: "short",
    },
];

export function QueueCalendar() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const handleSelect = (date: Date | undefined) => {
        setDate(date);
        if (date) {
            setSelectedDate(date);
        }
    };

    const eventsForSelectedDate = selectedDate
        ? events.filter(
              (event) =>
                  event.date.getDate() === selectedDate.getDate() &&
                  event.date.getMonth() === selectedDate.getMonth() &&
                  event.date.getFullYear() === selectedDate.getFullYear(),
          )
        : [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-4">
            <div>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    className="border rounded-md"
                    components={{
                        DayContent: (props) => {
                            const date = props.date;
                            const hasEvents = events.some(
                                (event) =>
                                    event.date.getDate() === date.getDate() &&
                                    event.date.getMonth() === date.getMonth() &&
                                    event.date.getFullYear() === date.getFullYear(),
                            );

                            return (
                                <div className="relative">
                                    <div>{props.date.getDate()}</div>
                                    {hasEvents && (
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                                    )}
                                </div>
                            );
                        },
                    }}
                />
            </div>

            <div>
                {selectedDate ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {selectedDate.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {eventsForSelectedDate.length > 0 ? (
                                <div className="space-y-4">
                                    {eventsForSelectedDate.map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex items-center justify-between p-2 border rounded-md"
                                        >
                                            <div>
                                                <p className="font-medium">{event.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {event.date.toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                            <Badge variant={event.type === "short" ? "default" : "secondary"}>
                                                {event.type === "short" ? "Short-form" : "Long-form"}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No posts scheduled for this date.</p>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Select a date to view scheduled posts.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
