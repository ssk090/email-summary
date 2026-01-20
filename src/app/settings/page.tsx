"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Settings() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [apiKey, setApiKey] = useState("");
    const [hasApiKey, setHasApiKey] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
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

    const saveApiKey = async () => {
        if (!apiKey.trim()) {
            setMessage({ type: "error", text: "Please enter an API key" });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey: apiKey.trim() }),
            });

            if (!res.ok) {
                throw new Error("Failed to save API key");
            }

            setMessage({ type: "success", text: "API key saved successfully!" });
            setHasApiKey(true);
            setApiKey("");
        } catch (err) {
            setMessage({ type: "error", text: "Failed to save API key" });
        } finally {
            setSaving(false);
        }
    };

    const deleteApiKey = async () => {
        if (!confirm("Are you sure you want to delete your API key?")) return;

        setDeleting(true);
        setMessage(null);

        try {
            const res = await fetch("/api/settings", { method: "DELETE" });

            if (!res.ok) {
                throw new Error("Failed to delete API key");
            }

            setMessage({ type: "success", text: "API key deleted successfully!" });
            setHasApiKey(false);
        } catch (err) {
            setMessage({ type: "error", text: "Failed to delete API key" });
        } finally {
            setDeleting(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-radial flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-radial">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

                {/* Gemini API Key Section */}
                <div className="card mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Gemini API Key</h2>
                            <p className="text-sm text-muted">
                                Required for AI-powered email summaries
                            </p>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="mb-4">
                        {hasApiKey ? (
                            <div className="flex items-center gap-2 text-success">
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
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span>API key is configured</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-warning">
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
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                <span>No API key configured</span>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {hasApiKey ? "Update API Key" : "Enter API Key"}
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIza..."
                                className="input"
                            />
                        </div>

                        {/* Message */}
                        {message && (
                            <div
                                className={`p-3 rounded-lg ${message.type === "success"
                                        ? "bg-success/20 text-success"
                                        : "bg-danger/20 text-danger"
                                    }`}
                            >
                                {message.text}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={saveApiKey}
                                disabled={saving}
                                className="btn-primary flex-1"
                            >
                                {saving ? "Saving..." : hasApiKey ? "Update Key" : "Save Key"}
                            </button>
                            {hasApiKey && (
                                <button
                                    onClick={deleteApiKey}
                                    disabled={deleting}
                                    className="btn-secondary text-danger hover:border-danger"
                                >
                                    {deleting ? "Deleting..." : "Delete"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Get API Key Help */}
                <div className="card">
                    <h3 className="font-semibold mb-3">How to get a Gemini API key</h3>
                    <ol className="space-y-2 text-muted">
                        <li className="flex gap-2">
                            <span className="text-primary font-semibold">1.</span>
                            <span>
                                Go to{" "}
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    Google AI Studio
                                </a>
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary font-semibold">2.</span>
                            <span>Sign in with your Google account</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary font-semibold">3.</span>
                            <span>Click "Create API Key"</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary font-semibold">4.</span>
                            <span>Copy the key and paste it above</span>
                        </li>
                    </ol>
                    <p className="mt-4 text-sm text-muted">
                        Your API key is encrypted and stored securely. We never share it with
                        third parties.
                    </p>
                </div>
            </div>
        </div>
    );
}
