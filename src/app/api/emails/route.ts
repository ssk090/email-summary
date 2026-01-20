import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchPlacementEmails } from "@/lib/gmail";
import { summarizeEmail } from "@/lib/gemini";
import { decrypt } from "@/lib/encryption";

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Get existing summaries for this user
        const summaries = await prisma.summary.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ summaries });
    } catch (error) {
        console.error("Error fetching summaries:", error);
        return NextResponse.json(
            { error: "Failed to fetch summaries" },
            { status: 500 }
        );
    }
}

export async function POST() {
    const session = await auth();

    if (!session?.user?.id || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Get user's API key
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user?.geminiApiKey) {
            return NextResponse.json(
                { error: "Please set your Gemini API key in settings first" },
                { status: 400 }
            );
        }

        let apiKey: string;
        try {
            apiKey = decrypt(user.geminiApiKey);
            if (!apiKey || apiKey.trim().length === 0) {
                return NextResponse.json(
                    { error: "Invalid API key. Please set a valid Gemini API key in settings" },
                    { status: 400 }
                );
            }
            console.log("✅ API key decrypted successfully, length:", apiKey.length);
        } catch (error) {
            console.error("❌ Error decrypting API key:", error);
            return NextResponse.json(
                { error: "Failed to decrypt API key. Please set it again in settings" },
                { status: 400 }
            );
        }

        // Fetch placement emails
        const emails = await fetchPlacementEmails(session.accessToken);

        // Get existing email IDs to avoid duplicates
        const existingEmailIds = new Set(
            (
                await prisma.summary.findMany({
                    where: { userId: session.user.id },
                    select: { emailId: true },
                })
            ).map((s) => s.emailId)
        );

        const newSummaries = [];
        const totalEmails = emails.filter((email) => !existingEmailIds.has(email.id)).length;
        let processedCount = 0;

        for (const email of emails) {
            if (existingEmailIds.has(email.id)) continue;

            processedCount++;
            console.log(`📧 Processing email ${processedCount}/${totalEmails}: ${email.subject}`);

            try {
                console.log(`🔍 Summarizing email: ${email.subject}`);
                console.log(`🔍 Email body length: ${email.body.length}`);
                
                const summary = await summarizeEmail(
                    apiKey,
                    email.subject,
                    email.from,
                    email.body
                );

                console.log(`✅ Summary generated:`, summary);

                const saved = await prisma.summary.create({
                    data: {
                        userId: session.user.id,
                        emailId: email.id,
                        subject: email.subject,
                        from: email.from,
                        snippet: email.snippet,
                        summary: summary.summary,
                        company: summary.company,
                        deadline: summary.deadline,
                        jobRole: summary.jobRole,
                    },
                });

                newSummaries.push(saved);
                console.log(`✅ Saved summary ${processedCount}/${totalEmails}`);
            } catch (error) {
                console.error(`❌ Error processing email ${email.id}:`, error);
                if (error instanceof Error) {
                    console.error(`❌ Error message:`, error.message);
                }
                
                const saved = await prisma.summary.create({
                    data: {
                        userId: session.user.id,
                        emailId: email.id,
                        subject: email.subject,
                        from: email.from,
                        snippet: email.snippet,
                        summary: `Failed to generate summary: ${error instanceof Error ? error.message : "Unknown error"}`,
                        company: null,
                        deadline: null,
                        jobRole: null,
                    },
                });
                
                newSummaries.push(saved);
            }

            if (processedCount < totalEmails) {
                console.log(`⏳ Waiting 5 seconds before processing next email...`);
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }

        // Return all summaries
        const allSummaries = await prisma.summary.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            summaries: allSummaries,
            newCount: newSummaries.length,
        });
    } catch (error) {
        console.error("Error processing emails:", error);
        return NextResponse.json(
            { error: "Failed to process emails" },
            { status: 500 }
        );
    }
}
