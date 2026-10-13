
import { connection } from "next/server";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getFinancialSummary } from "@/lib/finance-summary";
import { getFinanceActivity } from "@/lib/finance-activity";
import TransactionForm from "./transaction-form";

function Icon({
                  name,
                  className = "size-5",
              }: {
    name: string;
    className?: string;
}) {
    const common = {
        className,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        viewBox: "0 0 24 24",
        "aria-hidden": true as const,
    };

    switch (name) {
        case "grid":
            return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
        case "receipt":
            return <svg {...common}><path d="M4 3h16v18l-4-2-4 2-4-2-4 2V3Z" /><path d="M8 8h8M8 12h8M8 16h4" /></svg>;
        case "chart":
            return <svg {...common}><path d="M3 3v18h18" /><path d="m7 14 4-4 4 3 5-7" /></svg>;
        case "settings":
            return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4L7.3 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2Z" /></svg>;
        case "wallet":
            return <svg {...common}><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 9h18M16 14h2" /><path d="M6 5V3h12v2" /></svg>;
        case "arrow-up":
            return <svg {...common}><path d="M7 17 17 7M7 7h10v10" /></svg>;
        case "arrow-down":
            return <svg {...common}><path d="M7 7 17 17M17 7v10H7" /></svg>;
        case "plus":
            return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
        case "search":
            return <svg {...common}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>;
        case "bell":
            return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>;
        case "chevron":
            return <svg {...common}><path d="m9 18 6-6-6-6" /></svg>;
        default:
            return <svg {...common}><circle cx="12" cy="12" r="9" /></svg>;
    }
}

function SidebarLink({
                         icon,
                         label,
                         active = false,
                         href,
                     }: {
    icon: string;
    label: string;
    active?: boolean;
    href: string;
}) {
    return (
        <a
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                    ? "bg-emerald-50 text-emerald-800"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
        >
            <Icon name={icon} className="size-4.5" />
            {label}
        </a>
    );
}

