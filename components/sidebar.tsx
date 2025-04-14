"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Clock, Users, Settings, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Queues",
        icon: Clock,
        href: "/dashboard/queues",
        color: "text-pink-700",
    },
    {
        label: "Collaborators",
        icon: Users,
        href: "/dashboard/collaborators",
        color: "text-orange-500",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
        color: "text-gray-500",
    },
];

export function Sidebar() {
    const pathname = usePathname();

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
                                {route.label}
                            </Button>
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="p-4 mt-auto">
                <Card className="bg-gradient-to-br from-violet-500/10 to-pink-500/10 border-violet-500/20">
                    <CardHeader className="pb-2">
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
            </div>
        </div>
    );
}
