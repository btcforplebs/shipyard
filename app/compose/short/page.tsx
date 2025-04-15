"use client";

import { useState, useEffect } from "react";
import { apiPost, apiGet, apiPut } from "@/lib/api";
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
    const [isLoading, setIsLoading] = useState(false);
    const [initialThread, setInitialThread] = useState<{ id: string; content: string }[] | undefined>(undefined);
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();
    const quoteId = searchParams.get("quote");
    const editId = searchParams.get("edit");

    useEffect(() => {
        if (editId) {
            const fetchPost = async () => {
                setIsLoading(true);
                try {
                    const { post } = await apiGet(`/api/posts/${editId}`);
                    if (post && post.rawEvents && Array.isArray(post.rawEvents)) {
                        interface RawEvent {
                            content: string;
                            [key: string]: unknown;
                        }
                        const threadData = post.rawEvents.map((event: RawEvent, index: number) => ({
                            id: String(index + 1),
                            content: event.content || "",
                        }));
                        setInitialThread(threadData);
                    }
                } catch (err) {
                    toast({ title: "Error", description: "Failed to load post for editing." });
                    console.error("Failed to load post:", err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPost();
        }
    }, [editId, toast]);

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

    const handleSaveDraft = async () => {
        if (!accountPubkey) {
            toast({ title: "Error", description: "No account found." });
            return;
        }
        const rawEvents = thread.filter(t => t.content.trim().length > 0).map(t => ({
            content: t.content,
        }));
        console.log("handleSaveDraft - rawEvents:", rawEvents);
        if (rawEvents.length === 0) {
            toast({ title: "Cannot save draft", description: "Thread is empty." });
            return;
        }
        try {
            if (editId) {
                await apiPut(`/api/posts/${editId}`, {
                    rawEvents,
                    isDraft: true,
                });
                toast({
                    title: "Draft updated",
                    description: "Your content has been updated and saved as a draft.",
                });
            } else {
                await apiPost("/api/posts", {
                    account_pubkey: accountPubkey,
                    rawEvents,
                    isDraft: true,
                });
                toast({
                    title: "Draft saved",
                    description: "Your content has been saved as a draft.",
                });
            }
        } catch (err) {
            toast({ title: "Error", description: String(err) });
        }
    };

    const accountPubkey = useCurrentAccount();

    const handleSchedulePost = async () => {
        try {
            const rawEvents = thread.filter(t => t.content.trim().length > 0).map(t => ({
                content: t.content,
            }));
            console.log("handleSchedulePost - rawEvents:", rawEvents);
            if (rawEvents.length === 0) {
                toast({ title: "Cannot schedule", description: "Thread is empty." });
                return;
            }

            let postId: string;
            
            if (editId) {
                const { post } = await apiPut(`/api/posts/${editId}`, {
                    rawEvents,
                    isDraft: false,
                });
                postId = post.id;
            } else {
                const { post } = await apiPost("/api/posts", {
                    account_pubkey: accountPubkey,
                    rawEvents,
                });
                postId = post.id;
            }

            await apiPost(`/api/posts/${postId}/schedule`, {});

            router.push("/dashboard");
        } catch (err) {
            toast({ title: "Error", description: String(err) });
        }
    };

    return (
        <>
            <div className="border-b">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center">
                        <Link href="/dashboard">
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
                        <Button variant="secondary" onClick={() => setIsScheduleModalOpen(true)}>
                            Continue
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="mt-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <span className="ml-3">Loading post...</span>
                        </div>
                    ) : (
                        <ThreadComposer initialQuote={quotedPost} initialThread={initialThread} onChange={setThread} />
                    )}
                </div>
            </div>
    
            <ScheduleModal
                open={isScheduleModalOpen}
                onOpenChange={setIsScheduleModalOpen}
                onSchedule={handleSchedulePost}
            />
        </>
    );
}
