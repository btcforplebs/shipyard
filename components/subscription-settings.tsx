"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SubscriptionSettings() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("pro");
    const [customAmount, setCustomAmount] = useState("30");

    const handleUpgrade = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Subscription updated",
                description: "Your subscription has been updated successfully.",
            });
        }, 1000);
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">Your Subscription</h2>
                <p className="text-muted-foreground">Manage your subscription plan and billing information.</p>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="px-2 py-1">
                            <Sparkles className="h-3 w-3 text-yellow-500 mr-1" /> PRO
                        </Badge>
                        <span className="font-medium">Current Plan</span>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">${customAmount}/month</p>
                        <p className="text-sm text-muted-foreground">Next billing date: June 15, 2023</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label>Subscription Plan</Label>
                    <RadioGroup defaultValue={selectedPlan} onValueChange={setSelectedPlan} className="grid gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="free" id="free" />
                            <Label
                                htmlFor="free"
                                className="flex flex-1 items-center justify-between cursor-pointer"
                            >
                                <div>
                                    <p className="font-medium">Free</p>
                                    <p className="text-sm text-muted-foreground">
                                        Basic features, no advanced triggers
                                    </p>
                                </div>
                                <p className="font-bold">$0/month</p>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pro" id="pro" />
                            <Label
                                htmlFor="pro"
                                className="flex flex-1 items-center justify-between cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">Pro</p>
                                    <Badge className="px-1 py-0 text-xs">
                                        <Sparkles className="h-3 w-3 mr-1" /> POPULAR
                                    </Badge>
                                </div>
                                <p className="font-bold">$30/month</p>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label
                                htmlFor="custom"
                                className="flex flex-1 items-center justify-between cursor-pointer"
                            >
                                <div>
                                    <p className="font-medium">Custom</p>
                                    <p className="text-sm text-muted-foreground">
                                        Pay what you want (minimum $30/month)
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-2">$</span>
                                    <Input
                                        type="number"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(e.target.value)}
                                        className="w-20"
                                        min="30"
                                    />
                                    <span className="ml-2">/month</span>
                                </div>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="flex justify-between">
                    <Button variant="outline">Cancel Subscription</Button>
                    <Button onClick={handleUpgrade} disabled={isLoading}>
                        {isLoading ? "Processing..." : "Update Subscription"}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight">Pro Features</h2>
                    <p className="text-muted-foreground">What you get with your Pro subscription.</p>
                </div>

                <ul className="space-y-2">
                    <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>Advanced trigger-based scheduling</span>
                    </li>
                    <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>Unlimited queues and scheduled posts</span>
                    </li>
                    <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>Analytics and engagement tracking</span>
                    </li>
                    <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>Priority support</span>
                    </li>
                    <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>Early access to new features</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
