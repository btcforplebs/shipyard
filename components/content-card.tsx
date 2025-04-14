"use client";

import { useState } from "react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiDelete } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, Heart, MessageSquare, MoreHorizontal, Repeat, Share } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RepostScheduleModal } from "@/components/repost-schedule-modal";

import type { Post } from "@/types/nostr";
import { useProfile } from "@nostr-dev-kit/ndk-hooks";
import UserAvatar from "./nostr/user/avatar";

export function ContentCard(post: Post) {
    // Synthesize UI fields from Post
    const {
        id,
        authorPubkey,
        accountPubkey,
        rawEvents,
        kind,
        createdAt,
        // ...other Post fields
    } = post;

    // Content UI
    const rawEvent = Array.isArray(rawEvents) && rawEvents.length > 0 ? rawEvents[0] : {};
    const content = typeof (rawEvent as { content?: string }).content === "string"
        ? (rawEvent as { content: string }).content
        : "";

    // Type UI
    const type: "short" | "long" = "short"; // Or infer from kind

    // ScheduledFor UI
    const scheduledFor = createdAt;

    // Queue UI
    const queue = "default";

    // Likes, replies, reposts (not in Post, so default to 0)
    const likes = 0;
    const replies = 0;
    const reposts = 0;

    // Title (not in Post, so undefined)
    const title = undefined;
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
    const [repostType, setRepostType] = useState<"repost" | "quote">("repost");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const handleScheduleQuote = () => {
        router.push(`/compose/short?quote=${id}`);
    };

    const handleScheduleRepost = () => {
        setRepostType("repost");
        setIsRepostModalOpen(true);
    };

    const accountProfile = useProfile(accountPubkey);

    if (type === "short") {
        // Helper component for a single tweet in the thread
        const Tweet = ({
            event,
            showActions,
            isLast,
        }: {
            event: { id?: string; content?: string };
            showActions?: boolean;
            isLast?: boolean;
        }) => {
            const tweetContent =
                typeof event?.content === "string" ? event.content : "";
            return (
                <Card
                    className={`overflow-hidden ${isLast ? "mb-2" : "border-b-0 border-muted"}`}
                    style={{ borderRadius: isLast ? "0 0 0.5rem 0.5rem" : "0.5rem 0.5rem 0 0" }}
                >
                    <CardContent className="p-4">
                        <div className="flex gap-3">
                            <UserAvatar pubkey={authorPubkey} size="sm" />
                            <div className="flex-1 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-semibold">{accountProfile?.displayName}</span>{" "}
                                        <span className="text-muted-foreground">@{accountProfile?.name}</span>
                                    </div>
                                    {showActions && (
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {queue}
                                            </Badge>
                                            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => router.push(`/compose/short?edit=${id}`)}
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => console.log("Reschedule")}>
                                                        Reschedule
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => setShowDeleteDialog(true)}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm">{tweetContent}</p>
                                <div className="flex items-center pt-2 text-muted-foreground">
                                        <div className="flex items-center gap-4 text-xs">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 px-0 text-muted-foreground"
                                                    >
                                                        <Repeat className="h-3.5 w-3.5 mr-1" />
                                                        <span>{reposts}</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={handleScheduleRepost}>
                                                        Schedule Repost
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={handleScheduleQuote}>
                                                        Schedule Quote
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    <div className={`ml-auto flex items-center text-xs`}>
                                        <Clock className="mr-1 h-3.5 w-3.5" />
                                        Scheduled for {formatDate(scheduledFor)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        };

        // Thread component
        const TweetThread = ({
            events,
        }: {
            events: { id?: string; content?: string }[];
        }) => (
            <div>
                {events.map((event, idx) => (
                    <Tweet
                        key={event.id || idx}
                        event={event}
                        showActions={idx === 0}
                        isLast={idx === events.length - 1}
                    />
                ))}
            </div>
        );

        // Render thread if more than one event, else single tweet
        return (
            <>
                {Array.isArray(rawEvents) && rawEvents.length > 1 ? (
                    <TweetThread events={rawEvents} />
                ) : (
                    <Tweet event={rawEvent} showActions isLast />
                )}

                <RepostScheduleModal
                    open={isRepostModalOpen}
                    onOpenChange={setIsRepostModalOpen}
                    postId={id}
                    postType={repostType}
                />
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete scheduled post?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. Are you sure you want to delete this scheduled post?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground"
                            disabled={isDeleting}
                            onClick={async () => {
                                setIsDeleting(true);
                                try {
                                    await apiDelete(`/api/posts/${id}`);
                                    setShowDeleteDialog(false);
                                    toast({
                                        title: "Post deleted",
                                        description: "The scheduled post was deleted successfully.",
                                    });
                                    router.refresh();
                                } catch (err: any) {
                                    toast({
                                        title: "Failed to delete post",
                                        description: err?.info?.error || "An error occurred.",
                                        variant: "destructive",
                                    });
                                } finally {
                                    setIsDeleting(false);
                                }
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </>
        );
    }

    return (
        <>
            <Card className="overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage
                                    src={typeof accountProfile?.avatar === "string" ? accountProfile.avatar : "/placeholder.svg"}
                                    alt={typeof accountProfile?.displayName === "string" ? accountProfile.displayName : "User"}
                                />
                                <AvatarFallback>{(accountProfile?.displayName?.charAt(0)) || "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{accountProfile?.displayName}</div>
                                <div className="text-xs text-muted-foreground">@{accountProfile?.name}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {queue}
                            </Badge>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => router.push(`/compose/long?edit=${id}`)}>
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => console.log("Reschedule")}>
                                        Reschedule
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => setShowDeleteDialog(true)}
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <Link href={`/compose/long?edit=${id}`} className="block">
                        <h3 className="text-xl font-bold mb-2">{title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">{content}</p>
                    </Link>
                </CardContent>
                <CardFooter className="border-t px-4 py-2.5 flex justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>{replies}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" />
                            <span>{likes}</span>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 px-0 text-muted-foreground">
                                    <Repeat className="h-3.5 w-3.5 mr-1" />
                                    <span>{reposts}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={handleScheduleRepost}>Schedule Repost</DropdownMenuItem>
                                <DropdownMenuItem onClick={handleScheduleQuote}>Schedule Quote</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3.5 w-3.5" />
                        Scheduled for {formatDate(scheduledFor)}
                    </div>
                </CardFooter>
            </Card>

            <RepostScheduleModal
                open={isRepostModalOpen}
                onOpenChange={setIsRepostModalOpen}
                postId={id}
                postType={repostType}
            />
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete scheduled post?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. Are you sure you want to delete this scheduled post?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground"
                        disabled={isDeleting}
                        onClick={async () => {
                            setIsDeleting(true);
                            try {
                                await apiDelete(`/api/posts/${id}`);
                                setShowDeleteDialog(false);
                                toast({
                                    title: "Post deleted",
                                    description: "The scheduled post was deleted successfully.",
                                });
                                router.refresh();
                            } catch (err: any) {
                                toast({
                                    title: "Failed to delete post",
                                    description: err?.info?.error || "An error occurred.",
                                    variant: "destructive",
                                });
                            } finally {
                                setIsDeleting(false);
                            }
                        }}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
