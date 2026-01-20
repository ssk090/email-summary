import { GoogleGenerativeAI } from "@google/generative-ai";

export interface EmailSummary {
    summary: string;
    company: string | null;
    jobRole: string | null;
    deadline: string | null;
    eligibility: string | null;
    applicationLink: string | null;
}

const SUMMARY_PROMPT = `You are an email summarizer for college placement/job opportunity emails. 
Analyze the following email and extract key information.

Return a JSON object with these fields:
- summary: A concise 2-3 sentence summary of the opportunity
- company: Company name (or null if not found)
- jobRole: Job title/role (or null if not found)
- deadline: Application deadline (or null if not found)
- eligibility: Key eligibility criteria like CGPA, branch (or null if not found)
- applicationLink: Application URL (or null if not found)

IMPORTANT: Return ONLY valid JSON, no markdown formatting or code blocks.

Email Subject: {subject}
From: {from}

Email Body:
{body}`;

export async function summarizeEmail(
    apiKey: string,
    subject: string,
    from: string,
    body: string
): Promise<EmailSummary> {
    if (!apiKey || apiKey.trim().length === 0) {
        throw new Error("Gemini API key is missing or invalid");
    }

    if (!body || body.trim().length === 0) {
        console.warn("⚠️ Email body is empty, using snippet instead");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const emailBody = body.trim() || "Email body not available";
    const prompt = SUMMARY_PROMPT.replace("{subject}", subject)
        .replace("{from}", from)
        .replace("{body}", emailBody);

    try {
        console.log("🔍 Calling Gemini API...");
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        if (!response || response.trim().length === 0) {
            throw new Error("Empty response from Gemini API");
        }

        const cleanedResponse = response
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

        const parsed = JSON.parse(cleanedResponse) as EmailSummary;

        return {
            summary: parsed.summary || "Could not generate summary",
            company: parsed.company || null,
            jobRole: parsed.jobRole || null,
            deadline: parsed.deadline || null,
            eligibility: parsed.eligibility || null,
            applicationLink: parsed.applicationLink || null,
        };
    } catch (error) {
        console.error("❌ Error summarizing email:", error);
        if (error instanceof Error) {
            console.error("❌ Error message:", error.message);
            if (error.message.includes("API_KEY")) {
                throw new Error("Invalid Gemini API key. Please check your API key in settings.");
            }
            if (error.message.includes("quota") || error.message.includes("rate limit")) {
                throw new Error("Gemini API quota exceeded. Please try again later.");
            }
        }
        throw error;
    }
}
