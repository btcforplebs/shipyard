"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// Mock data for collaborators
const collaborators = [
    {
        id: "1",
        name: "Alice Smith",
        email: "alice@example.com",
        avatar: "/placeholder-user.jpg",
        role: "editor",
    },
    {
        id: "2",
        name: "Bob Johnson",
        email: "bob@example.com",
        avatar: "/placeholder-user.jpg",
        role: "viewer",
    },
];

export function InvitationSettings() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleInvite = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Invitation sent",
                description: "Your invitation has been sent successfully.",
            });
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Invite Collaborators</CardTitle>
                    <CardDescription>Invite others to publish content from your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="flex gap-2">
                            <Input id="email" placeholder="collaborator@example.com" />
                            <Button onClick={handleInvite} disabled={isLoading}>
                                {isLoading ? "Sending..." : "Invite"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Permissions</Label>
                        <div className="flex items-center space-x-2">
                            <Switch id="draft" defaultChecked />
                            <Label htmlFor="draft">Allow creating drafts</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="publish" defaultChecked />
                            <Label htmlFor="publish">Allow publishing content</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="schedule" defaultChecked />
                            <Label htmlFor="schedule">Allow scheduling content</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Current Collaborators</CardTitle>
                    <CardDescription>Manage people who can publish content from your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {collaborators.map((collaborator) => (
                            <div
                                key={collaborator.id}
                                className="flex items-center justify-between p-2 border rounded-md"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage
                                            src={collaborator.avatar || "/placeholder.svg"}
                                            alt={collaborator.name}
                                        />
                                        <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{collaborator.name}</p>
                                        <p className="text-sm text-muted-foreground">{collaborator.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={collaborator.role === "editor" ? "default" : "secondary"}>
                                        {collaborator.role === "editor" ? "Editor" : "Viewer"}
                                    </Badge>
                                    <Button variant="ghost" size="sm">
                                        Edit
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-destructive">
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
