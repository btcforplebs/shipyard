"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export function AccountSettings() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Settings saved",
                description: "Your account settings have been updated.",
            });
        }, 1000);
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
                <p className="text-muted-foreground">Manage your public profile information.</p>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Button variant="outline">Change Avatar</Button>
                </div>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="display-name">Display Name</Label>
                        <Input id="display-name" defaultValue="John Doe" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue="johndoe" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" defaultValue="Writer, developer, and Nostr enthusiast." />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" defaultValue="https://johndoe.com" />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
