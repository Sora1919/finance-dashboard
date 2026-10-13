
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { NextResponse } from "next/server";

const createTransactionSchema = z.object({
    title: z.string().trim().min(1).max(120),
    amount: z
        .string()
        .trim()
        .regex(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/, {
            message: "Enter a valid amount with up to two decimal places.",
        })
        .refine((value) => Number(value) > 0, {
            message: "Amount must be greater than zero.",
        }),
    type: z.enum(["income", "expense"]),
    category: z.string().trim().min(1).max(80),
    description: z.string().trim().max(500).optional(),
    date: z.iso.date(),
});

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "You must be signed in to create a transaction." },
            { status: 401 },
        );
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON request body." },
            { status: 400 },
        );
    }

    const parsed = createTransactionSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            {
                error: "Please check the transaction details.",
                details: parsed.error.flatten().fieldErrors,
            },
            { status: 400 },
        );
    }

    const { title, amount, type, category, description, date } = parsed.data;

    try {
        const transaction = await db.transaction.create({
            data: {
                title,
                amount,
                type,
                category,
                description: description || null,
                date: new Date(`${date}T12:00:00.000Z`),
                userId: session.user.id,
            },
            select: {
                id: true,
                title: true,
                amount: true,
                type: true,
                category: true,
                description: true,
                date: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            {
                transaction: {
                    ...transaction,
                    amount: transaction.amount.toString(),
                },
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Failed to create transaction:", error);

        return NextResponse.json(
            { error: "Unable to create the transaction right now." },
            { status: 500 },
        );
    }
}
