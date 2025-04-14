"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Editor } from "@/components/editor";
import { SchedulePanel } from "@/components/schedule-panel";
import { ArrowLeft, Clock, Save } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function ComposePage() {
    const [postType, setPostType] = useState<"short" | "long">("short");
    const [content, setContent] = useState("");
    const { toast } = useToast();

    const handleSaveDraft = () => {
        toast({
            title: "Draft saved",
            description: "Your content has been saved as a draft.",
        });
    };

    const handleSchedule = () => {
        // This would open the scheduling modal in a real implementation
        toast({
            title: "Ready to schedule",
            description: "Configure when you want this content to be published.",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Compose</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleSaveDraft}>
                        <Save className="mr-2 h-4 w-4" /> Save Draft
                    </Button>
                    <Button onClick={handleSchedule}>
                        <Clock className="mr-2 h-4 w-4" /> Schedule
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="short" onValueChange={(v) => setPostType(v as "short" | "long")}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="short">Short-form</TabsTrigger>
                    <TabsTrigger value="long">Long-form</TabsTrigger>
                </TabsList>
                <TabsContent value="short" className="mt-4">
                    <Card>
                        <CardContent className="pt-6">
                            <Editor
                                content={content}
                                onChange={setContent}
                                placeholder="What's on your mind?"
                                maxLength={280}
                                showCharacterCount
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="long" className="mt-4">
                    <Card>
                        <CardContent className="pt-6">
                            <Editor
                                content={content}
                                onChange={setContent}
                                placeholder="Start writing your long-form content..."
                                isRichText
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <SchedulePanel />
        </div>
    );
}
