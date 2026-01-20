"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function Navbar() {
    const { data: session, status } = useSession();

    return (
        <nav className="glass sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-hover to-accent bg-clip-text text-transparent">
                            PlacementHub
                        </span>
                    </Link>

                    {status === "loading" && (
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    )}

                    {session?.user && (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="text-muted hover:text-foreground transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/settings"
                                className="text-muted hover:text-foreground transition-colors"
                            >
                                Settings
                            </Link>
                            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
                                {session.user.image && (
                                    <Image
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        width={32}
                                        height={32}
                                        className="rounded-full border-2 border-primary/50"
                                    />
                                )}
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-sm font-medium text-foreground">
                                        {session.user.name}
                                    </span>
                                    <span className="text-xs text-muted">
                                        {session.user.email}
                                    </span>
                                </div>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="ml-2 px-3 py-1.5 text-sm bg-secondary hover:bg-danger/20 text-muted hover:text-danger border border-border hover:border-danger/50 rounded-lg transition-all"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
