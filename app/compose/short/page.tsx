"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { ThreadComposer } from "@/components/thread-composer";
import { ScheduleModal } from "@/components/schedule-modal";
import { useSearchParams } from "next/navigation";

import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@/hooks/use-current-account";

export default function ShortFormComposePage() {
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [thread, setThread] = useState<{ id: string; content: string }[]>([]);
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();
    const quoteId = searchParams.get("quote");

    // Mock quoted post data - in a real app, you would fetch this based on the ID
    const quotedPost = quoteId
        ? {
              id: quoteId,
              author: {
                  name: "Jane Smith",
                  handle: "janesmith",
                  avatar: "/placeholder-user.jpg",
              },
              content:
                  "This is the original post that is being quoted. It contains some interesting thoughts that the user wants to comment on.",
          }
        : null;

    const handleSaveDraft = () => {
        toast({
            title: "Draft saved",
            description: "Your content has been saved as a draft.",
        });
    };

    // Replace with actual account pubkey from session/user context
    const accountPubkey = useCurrentAccount();

    const handleSchedulePost = async () => {
        try {
            const rawEvents = thread.filter(t => t.content.trim().length > 0).map(t => ({
                content: t.content,
                // Add more fields as needed for a rawEvent
            }));
            if (rawEvents.length === 0) {
                toast({ title: "Cannot schedule", description: "Thread is empty." });
                return;
            }
            // 1. Create post
            const { post } = await apiPost("/api/posts", {
                account_pubkey: accountPubkey,
                rawEvents,
            });

            // 2. Schedule post
            await apiPost(`/api/posts/${post.id}/schedule`, {});

            // 3. Redirect to dashboard
            router.push("/dashboard");
        } catch (err) {
            toast({ title: "Error", description: String(err) });
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Back</span>
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold ml-4">New Thread</h1>
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

            <div className="mt-6">
                <ThreadComposer initialQuote={quotedPost} onChange={setThread} />
            </div>
    
            <ScheduleModal
                open={isScheduleModalOpen}
                onOpenChange={setIsScheduleModalOpen}
                onSchedule={handleSchedulePost}
            />
        </div>
    );
}
