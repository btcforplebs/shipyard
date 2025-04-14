"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface NewQueueDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewQueueDialog({ open, onOpenChange }: NewQueueDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!name) return;

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Queue created",
                description: `Queue "${name}" has been created successfully.`,
            });
            setName("");
            setDescription("");
            onOpenChange(false);
        }, 1000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Queue</DialogTitle>
                    <DialogDescription>Create a new queue to organize your scheduled content.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Queue Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Important, Evergreen, Weekly Tips"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What kind of content goes in this queue?"
                            className="min-h-[80px]"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading || !name}>
                        {isLoading ? "Creating..." : "Create Queue"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
