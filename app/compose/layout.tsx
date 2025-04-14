import type React from "react";

export default function ComposeLayout({ children }: { children: React.ReactNode }) {
    return <div className="min-h-screen bg-background">{children}</div>;
}
