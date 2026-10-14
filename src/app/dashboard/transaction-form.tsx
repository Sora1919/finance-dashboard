
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const initialForm = {
    title: "",
    amount: "",
    type: "expense",
    category: "",
    description: "",
    date: new Date().toLocaleDateString("en-CA"),
};

export default function TransactionForm() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const result: {
                error?: string;
                details?: Record<string, string[] | undefined>;
            } = await response.json();

            if (!response.ok) {
                const firstFieldError = result.details
                    ? Object.values(result.details).flat().find(Boolean)
                    : undefined;

                setError(
                    firstFieldError ??
                    result.error ??
                    "Unable to save this transactions.",
                );
                return;
            }

            setForm({
                ...initialForm,
                date: new Date().toLocaleDateString("en-CA"),
            });
            setIsOpen(false);
            router.refresh();
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setError("");
                    setIsOpen(true);
                }}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
                <span aria-hidden="true" className="text-lg leading-none">+</span>
                Add transaction
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isSubmitting) {
                            setIsOpen(false);
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="transaction-form-title"
                        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-7"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2
                                    id="transaction-form-title"
                                    className="text-xl font-bold tracking-tight"
                                >
                                    Add transaction
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Record income or an expense.
                                </p>
                            </div>

                            <button
                                type="button"
                                aria-label="Close form"
                                disabled={isSubmitting}
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg px-3 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="transaction-title" className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Title
                                </label>
                                <input
                                    id="transaction-title"
                                    required
                                    maxLength={120}
                                    value={form.title}
                                    onChange={(event) =>
                                        setForm({ ...form, title: event.target.value })
                                    }
                                    placeholder="e.g. Monthly salary"
                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="transaction-amount" className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Amount (USD)
                                    </label>
                                    <input
                                        id="transaction-amount"
                                        required
                                        type="number"
                                        min="0.01"
                                        max="9999999999.99"
                                        step="0.01"
                                        value={form.amount}
                                        onChange={(event) =>
                                            setForm({ ...form, amount: event.target.value })
                                        }
                                        placeholder="0.00"
                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="transaction-type" className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Type
                                    </label>
                                    <select
                                        id="transaction-type"
                                        value={form.type}
                                        onChange={(event) =>
                                            setForm({ ...form, type: event.target.value })
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="transaction-category" className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Category
                                    </label>
                                    <input
                                        id="transaction-category"
                                        required
                                        maxLength={80}
                                        value={form.category}
                                        onChange={(event) =>
                                            setForm({ ...form, category: event.target.value })
                                        }
                                        placeholder="e.g. Food, Salary"
                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="transaction-date" className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Date
                                    </label>
                                    <input
                                        id="transaction-date"
                                        required
                                        type="date"
                                        value={form.date}
                                        onChange={(event) =>
                                            setForm({ ...form, date: event.target.value })
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="transaction-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Description <span className="font-normal text-slate-400">(optional)</span>
                                </label>
                                <textarea
                                    id="transaction-description"
                                    maxLength={500}
                                    rows={3}
                                    value={form.description}
                                    onChange={(event) =>
                                        setForm({ ...form, description: event.target.value })
                                    }
                                    placeholder="Add a note..."
                                    className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                                />
                            </div>

                            {error && (
                                <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                                    {error}
                                </p>
                            )}

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting ? "Saving..." : "Save transactions"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </>
    );
}
