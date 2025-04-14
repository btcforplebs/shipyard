"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, MessageSquare, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface NewPostProps {
    variant?: "default" | "outline" | "ghost" | "primary";
    size?: "default" | "sm" | "lg" | "icon";
    showIcon?: boolean;
    showText?: boolean;
}

export function NewPost({ variant = "default", size = "default", showIcon = true, showText = true }: NewPostProps) {
    const router = useRouter();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} className="gap-2">
                    {showIcon && <Plus className="h-4 w-4" />}
                    {showText && "New Post"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/compose/short")} className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Short-form Post</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/compose/long")} className="gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Long-form Post</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
