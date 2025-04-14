import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
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
                                <Button className="w-full">Login with Browser Extension</Button>
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
}
