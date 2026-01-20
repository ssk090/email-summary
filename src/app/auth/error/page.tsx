"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const errorMessages: Record<string, { title: string; description: string }> = {
        AccessDenied: {
            title: "Access Denied",
            description:
                "You don't have permission to sign in. Make sure you've been added as a test user in the Google Cloud Console, or the Gmail API scope is properly configured.",
        },
        Configuration: {
            title: "Configuration Error",
            description:
                "There's an issue with the server configuration. Please check your environment variables.",
        },
        Verification: {
            title: "Verification Error",
            description: "The verification link may have expired or already been used.",
        },
        Default: {
            title: "Authentication Error",
            description: "An error occurred during authentication. Please try again.",
        },
    };

    const { title, description } = errorMessages[error || ""] || errorMessages.Default;

    return (
        <div className="min-h-screen bg-gradient-radial flex items-center justify-center p-4">
            <div className="card max-w-md w-full text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-danger/20 flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-danger"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
                <p className="text-muted mb-6">{description}</p>

                {error === "AccessDenied" && (
                    <div className="text-left mb-6 p-4 bg-secondary rounded-lg">
                        <p className="text-sm font-medium text-foreground mb-2">To fix this:</p>
                        <ol className="text-sm text-muted space-y-1 list-decimal list-inside">
                            <li>Go to Google Cloud Console</li>
                            <li>Navigate to APIs & Services → OAuth consent screen</li>
                            <li>Add your email as a Test User</li>
                            <li>Make sure Gmail API scope is added</li>
                        </ol>
                    </div>
                )}

                <Link href="/" className="btn-primary inline-block">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-radial flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <AuthErrorContent />
        </Suspense>
    );
}
