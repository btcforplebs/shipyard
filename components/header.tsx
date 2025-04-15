"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Bell, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { AccountSwitcher } from "@/components/account-switcher";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header() {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-10 border-b bg-background">
            <div className="flex h-16 items-center px-6">
                <div className="flex items-center gap-2 md:hidden">
                    <span className="text-xl font-bold">Shipyard</span>
                </div>
                <div className="hidden md:flex md:items-center md:gap-2">
                    <AccountSwitcher />
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={"default"}>
                                <Plus className="h-4 w-4" />
                                New Post
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
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                    </Button>
                    <Link href="/dashboard/settings">
                        <Button variant="ghost" size="icon">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </Link>
                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}
