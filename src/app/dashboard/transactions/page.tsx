
import { auth } from "@/auth";
import { db } from "@/lib/db";
import TransactionActions from "../transaction-actions";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Prisma } from "@/generated/prisma/client";

type SearchParams = Promise<{
    q?: string;
    type?: string;
    category?: string;
    from?: string;
    to?: string;
    sort?: string;
    page?: string;
}>;

const PAGE_SIZE = 10;

function validDate(value?: string) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return undefined;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
        ? date
        : undefined;
}

function formatMoney(amount: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(Number(amount));
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

export default function TransactionsPage({
                                             searchParams,
                                         }: {
    searchParams: SearchParams;
}) {
    return (
        <Suspense
            fallback={
                <div className="p-8 text-sm text-slate-500">
                    Loading transactions...
                </div>
            }
        >
            <TransactionsContent searchParams={searchParams} />
        </Suspense>
    );
}

async function TransactionsContent({
                                       searchParams,
                                   }: {
    searchParams: SearchParams;
}) {
    await connection();

    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const params = await searchParams;

    const q = (params.q ?? "").trim().slice(0, 100);
    const type =
        params.type === "income" || params.type === "expense"
            ? params.type
            : "";
    const category = (params.category ?? "").trim().slice(0, 80);
    const from = validDate(params.from);
    const to = validDate(params.to);

    const requestedPage = Number(params.page ?? "1");
    const page =
        Number.isSafeInteger(requestedPage) && requestedPage > 0
            ? requestedPage
            : 1;

    const sort = ["date-asc", "amount-asc", "amount-desc"].includes(
        params.sort ?? "",
    )
        ? params.sort!
        : "date-desc";

    const where: Prisma.TransactionWhereInput = {
        userId: session.user.id,
        ...(type ? { type } : {}),
        ...(category ? { category } : {}),
        ...(q
            ? {
                OR: [
                    { title: { contains: q } },
                    { category: { contains: q } },
                    { description: { contains: q } },
                ],
            }
            : {}),
        ...(from || to
            ? {
                date: {
                    ...(from ? { gte: from } : {}),
                    ...(to
                        ? {
                            lt: new Date(
                                to.getTime() + 24 * 60 * 60 * 1000,
                            ),
                        }
                        : {}),
                },
            }
            : {}),
    };

    const orderBy =
        sort === "date-asc"
            ? [{ date: "asc" as const }, { createdAt: "asc" as const }]
            : sort === "amount-asc"
                ? [{ amount: "asc" as const }, { date: "desc" as const }]
                : sort === "amount-desc"
                    ? [{ amount: "desc" as const }, { date: "desc" as const }]
                    : [{ date: "desc" as const }, { createdAt: "desc" as const }];

    const [categories, totalCount] = await Promise.all([
        db.transaction.findMany({
            where: { userId: session.user.id },
            select: { category: true },
            distinct: ["category"],
            orderBy: { category: "asc" },
        }),
        db.transaction.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);

    const transactions = await db.transaction.findMany({
        where,
        orderBy,
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
            id: true,
            title: true,
            amount: true,
            type: true,
            category: true,
            description: true,
            date: true,
        },
    });

    function pageUrl(nextPage: number) {
        const params = new URLSearchParams();

        if (q) params.set("q", q);
        if (type) params.set("type", type);
        if (category) params.set("category", category);
        if (from) params.set("from", paramsFromDate(from));
        if (to) params.set("to", paramsFromDate(to));
        if (sort !== "date-desc") params.set("sort", sort);

        params.set("page", String(nextPage));

        return `/dashboard/transactions?${params.toString()}`;
    }

    return (
        <main className="min-h-screen bg-[#f7f8fa] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-emerald-700">
                            Mintly / Finance
                        </p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight">
                            Transactions
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Search, filter, and manage your transaction history.
                        </p>
                    </div>

                    <p className="text-sm text-slate-500">
                        {totalCount} {totalCount === 1 ? "transaction" : "transactions"}
                    </p>
                </header>

                <form
                    method="GET"
                    className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
                >
                    <div className="sm:col-span-2">
                        <label
                            htmlFor="q"
                            className="mb-1.5 block text-sm font-medium"
                        >
                            Search
                        </label>
                        <input
                            id="q"
                            name="q"
                            type="search"
                            defaultValue={q}
                            placeholder="Title, category, description..."
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="type"
                            className="mb-1.5 block text-sm font-medium"
                        >
                            Type
                        </label>
                        <select
                            id="type"
                            name="type"
                            defaultValue={type}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                        >
                            <option value="">All types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="category"
                            className="mb-1.5 block text-sm font-medium"
                        >
                            Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            defaultValue={category}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                        >
                            <option value="">All categories</option>
                            {categories.map(({ category: name }) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="from"
                            className="mb-1.5 block text-sm font-medium"
                        >
                            From date
                        </label>
                        <input
                            id="from"
                            name="from"
                            type="date"
                            defaultValue={params.from ?? ""}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="to"
                            className="mb-1.5 block text-sm font-medium"
                        >
                            To date
                        </label>
                        <input
                            id="to"
                            name="to"
                            type="date"
                            defaultValue={params.to ?? ""}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="sort"
                            className="mb-1.5 block text-sm font-medium"
                        >
                            Sort by
                        </label>
                        <select
                            id="sort"
                            name="sort"
                            defaultValue={sort}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                        >
                            <option value="date-desc">Newest first</option>
                            <option value="date-asc">Oldest first</option>
                            <option value="amount-desc">Highest amount</option>
                            <option value="amount-asc">Lowest amount</option>
                        </select>
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            type="submit"
                            className="flex-1 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
                        >
                            Apply filters
                        </button>
                        <a
                            href="/dashboard/transactions"
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            Reset
                        </a>
                    </div>
                </form>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {transactions.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <h2 className="text-lg font-semibold">
                                No transactions found
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Try changing your search or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-225 text-left text-sm">
                                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">Transaction</th>
                                    <th className="px-5 py-4">Category</th>
                                    <th className="px-5 py-4">Date</th>
                                    <th className="px-5 py-4">Type</th>
                                    <th className="px-5 py-4 text-right">Amount</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {transactions.map((transaction) => {
                                    const rawAmount =
                                        transaction.amount.toString();

                                    return (
                                        <tr key={transaction.id} className="hover:bg-slate-50/70">
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-800">
                                                    {transaction.title}
                                                </p>
                                                {transaction.description && (
                                                    <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                                        {transaction.description}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                {transaction.category}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                {formatDate(transaction.date)}
                                            </td>
                                            <td className="px-5 py-4">
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            transaction.type === "income"
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : "bg-rose-50 text-rose-700"
                                                        }`}
                                                    >
                                                        {transaction.type === "income"
                                                            ? "Income"
                                                            : "Expense"}
                                                    </span>
                                            </td>
                                            <td
                                                className={`whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums ${
                                                    transaction.type === "income"
                                                        ? "text-emerald-700"
                                                        : "text-rose-600"
                                                }`}
                                            >
                                                {transaction.type === "income" ? "+" : "-"}
                                                {formatMoney(rawAmount)}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <TransactionActions
                                                    transaction={{
                                                        id: transaction.id,
                                                        title: transaction.title,
                                                        amount: rawAmount,
                                                        type: transaction.type,
                                                        category: transaction.category,
                                                        description: transaction.description,
                                                        date: transaction.date.toISOString(),
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <a
                                aria-disabled={currentPage <= 1}
                                className={`rounded-lg border px-3 py-2 text-sm ${
                                    currentPage <= 1
                                        ? "pointer-events-none border-slate-100 text-slate-300"
                                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                                }`}
                                href={pageUrl(Math.max(1, currentPage - 1))}
                            >
                                Previous
                            </a>
                            <a
                                aria-disabled={currentPage >= totalPages}
                                className={`rounded-lg border px-3 py-2 text-sm ${
                                    currentPage >= totalPages
                                        ? "pointer-events-none border-slate-100 text-slate-300"
                                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                                }`}
                                href={pageUrl(Math.min(totalPages, currentPage + 1))}
                            >
                                Next
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function paramsFromDate(date: Date) {
    return date.toISOString().slice(0, 10);
}
