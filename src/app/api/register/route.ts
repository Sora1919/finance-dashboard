
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters.")
        .max(80, "Name must be 80 characters or fewer."),

    email: z
        .string()
        .trim()
        .email("Please enter a valid email address.")
        .max(254)
        .transform((email) => email.toLowerCase()),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .max(72, "Password must be 72 characters or fewer.")
        .refine(
            (password) => Buffer.byteLength(password, "utf8") <= 72,
            "Password is too long."
        ),
});

export async function POST(request: Request) {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { message: "Invalid JSON request." },
            { status: 400 }
        );
    }

    const result = registerSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json(
            {
                message: "Please check your registration details.",
                errors: result.error.flatten().fieldErrors,
            },
            { status: 400 }
        );
    }

    const { name, email, password } = result.data;

    try {
        const existingUser = await db.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Unable to register with that email address." },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await db.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            {
                message: "Account created successfully.",
                user,
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        // A second request could register the same email between
        // our lookup and database insert. Handle that unique constraint.
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { message: "Unable to register with that email address." },
                { status: 409 }
            );
        }

        console.error("Registration failed:", error);

        return NextResponse.json(
            { message: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
