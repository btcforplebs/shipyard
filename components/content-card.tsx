"use client";

import { useState } from "react";
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

interface ContentCardProps {
    id: string;
    author: {
        name: string;
        handle: string;
        avatar: string;
    };
    content: string;
    type: "short" | "long";
    title?: string;
    scheduledFor: string;
    queue: string;
    likes?: number;
    replies?: number;
    reposts?: number;
}

export function ContentCard({
    id,
    author,
    content,
    type,
    title,
    scheduledFor,
    queue,
    likes = 0,
    replies = 0,
    reposts = 0,
}: ContentCardProps) {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
    const [repostType, setRepostType] = useState<"repost" | "quote">("repost");

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

    if (type === "short") {
        return (
            <>
                <Card className="overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={author.avatar || "/placeholder.svg"} alt={author.name} />
                                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-semibold">{author.name}</span>{" "}
                                        <span className="text-muted-foreground">@{author.handle}</span>
                                    </div>
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
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                <p className="text-sm">{content}</p>
                                <div className="flex items-center pt-2 text-muted-foreground">
                                    <div className="flex items-center gap-4 text-xs">
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
                                        <Button variant="ghost" size="sm" className="h-6 px-0">
                                            <Share className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    <div className="ml-auto flex items-center text-xs">
                                        <Clock className="mr-1 h-3.5 w-3.5" />
                                        Scheduled for {formatDate(scheduledFor)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <RepostScheduleModal
                    open={isRepostModalOpen}
                    onOpenChange={setIsRepostModalOpen}
                    postId={id}
                    postType={repostType}
                />
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
                                <AvatarImage src={author.avatar || "/placeholder.svg"} alt={author.name} />
                                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{author.name}</div>
                                <div className="text-xs text-muted-foreground">@{author.handle}</div>
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
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
        </>
    );
}