function SummaryCard({
                         title,
                         amount,
                         change,
                         icon,
                         type,
                     }: {
    title: string;
    amount: string;
    change: string;
    icon: string;
    type: "balance" | "income" | "expense";
}) {
    const styles = {
        balance: "bg-slate-900 text-white",
        income: "border border-slate-200 bg-white text-slate-900",
        expense: "border border-slate-200 bg-white text-slate-900",
    };

    const iconStyles = {
        balance: "bg-white/10 text-emerald-300",
        income: "bg-emerald-50 text-emerald-700",
        expense: "bg-rose-50 text-rose-600",
    };

    return (
        <article className={`rounded-2xl p-5 shadow-sm sm:p-6 ${styles[type]}`}>
            <div className="flex items-start justify-between gap-3">
                <p className={`text-sm ${type === "balance" ? "text-slate-300" : "text-slate-500"}`}>
                    {title}
                </p>
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconStyles[type]}`}>
                    <Icon name={icon} />
                </span>
            </div>
            <p className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                {amount}
            </p>
            <p className={`mt-2 text-xs ${type === "balance" ? "text-slate-300" : "text-slate-500"}`}>
                {change}
            </p>
        </article>
    );
}

function DashboardOverview({
                               name,
                               summary,
                               activity,
                           }: {
    name: string;
    summary: Awaited<ReturnType<typeof getFinancialSummary>>;
    activity: Awaited<ReturnType<typeof getFinanceActivity>>;
}) {

    const maxCashFlow = Math.max(
        1,
        ...activity.months.flatMap((month) => [
            month.income,
            month.expenses,
        ]),
    );

    return (
        <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
            <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200 bg-white px-5 py-6 lg:flex">
                <a href="/dashboard" className="flex items-center gap-3 px-2">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-700 text-white">
                        <Icon name="wallet" className="size-6" />
                    </span>
                    <span>
                        <span className="block text-base font-bold tracking-tight">Mintly</span>
                        <span className="block text-xs text-slate-400">Personal finance</span>
                    </span>
                </a>

                <p className="mb-3 mt-10 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Workspace
                </p>
                <nav className="space-y-1">
                    <SidebarLink icon="grid" label="Overview" active href="#overview" />
                    <SidebarLink icon="receipt" label="Transactions" href="#transactions" />
                </nav>

                <p className="mb-3 mt-9 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Preferences
                </p>
                <nav className="space-y-1">
                    <span className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400" title="Coming in a future step">
                        <Icon name="chart" className="size-4.5" />
                        Reports
                        <span className="ml-auto text-[10px]">Soon</span>
                    </span>
                    <span className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400" title="Coming in a future step">
                        <Icon name="settings" className="size-4.5" />
                        Settings
                        <span className="ml-auto text-[10px]">Soon</span>
                    </span>
                </nav>

                <div className="mt-auto rounded-2xl bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-950">Small steps add up.</p>
                    <p className="mt-1 text-xs leading-5 text-emerald-800">
                        Keep track of your money and make every decision count.
                    </p>
                </div>
            </aside>

            <div className="lg:pl-64">
                <header className="sticky top-0 z-10 flex h-18 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
                    <div className="min-w-0">
                        <p className="text-xs text-slate-400">Workspace / Overview</p>
                        <h1 className="mt-0.5 truncate text-lg font-semibold">Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-400 md:flex">
                            <Icon name="search" className="size-4" />
                            <span>Search</span>
                            <span className="ml-5 rounded border px-1.5 py-0.5 text-[10px]">⌘ K</span>
                        </div>
                        <button type="button" aria-label="Notifications" className="relative flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
                            <Icon name="bell" />
                            <span className="absolute right-2 top-2 size-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                        </button>
                        <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
                            {name.trim().charAt(0).toUpperCase() || "U"}
                        </div>
                    </div>
                </header>

                <main id="overview" className="mx-auto max-w-360 space-y-7 p-4 sm:p-8">
                    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sm text-slate-500">Your money, in perspective</p>
                            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                                Welcome back, {name} 👋
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Here’s an overview of your finances.
                            </p>
                        </div>
                        <TransactionForm />
                    </section>

                    <section aria-label="Financial summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <SummaryCard
                            title="Current balance"
                            amount={summary.currentBalance}
                            change="Income minus expenses"
                            icon="wallet"
                            type="balance"
                        />
                        <SummaryCard
                            title="Total income"
                            amount={summary.totalIncome}
                            change={`${summary.incomeCount} income transactions`}
                            icon="arrow-down"
                            type="income"
                        />
                        <SummaryCard
                            title="Total expenses"
                            amount={summary.totalExpenses}
                            change={`${summary.expenseCount} expense transactions`}
                            icon="arrow-up"
                            type="expense"
                        />
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold">Cash flow</h3>
                                    <p className="mt-1 text-sm text-slate-500">Income vs. expenses over time</p>
                                </div>
                                <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500">Last 6 months</span>
                            </div>

                            <div className="mt-8 flex h-48 items-end gap-3 border-b border-slate-100 pb-2 sm:gap-5">
                                {activity.months.map((month) => (
                                    <div
                                        key={month.label}
                                        className="flex h-full min-w-0 flex-1 items-end justify-center gap-1"
                                        title={`${month.label}: Income ${month.income.toFixed(2)}, Expenses ${month.expenses.toFixed(2)}`}
                                    >
                                        <div
                                            className="w-2/5 rounded-t-md bg-emerald-600/80 sm:max-w-5"
                                            style={{
                                                height: `${(month.income / maxCashFlow) * 100}%`,
                                                minHeight: month.income > 0 ? "3px" : "0",
                                            }}
                                        />
                                        <div
                                            className="w-2/5 rounded-t-md bg-rose-300 sm:max-w-5"
                                            style={{
                                                height: `${(month.expenses / maxCashFlow) * 100}%`,
                                                minHeight: month.expenses > 0 ? "3px" : "0",
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 flex justify-between text-[11px] text-slate-400">
                                {activity.months.map((month) => (
                                    <span key={month.label}>{month.label}</span>
                                ))}
                            </div>

                            <div className="mt-5 flex gap-5 text-xs text-slate-500">
                                <span className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-emerald-600" />
                                    Income
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-rose-300" />
                                    Expenses
                                </span>
                            </div>

                            <p className="mt-4 text-xs text-slate-400">
                                Monthly totals from your transactions · Last six calendar months
                            </p>

                        </article>

                        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h3 className="font-semibold">Quick overview</h3>
                            <p className="mt-1 text-sm text-slate-500">Your financial snapshot</p>
                            <div className="mt-6 space-y-5">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm text-slate-500">Income records</span>
                                    <span className="font-semibold tabular-nums">
                                        {summary.incomeCount}
                                    </span>
                                </div>
                                <div className="h-px bg-slate-100" />
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm text-slate-500">Expense records</span>
                                    <span className="font-semibold tabular-nums">
                                        {summary.expenseCount}
                                    </span>
                                </div>
                                <div className="h-px bg-slate-100" />
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm text-slate-500">Savings rate</span>
                                    <span className="font-semibold tabular-nums">
                                        {summary.savingsRate ?? "—"}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-7 rounded-xl bg-slate-50 p-4">
                                <p className="text-sm font-medium">Your overview starts here</p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Once you add transactions, your summaries and insights can reflect your real activity.
                                </p>
                            </div>
                        </article>
                    </section>


                    <section
                        id="transactions"
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:px-6">
                            <div>
                                <h3 className="font-semibold">Recent transactions</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Your latest income and expenses
                                </p>
                            </div>
                            <span className="text-sm text-slate-500">
                                Latest {activity.recentTransactions.length}
                            </span>
                        </div>

                        {activity.recentTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                                <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                    <Icon name="receipt" className="size-6" />
                                </span>
                                <h4 className="mt-4 text-sm font-semibold">
                                    No transactions yet
                                </h4>
                                <p className="mt-1 max-w-sm text-sm text-slate-500">
                                    Your latest income and expenses will appear here when you
                                    have recorded transactions.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-150 text-left text-sm">
                                    <thead className="bg-slate-50 text-xs text-slate-500">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Transaction</th>
                                            <th className="px-6 py-3 font-medium">Category</th>
                                            <th className="px-6 py-3 font-medium">Date</th>
                                            <th className="px-6 py-3 font-medium">Type</th>
                                            <th className="px-6 py-3 text-right font-medium">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                    {activity.recentTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-800">
                                                {transaction.title}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {transaction.category}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(transaction.date).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                        timeZone: "UTC",
                                                    },
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
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
                                                className={`whitespace-nowrap px-6 py-4 text-right font-semibold tabular-nums ${
                                                    transaction.type === "income"
                                                        ? "text-emerald-700"
                                                        : "text-rose-600"
                                                }`}
                                            >
                                                {transaction.type === "income" ? "+" : "−"}
                                                {transaction.amount}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>


                    <footer className="pb-2 text-center text-xs text-slate-400">
                        Mintly Finance · Your finances, made clearer.
                    </footer>
                </main>
            </div>

            <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-slate-200 bg-white/95 p-2 backdrop-blur lg:hidden">
                <a href="#overview" className="flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium text-emerald-800">
                    <Icon name="grid" />
                    Overview
                </a>
                <a href="#transactions" className="flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium text-slate-500">
                    <Icon name="receipt" />
                    Transactions
                </a>
            </nav>
            <div className="h-16 lg:hidden" />
        </div>
    );
}

export default async function DashboardPage() {
    return (
        <Suspense fallback={<main className="p-6 text-sm text-slate-500">Loading dashboard...</main>}>
            <DashboardContent />
        </Suspense>
    );
}

async function DashboardContent() {
    await connection();

    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const displayName = session.user.name ?? session.user.email ?? "there";

    const summary = await getFinancialSummary(session.user.id);

    const activity = await getFinanceActivity(session.user.id);

    return (
        <>
            <DashboardOverview
                name={displayName}
                summary={summary}
                activity={activity}
            />

            <div className="fixed right-4 top-4 z-50">
                <form
                    action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/login" });
                    }}
                >
                    <button
                        type="submit"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
                    >
                        Sign out
                    </button>
                </form>
            </div>
        </>
    );
}
