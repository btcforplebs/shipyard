"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCurrentAccount } from "@/hooks/use-current-account";

export default function Home() {
    const currentAccount = useCurrentAccount();
    const isLoggedIn = !!currentAccount;

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">Shipyard</span>
                    </div>
                    <nav className="flex items-center gap-4">
                        {isLoggedIn ? (
                            <Link href="/dashboard">
                                <Button>Dashboard</Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button>Login</Button>
                            </Link>
                        )}
                    </nav>
                </div>
            </header>
            <main className="flex-1">
                <section className="container py-24 space-y-8 md:py-32">
                    <div className="mx-auto max-w-3xl text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                            A Quiet Space for Loud Ideas
                        </h1>
                        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                            Focused Writing for Nostr
                        </p>
                        <div className="flex justify-center gap-4">
                            {isLoggedIn ? (
                                <Link href="/dashboard">
                                    <Button size="lg" className="gap-2">
                                        Go to Dashboard <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/login">
                                    <Button size="lg" className="gap-2">
                                        Start Writing <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            )}
                            <Link href="/features">
                                <Button size="lg" variant="outline">
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
                <section className="container py-12 md:py-24">
                    <div className="grid gap-12 md:grid-cols-3">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">Schedule Your Ideas</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Plan your content ahead with time-based scheduling and advanced triggers.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">Manage Your Queue</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Organize your content with list and calendar views for enhanced management.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">Collaborate</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Invite others to publish content from your account and switch between accounts easily.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="border-t py-6">
                <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-sm text-gray-500 dark:text-gray-400">© 2023 Shipyard. All rights reserved.</p>
                    <nav className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <Link href="/terms">Terms</Link>
                        <Link href="/privacy">Privacy</Link>
                        <Link href="/contact">Contact</Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
