"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export function LongFormEditor() {
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");

    return (
        <div className="space-y-6">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full border-none bg-transparent p-0 text-3xl font-bold focus:outline-none focus-visible:ring-0"
            />

            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your long-form content..."
                className="min-h-[50vh] w-full resize-none border-none bg-transparent p-0 text-lg leading-relaxed focus-visible:ring-0"
            />
        </div>
    );
}
