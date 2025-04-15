"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Clock, Users, Settings, Sparkles, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSessionStore } from "@/stores/session";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Collaborators",
        icon: Users,
        href: "/dashboard/collaborators",
        color: "text-orange-500",
        isPro: true,
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
        color: "text-gray-500",
    },
];

// PRO label component with gradient
const ProLabel = () => (
    <Badge
        className="ml-2 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 border-none text-white text-xs font-semibold px-2 py-0.5"
        aria-label="Pro feature"
    >
        PRO
    </Badge>
);

// Compact PRO upgrade button with gradient text
const CompactProUpgrade = () => (
    <Button variant="ghost" size="sm" className="w-full mt-2 justify-start">
        <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent font-medium">
            Upgrade to PRO
        </span>
    </Button>
);

export function Sidebar() {
    const pathname = usePathname();
    const { isProCardDismissed, setProCardDismissed } = useSessionStore();

    return (
        <div className="fixed top-16 left-0 flex h-[calc(100vh-4rem)] w-64 flex-col border-r bg-background">
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {routes.map((route) => (
                        <Link key={route.href} href={route.href}>
                            <Button
                                variant={pathname === route.href ? "secondary" : "ghost"}
                                className={cn("w-full justify-start gap-2", pathname === route.href && "bg-muted")}
                            >
                                <route.icon className={cn("h-4 w-4", route.color)} />
                                <span className="flex items-center">
                                    {route.label}
                                    {route.isPro && <ProLabel />}
                                </span>
                            </Button>
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="p-4 mt-auto">
                {isProCardDismissed ? (
                    <CompactProUpgrade />
                ) : (
                    <Card className="bg-gradient-to-br from-violet-500/10 to-pink-500/10 border-violet-500/20 relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-6 w-6 rounded-full p-0 opacity-70 hover:opacity-100"
                            onClick={() => setProCardDismissed(true)}
                        >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Dismiss</span>
                        </Button>
                        <CardHeader className="pb-2 pt-6">
                            <CardTitle className="flex items-center text-base">
                                <Sparkles className="h-4 w-4 text-yellow-500 mr-2" />
                                Upgrade to Pro
                            </CardTitle>
                            <CardDescription>Unlock advanced features</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                            <p className="text-sm">
                                Schedule posts based on when specific users come online. Perfect for maximizing engagement.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" size="sm">
                                Upgrade Now
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
}
