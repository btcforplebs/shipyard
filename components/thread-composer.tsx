"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@nostr-dev-kit/ndk-hooks";
import { useCurrentAccount } from "@/hooks/use-current-account";
import UserAvatar from "./nostr/user/avatar";

interface QuotedPost {
    id: string;
    author: {
        name: string;
        handle: string;
        avatar: string;
    };
    content: string;
}

interface TweetProps {
    id: string;
    content: string;
    onChange: (id: string, content: string) => void;
    quotedPost?: QuotedPost | null;
    onRemoveQuote?: () => void;
    isFirst?: boolean;
    isFocused: boolean;
    onFocus: () => void;
}

const Tweet = ({
    id,
    content,
    onChange,
    quotedPost,
    onRemoveQuote,
    isFirst = false,
    isFocused,
    onFocus,
}: TweetProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, []);

    const currentAccount = useCurrentAccount();

    if (!currentAccount) return null;

    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <UserAvatar pubkey={currentAccount} size="lg" />
            </div>
            <div className="flex-1 relative">
                <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => onChange(id, e.target.value)}
                    onFocus={onFocus}
                    placeholder="What's happening?"
                    className="w-full resize-none overflow-hidden border-none bg-transparent p-0 text-base focus-visible:ring-0"
                    rows={1}
                />

                {isFocused && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => console.log("Attach image")}
                    >
                        <ImageIcon className="h-4 w-4" />
                        <span className="sr-only">Attach image</span>
                    </Button>
                )}

                {isFirst && quotedPost && (
                    <Card className="mt-3 relative border border-muted">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-6 w-6 rounded-full"
                            onClick={onRemoveQuote}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-5 w-5">
                                    <AvatarImage
                                        src={quotedPost.author.avatar || "/placeholder.svg"}
                                        alt={quotedPost.author.name}
                                    />
                                    <AvatarFallback>{quotedPost.author.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{quotedPost.author.name}</span>
                                <span className="text-xs text-muted-foreground">@{quotedPost.author.handle}</span>
                            </div>
                            <p className="text-sm">{quotedPost.content}</p>
                        </CardContent>
                    </Card>
                )}

                <div className="mt-2 text-xs text-muted-foreground">{content.length}/280</div>
            </div>
        </div>
    );
};

interface ThreadComposerProps {
    initialQuote?: QuotedPost | null;
    onChange?: (tweets: { id: string; content: string }[]) => void;
}
export function ThreadComposer({ initialQuote = null, onChange }: ThreadComposerProps) {
    const [tweets, setTweets] = useState<{ id: string; content: string }[]>([{ id: "1", content: "" }]);
    const [quotedPost, setQuotedPost] = useState<QuotedPost | null>(initialQuote);
    useEffect(() => {
        if (onChange) onChange(tweets);
    }, [tweets, onChange]);

    const [focusedTweetId, setFocusedTweetId] = useState("1");

    const handleTweetChange = (id: string, content: string) => {
        setTweets((prev) => prev.map((tweet) => (tweet.id === id ? { ...tweet, content } : tweet)));
    };

    const addTweet = () => {
        const newId = Math.random().toString(36).substring(7);
        setTweets((prev) => [...prev, { id: newId, content: "" }]);
        setFocusedTweetId(newId);
    };

    const removeQuote = () => {
        setQuotedPost(null);
    };

    return (
        <div className="space-y-6">
            <AnimatePresence initial={false}>
                {tweets.map((tweet, index) => (
                    <motion.div
                        key={tweet.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                    >
                        <Tweet
                            id={tweet.id}
                            content={tweet.content}
                            onChange={handleTweetChange}
                            quotedPost={index === 0 ? quotedPost : null}
                            onRemoveQuote={removeQuote}
                            isFirst={index === 0}
                            isFocused={focusedTweetId === tweet.id}
                            onFocus={() => setFocusedTweetId(tweet.id)}
                        />

                        {/* Vertical connecting line */}
                        {index < tweets.length - 1 && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "100%" }}
                                className="absolute left-5 top-10 w-0.5 bg-border"
                                style={{ bottom: "-12px" }}
                            />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Add tweet button with connecting line */}
            <div className="relative">
                {/* Connecting line to the + button */}
                <div className="absolute left-5 top-[-24px] w-0.5 h-6 bg-border" />

                <div className="flex items-center">
                    <Button
                        onClick={addTweet}
                        variant="ghost"
                        className="h-10 w-10 rounded-full border p-0 flex items-center justify-center"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="sr-only">Add Tweet</span>
                    </Button>
                    <span className="ml-4 text-sm text-muted-foreground">Add another tweet</span>
                </div>
            </div>
        </div>
    );
}
