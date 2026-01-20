import { google } from "googleapis";

export interface EmailMessage {
    id: string;
    subject: string;
    from: string;
    snippet: string;
    body: string;
    date: string;
}

// Keywords to filter placement-related emails
const PLACEMENT_KEYWORDS = [
    "placement",
    "recruitment",
    "career",
    "hiring",
    "job opportunity",
    "campus drive",
    "job opening",
    "walk-in",
    "interview",
    "offer letter",
    "internship",
    "fresher",
    "graduate",
    "trainee",
    "tpo",
    "cdc",
    "career services",
    "talent acquisition",
];

export async function getGmailClient(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    return google.gmail({ version: "v1", auth: oauth2Client });
}

export async function fetchPlacementEmails(
    accessToken: string,
    maxResults: number = 50
): Promise<EmailMessage[]> {
    const gmail = await getGmailClient(accessToken);

    // Build search query for placement-related emails
    const searchQuery = PLACEMENT_KEYWORDS.map((k) => `subject:${k}`).join(" OR ");

    try {
        // List messages matching the query
        const response = await gmail.users.messages.list({
            userId: "me",
            q: searchQuery,
            maxResults,
        });

        const messages = response.data.messages || [];
        const emails: EmailMessage[] = [];

        // Fetch full message details for each
        for (const message of messages) {
            if (!message.id) continue;

            const fullMessage = await gmail.users.messages.get({
                userId: "me",
                id: message.id,
                format: "full",
            });

            const headers = fullMessage.data.payload?.headers || [];
            const subject =
                headers.find((h) => h.name?.toLowerCase() === "subject")?.value ||
                "No Subject";
            const from =
                headers.find((h) => h.name?.toLowerCase() === "from")?.value ||
                "Unknown";
            const date =
                headers.find((h) => h.name?.toLowerCase() === "date")?.value || "";

            // Extract body
            let body = "";
            const payload = fullMessage.data.payload;

            if (payload?.body?.data) {
                body = Buffer.from(payload.body.data, "base64").toString("utf-8");
            } else if (payload?.parts) {
                // Handle multipart messages
                const textPart = payload.parts.find(
                    (p) => p.mimeType === "text/plain" || p.mimeType === "text/html"
                );
                if (textPart?.body?.data) {
                    body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
                }
            }

            // Strip HTML tags for cleaner text
            body = body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

            emails.push({
                id: message.id,
                subject,
                from,
                snippet: fullMessage.data.snippet || "",
                body: body.slice(0, 5000), // Limit body length
                date,
            });
        }

        return emails;
    } catch (error) {
        console.error("Error fetching emails:", error);
        throw error;
    }
}
