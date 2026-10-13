
import { db } from "@/lib/db";

function toCents(value: { toString(): string }): bigint {
    const amount = value.toString();
    const match = amount.match(/^(-?)(\d+)(?:\.(\d+))?$/);

    if (!match) {
        throw new Error("Invalid decimal amount returned by Prisma.");
    }

    const [, sign, whole, fraction = ""] = match;
    const cents = BigInt(whole) * 100n + BigInt((fraction + "00").slice(0, 2));

    return sign === "-" ? -cents : cents;
}

function formatMoney(cents: bigint): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(Number(cents) / 100);
}

export async function getFinancialSummary(userId: string) {
    const groups = await db.transaction.groupBy({
        by: ["type"],
        where: { userId },
        _sum: { amount: true },
        _count: { _all: true },
    });

    const incomeGroup = groups.find((group) => group.type === "income");
    const expenseGroup = groups.find((group) => group.type === "expense");

    const incomeCents = toCents(incomeGroup?._sum.amount ?? { toString: () => "0" });
    const expenseCents = toCents(expenseGroup?._sum.amount ?? { toString: () => "0" });
    const balanceCents = incomeCents - expenseCents;

    const savingsRate =
        incomeCents > 0n
            ? Number(((incomeCents - expenseCents) * 10000n) / incomeCents) / 100
            : null;

    return {
        totalIncome: formatMoney(incomeCents),
        totalExpenses: formatMoney(expenseCents),
        currentBalance: formatMoney(balanceCents),
        incomeCount: incomeGroup?._count._all ?? 0,
        expenseCount: expenseGroup?._count._all ?? 0,
        savingsRate:
            savingsRate === null ? null : `${savingsRate.toFixed(1)}%`,
    };
}
