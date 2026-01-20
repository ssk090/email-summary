import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            console.log("SignIn Callback - User:", user?.email);
            console.log("SignIn Callback - Account Scopes:", account?.scope);

            if (!user?.email || !account) {
                console.error("SignIn Denied: Missing user email or account");
                return false;
            }

            try {
                console.log("🔍 Attempting to upsert user:", user.email);
                console.log("🔍 DATABASE_URL available:", !!process.env.DATABASE_URL);
                
                const result = await prisma.user.upsert({
                    where: { email: user.email },
                    update: {
                        name: user.name,
                        image: user.image,
                        accessToken: account.access_token,
                        refreshToken: account.refresh_token,
                        tokenExpiry: account.expires_at
                            ? new Date(account.expires_at * 1000)
                            : null,
                    },
                    create: {
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        accessToken: account.access_token,
                        refreshToken: account.refresh_token,
                        tokenExpiry: account.expires_at
                            ? new Date(account.expires_at * 1000)
                            : null,
                    },
                });

                console.log("✅ SignIn Success - User upserted:", result.email, "ID:", result.id);
                return true;
            } catch (error) {
                console.error("❌ SignIn Callback - Database Error:", error);
                if (error instanceof Error) {
                    console.error("❌ Error message:", error.message);
                    console.error("❌ Error stack:", error.stack);
                }
                return false;
            }
        },
        async jwt({ token, account }) {
            // Persist access token in JWT
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.expiresAt = account.expires_at;
            }
            return token;
        },
        async session({ session, token }) {
            // Add user ID and access token to session
            if (session.user?.email) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: session.user.email },
                    });
                    if (dbUser) {
                        session.user.id = dbUser.id;
                        session.accessToken = token.accessToken as string;
                    }
                } catch (error) {
                    console.error("Session Callback - Database Error:", error);
                }
            }
            return session;
        },
    },
    pages: {
        signIn: "/",
        error: "/auth/error",
    },
});
