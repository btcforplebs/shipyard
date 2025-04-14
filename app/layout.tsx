import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Shipyard - A Quiet Space for Loud Ideas",
    description: "Focused Writing for Nostr",
    generator: "v0.dev",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <NDKProvider>{children}</NDKProvider>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}

import "./globals.css";
import { NDKProvider } from "@/components/providers/ndk";
