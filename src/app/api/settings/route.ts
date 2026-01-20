import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { geminiApiKey: true },
        });

        return NextResponse.json({
            hasApiKey: !!user?.geminiApiKey,
        });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { apiKey } = await request.json();

        if (!apiKey || typeof apiKey !== "string") {
            return NextResponse.json(
                { error: "API key is required" },
                { status: 400 }
            );
        }

        // Encrypt and store the API key
        const encryptedKey = encrypt(apiKey.trim());

        await prisma.user.update({
            where: { id: session.user.id },
            data: { geminiApiKey: encryptedKey },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving settings:", error);
        return NextResponse.json(
            { error: "Failed to save settings" },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { geminiApiKey: null },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting API key:", error);
        return NextResponse.json(
            { error: "Failed to delete API key" },
            { status: 500 }
        );
    }
}
