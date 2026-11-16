
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { CredentialsSignin } from "next-auth";
import { checkLoginRateLimit } from "@/lib/auth-rate-limit";
import { db } from "@/lib/db";

class LoginRateLimitError extends CredentialsSignin {
    code = "rate_limited";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: {
        strategy: "jwt",
    },

    pages: {
        signIn: "/login",
    },

    providers: [
        Credentials({
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                },
                password: {
                    label: "Password",
                    type: "password",
                },
            },

            async authorize(credentials, request) {
                const parsedCredentials = z
                    .object({
                        email: z.string().trim().email(),
                        password: z.string().min(1),
                    })
                    .safeParse(credentials);

                if (!parsedCredentials.success) {
                    return null;
                }

                const { email, password } = parsedCredentials.data;

                const allowed = await checkLoginRateLimit(request, email);

                if (!allowed) {
                    throw new LoginRateLimitError();
                }

                const user = await db.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    return null;
                }

                const passwordMatches = await bcrypt.compare(
                    password,
                    user.passwordHash
                );

                if (!passwordMatches) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };
            },
        }),
    ],

    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }

            return session;
        },
    },
});


