"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NDKNip07Signer, NDKEvent } from "@nostr-dev-kit/ndk";
import ndk from "@/lib/nostr/ndk";
import { useNDKSessions } from "@nostr-dev-kit/ndk-hooks";
import { useSessionStore } from "@/stores/session";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import { Toaster } from "@/components/ui/sonner";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const sessions = useNDKSessions();
    const setCurrentAccount = useSessionStore((state) => state.setCurrentAccount);
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Toaster />
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <Link href="/" className="text-2xl font-bold">
                            Shipyard
                        </Link>
                    </div>
                    <CardTitle className="text-2xl text-center">Welcome to Shipyard</CardTitle>
                    <CardDescription className="text-center">
                        Login to your account using one of the methods below
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Tabs defaultValue="extension" className="space-y-4">
                        <TabsList className="grid grid-cols-3 w-full">
                            <TabsTrigger value="extension">Extension</TabsTrigger>
                            <TabsTrigger value="remote">Remote Signer</TabsTrigger>
                            <TabsTrigger value="private">Private Key</TabsTrigger>
                        </TabsList>

                        <TabsContent value="extension" className="space-y-4">
                            <div className="text-center space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Connect using your Nostr browser extension
                                </p>
                                <Button
                                    className="w-full"
                                    onClick={handleExtensionLogin}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Connecting..." : "Login with Browser Extension"}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="remote" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="connection-string">Connection String</Label>
                                <Textarea
                                    id="connection-string"
                                    placeholder="bunker://..."
                                    className="min-h-[100px] resize-none"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the connection string provided by your nsecBunker or other remote signer.
                                </p>
                            </div>
                            <Button className="w-full">Connect</Button>
                        </TabsContent>

                        <TabsContent value="private" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nsec">Private Key (nsec)</Label>
                                <Input id="nsec" type="password" placeholder="nsec1..." />
                                <p className="text-xs text-muted-foreground">
                                    Your private key will be encrypted and stored securely on this device.
                                </p>
                            </div>
                            <Button className="w-full">Login</Button>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-xs text-muted-foreground">
                        By logging in, you agree to our{" "}
                        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                            Privacy Policy
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );

    /**
     * Handles login with browser extension using NIP-07
     */
    async function handleExtensionLogin() {
        try {
            setIsLoading(true);

            // Check if window.nostr is available (NIP-07 extension)
            if (!window.nostr) {
                toast.error("No Nostr extension found. Please install a Nostr browser extension.");
                return;
            }

            // Create a NIP-07 signer
            const signer = new NDKNip07Signer();
            
            // Connect NDK with the signer
            ndk.signer = signer;
            
            // Get the user's public key
            const pubkey = await signer.user();
            
            if (!pubkey?.pubkey) {
                toast.error("Failed to get public key from extension");
                return;
            }

            // Create a NIP-98 AUTH event
            const event = await createNIP98AuthEvent(signer, "/api/auth/login", "POST");
            
            if (!event) {
                toast.error("Failed to create authentication event");
                return;
            }

            // Send the event to the backend using our API utility
            const data = await apiPost("/api/auth/login", {
                event: event.rawEvent()
            });

            
            // Store the JWT token in localStorage for API requests
            localStorage.setItem("auth_token", data.token);
            
            // Store the JWT token in a cookie for the middleware
            document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
            
            // Add the session to NDK
            await sessions.addSession(signer);
            
            // Update the session store
            setCurrentAccount({ pubkey: pubkey.pubkey });
            
            // Format pubkey for display
            const formattedPubkey = `${pubkey.pubkey.substring(0, 6)}...${pubkey.pubkey.substring(pubkey.pubkey.length - 4)}`;
            toast.success(`Login successful! Logged in as npub: ${formattedPubkey}`);
            
            // Redirect to dashboard
            router.push("/dashboard");
        } catch (error) {
            console.error("Login error:", error);
            toast.error(`Login failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Creates a NIP-98 AUTH event for authentication
     */
    async function createNIP98AuthEvent(
        signer: NDKNip07Signer,
        url: string,
        method: string
    ) {
        try {
            // Create a new event directly
            const event = new NDKEvent(ndk);
            
            // Set event properties
            event.kind = 27235; // NIP-98 AUTH event kind
            event.content = ""; // Content can be empty for AUTH events
            event.tags = [
                ["u", url], // URL being accessed
                ["method", method], // HTTP method
            ];
            event.created_at = Math.floor(Date.now() / 1000); // Current timestamp

            // Sign the event
            await event.sign(signer);
            
            return event;
        } catch (error) {
            console.error("Error creating NIP-98 event:", error);
            return null;
        }
    }
}
