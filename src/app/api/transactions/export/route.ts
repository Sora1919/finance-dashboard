
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Convert a value into a safe CSV field.
function escapeCsv(value: string | number | null | undefined): string {
    let text = String(value ?? "");

    // Prevent spreadsheet applications from interpreting
    // user-entered text as formulas.
    if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) {
        text = `'${text}`;
    }

    // Escape double quotes and wrap the field in quotes.
    return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "You must be signed in to export transactions." },
            { status: 401 },
        );
    }

    try {
        const transactions = await db.transaction.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: [
                { date: "desc" },
                { createdAt: "desc" },
            ],
            select: {
                title: true,
                amount: true,
                type: true,
                category: true,
                description: true,
                date: true,
            },
        });

        const headers = [
            "Title",
            "Amount",
            "Type",
            "Category",
            "Description",
            "Date",
        ];

        const rows = transactions.map((transaction) => [
            transaction.title,
            transaction.amount.toString(),
            transaction.type,
            transaction.category,
            transaction.description ?? "",
            transaction.date.toISOString().slice(0, 10),
        ]);

        const csv = [
            headers.map(escapeCsv).join(","),
            ...rows.map((row) => row.map(escapeCsv).join(",")),
        ].join("\r\n");

        const today = new Date().toISOString().slice(0, 10);
        const filename = `mintly-transactions-${today}.csv`;

        // UTF-8 BOM helps Excel recognize Unicode text.
        const csvContent = "\uFEFF" + csv;

        return new Response(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "private, no-store",
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch (error) {
        console.error("Failed to export transactions:", error);

        return NextResponse.json(
            { error: "Unable to export transactions right now." },
            { status: 500 },
        );
    }
}
