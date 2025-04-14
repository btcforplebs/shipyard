"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

interface EditorProps {
    content: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
    showCharacterCount?: boolean;
    isRichText?: boolean;
}

export function Editor({
    content,
    onChange,
    placeholder = "Start writing...",
    maxLength,
    showCharacterCount = false,
    isRichText = false,
}: EditorProps) {
    const [characterCount, setCharacterCount] = useState(0);

    useEffect(() => {
        setCharacterCount(content.length);
    }, [content]);

    // In a real implementation, we would use a rich text editor like TipTap
    // For this demo, we'll use a simple textarea with some styling

    if (isRichText) {
        return (
            <div className="space-y-2">
                <div className="border rounded-md p-4 min-h-[300px]">
                    <div className="flex space-x-2 mb-2 border-b pb-2">
                        <button className="p-1 hover:bg-muted rounded">B</button>
                        <button className="p-1 hover:bg-muted rounded">I</button>
                        <button className="p-1 hover:bg-muted rounded">U</button>
                        <button className="p-1 hover:bg-muted rounded">H1</button>
                        <button className="p-1 hover:bg-muted rounded">H2</button>
                        <button className="p-1 hover:bg-muted rounded">List</button>
                        <button className="p-1 hover:bg-muted rounded">Link</button>
                    </div>
                    <Textarea
                        value={content}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="min-h-[250px] border-none focus-visible:ring-0 resize-none p-0"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Textarea
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                className="min-h-[150px] resize-none"
            />
            {showCharacterCount && maxLength && (
                <div className="text-xs text-muted-foreground text-right">
                    {characterCount} / {maxLength} characters
                </div>
            )}
        </div>
    );
}
