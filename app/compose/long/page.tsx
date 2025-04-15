"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { LongFormEditor } from "@/components/long-form-editor";
import { ScheduleModal } from "@/components/schedule-modal";

export default function LongFormComposePage() {
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const { toast } = useToast();

    const handleSaveDraft = () => {
        toast({
            title: "Draft saved",
            description: "Your content has been saved as a draft.",
        });
    };

    return (
        <>
            <div className="border-b">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center">
                        <Link href="/compose">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="h-5 w-5" />
                                <span className="sr-only">Back</span>
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleSaveDraft}>
                            <Save className="mr-2 h-4 w-4" /> Save Draft
                        </Button>
                        <Button onClick={() => setIsScheduleModalOpen(true)} className="rounded-full px-6">
                            Continue
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="mt-6">
                    <LongFormEditor />
                </div>
            </div>

            <ScheduleModal open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen} />
        </>
    );
}
