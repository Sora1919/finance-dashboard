
import { db } from "@/lib/db";

function amountToCents(amount: { toFixed(decimalPlaces: number): string }): number {
    const [whole, fraction = "00"] = amount.toFixed(2).split(".");
    return Number(whole) * 100 + Number(fraction);
}

function formatMoney(cents: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(cents / 100);
}

export async function getFinanceActivity(userId: string) {
    const now = new Date();

    // Include the current month and the previous five calendar months.
    const startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 5,
        1,
    );

    const [transactionsForChart, recentTransactions] = await Promise.all([
        db.transaction.findMany({
            where: {
                userId,
                date: { gte: startDate },
            },
            select: {
                amount: true,
                type: true,
                date: true,
            },
        }),

        db.transaction.findMany({
            where: { userId },
            orderBy: [
                { date: "desc" },
                { createdAt: "desc" },
            ],
            take: 6,
            select: {
                id: true,
                title: true,
                category: true,
                amount: true,
                type: true,
                date: true,
            },
        }),
    ]);

    const monthFormatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
    });

    const months = Array.from({ length: 6 }, (_, index) => {
        const date = new Date(
            now.getFullYear(),
            now.getMonth() - 5 + index,
            1,
        );

        return {
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
            label: monthFormatter.format(date),
            incomeCents: 0,
            expenseCents: 0,
        };
    });

    const monthsByKey = new Map(months.map((month) => [month.key, month]));

    for (const transaction of transactionsForChart) {
        const key = `${transaction.date.getFullYear()}-${String(
            transaction.date.getMonth() + 1,
        ).padStart(2, "0")}`;

        const month = monthsByKey.get(key);

        if (!month) continue;

        const cents = amountToCents(transaction.amount);

        if (transaction.type === "income") {
            month.incomeCents += cents;
        } else {
            month.expenseCents += cents;
        }
    }

    return {
        months: months.map((month) => ({
            label: month.label,
            income: month.incomeCents / 100,
            expenses: month.expenseCents / 100,
        })),

        recentTransactions: recentTransactions.map((transaction) => ({
            id: transaction.id,
            title: transaction.title,
            category: transaction.category,
            type: transaction.type,
            amount: formatMoney(amountToCents(transaction.amount)),
            date: transaction.date.toISOString(),
        })),
    };
}
