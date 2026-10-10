
"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = {
    error: string | null;
};

export async function loginAction(
    _previousState: LoginState,
    formData: FormData
): Promise<LoginState> {
    const email = formData.get("email");
    const password = formData.get("password");

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
    ) {
        return { error: "Please enter your email and password." };
    }

    try {
        await signIn("credentials", {
            email: email.trim().toLowerCase(),
            password,
            redirectTo: "/dashboard",
        });

        return { error: null };
    } catch (error: unknown) {
        // Auth.js uses a redirect signal after successful sign-in.
        // Re-throw it so Next.js can complete the redirect.
        if (error instanceof AuthError) {
            return { error: "Invalid email or password." };
        }

        throw error;
    }
}
