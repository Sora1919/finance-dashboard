
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
    params: Promise<{ id: string }>;
};

const updateTransactionSchema = z.object({
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

export async function PATCH(
    request: Request,
    { params }: RouteContext,
) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "You must be signed in to update transactions." },
            { status: 401 },
        );
    }

    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { error: "Transaction ID is required." },
            { status: 400 },
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

    const parsed = updateTransactionSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            {
                error: "Please check the transactions details.",
                details: parsed.error.flatten().fieldErrors,
            },
            { status: 400 },
        );
    }

    const {
        title,
        amount,
        type,
        category,
        description,
        date,
    } = parsed.data;

    try {
        const result = await db.transaction.updateMany({
            where: {
                id,
                userId: session.user.id,
            },
            data: {
                title,
                amount,
                type,
                category,
                description: description || null,
                date: new Date(`${date}T12:00:00.000Z`),
            },
        });

        if (result.count === 0) {
            return NextResponse.json(
                { error: "Transaction not found." },
                { status: 404 },
            );
        }

        const transaction = await db.transaction.findFirst({
            where: {
                id,
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
                updatedAt: true,
            },
        });

        if (!transaction) {
            return NextResponse.json(
                { error: "Transaction not found." },
                { status: 404 },
            );
        }

        return NextResponse.json({
            transaction: {
                ...transaction,
                amount: transaction.amount.toString(),
            },
        });
    } catch (error) {
        console.error("Failed to update transactions:", error);

        return NextResponse.json(
            { error: "Unable to update the transactions right now." },
            { status: 500 },
        );
    }
}

export async function DELETE(
    _request: Request,
    { params }: RouteContext,
) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "You must be signed in to delete transactions." },
            { status: 401 },
        );
    }

    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { error: "Transaction ID is required." },
            { status: 400 },
        );
    }

    try {
        const result = await db.transaction.deleteMany({
            where: {
                id,
                userId: session.user.id,
            },
        });

        if (result.count === 0) {
            return NextResponse.json(
                { error: "Transaction not found." },
                { status: 404 },
            );
        }

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("Failed to delete transactions:", error);

        return NextResponse.json(
            { error: "Unable to delete the transactions right now." },
            { status: 500 },
        );
    }
}
