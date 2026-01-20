"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SummaryCard from "@/components/SummaryCard";

interface Summary {
    id: string;
    emailId: string;
    subject: string;
    from: string;
    snippet: string | null;
    summary: string;
    company: string | null;
    jobRole: string | null;
    deadline: string | null;
    createdAt: string;
}

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [summaries, setSummaries] = useState<Summary[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasApiKey, setHasApiKey] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            fetchSummaries();
            checkApiKey();
        }
    }, [session]);

    const checkApiKey = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();
            setHasApiKey(data.hasApiKey);
        } catch (err) {
            console.error("Error checking API key:", err);
        }
    };

    const fetchSummaries = async () => {
        try {
            const res = await fetch("/api/emails");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setSummaries(data.summaries || []);
        } catch (err) {
            setError("Failed to load summaries");
        } finally {
            setLoading(false);
        }
    };

    const refreshEmails = async () => {
        setRefreshing(true);
        setError(null);
        
        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch("/api/emails");
                if (res.ok) {
                    const data = await res.json();
                    setSummaries(data.summaries || []);
                }
            } catch (err) {
                console.error("Error polling summaries:", err);
            }
        }, 3000);

        try {
            const res = await fetch("/api/emails", { method: "POST" });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to refresh");
            }
            clearInterval(pollInterval);
            setSummaries(data.summaries || []);
            if (data.newCount > 0) {
                alert(`Found ${data.newCount} new placement emails!`);
            } else {
                alert("No new placement emails found.");
            }
        } catch (err: any) {
            clearInterval(pollInterval);
            setError(err.message || "Failed to refresh emails");
        } finally {
            setRefreshing(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-gradient-radial flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted">Loading your summaries...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-radial">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                        <p className="text-muted mt-1">
                            {summaries.length} placement email{summaries.length !== 1 ? "s" : ""}{" "}
                            summarized
                        </p>
                    </div>
                    <button
                        onClick={refreshEmails}
                        disabled={refreshing || !hasApiKey}
                        className="btn-primary"
                    >
                        {refreshing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing emails (5s delay between each)...
                            </>
                        ) : (
                            <>
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                Refresh Emails
                            </>
                        )}
                    </button>
                </div>

                {/* API Key Warning */}
                {!hasApiKey && (
                    <div className="glass rounded-xl p-4 mb-8 border-warning/50 bg-warning/10">
                        <div className="flex items-center gap-3">
                            <svg
                                className="w-6 h-6 text-warning"
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
                            <div>
                                <p className="font-medium text-warning">API Key Required</p>
                                <p className="text-sm text-muted">
                                    Please{" "}
                                    <a href="/settings" className="text-primary hover:underline">
                                        add your Gemini API key
                                    </a>{" "}
                                    to start summarizing emails.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="glass rounded-xl p-4 mb-8 border-danger/50 bg-danger/10">
                        <p className="text-danger">{error}</p>
                    </div>
                )}

                {/* Summaries Grid */}
                {summaries.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {summaries.map((summary, index) => (
                            <div
                                key={summary.id}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <SummaryCard {...summary} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                            <svg
                                className="w-12 h-12 text-muted"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No summaries yet</h3>
                        <p className="text-muted mb-6">
                            Click "Refresh Emails" to scan your inbox for placement emails.
                        </p>
                        {hasApiKey && (
                            <button
                                onClick={refreshEmails}
                                disabled={refreshing}
                                className="btn-primary"
                            >
                                Scan Inbox Now
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
