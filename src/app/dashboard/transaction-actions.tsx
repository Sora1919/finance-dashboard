
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Transaction = {
    id: string;
    title: string;
    amount: string;
    type: "income" | "expense";
    category: string;
    description: string | null;
    date: string;
};

type TransactionActionsProps = {
    transaction: Transaction;
};

type TransactionFormData = {
    title: string;
    amount: string;
    type: "income" | "expense";
    category: string;
    description: string;
    date: string;
};

function getFormData(transaction: Transaction): TransactionFormData {
    return {
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description ?? "",
        date: transaction.date.slice(0, 10),
    };
}

export default function TransactionActions({
                                               transaction,
                                           }: TransactionActionsProps) {
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<TransactionFormData>(() =>
        getFormData(transaction),
    );
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    function openEditor() {
        setForm(getFormData(transaction));
        setError("");
        setIsEditing(true);
    }

    async function handleUpdate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const response = await fetch(
                `/api/transactions/${encodeURIComponent(transaction.id)}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form),
                },
            );

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
                    "Unable to update this transaction.",
                );
                return;
            }

            setIsEditing(false);
            router.refresh();
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete() {
        const confirmed = window.confirm(
            `Delete "${transaction.title}"? This action cannot be undone.`,
        );

        if (!confirmed) return;

        setError("");
        setIsDeleting(true);

        try {
            const response = await fetch(
                `/api/transactions/${encodeURIComponent(transaction.id)}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok) {
                const result: { error?: string } = await response
                    .json()
                    .catch(() => ({}));

                setError(
                    result.error ?? "Unable to delete this transaction.",
                );
                return;
            }

            router.refresh();
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <div className="flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={openEditor}
                    disabled={isDeleting}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                    Edit
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting || isSubmitting}
                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                >
                    {isDeleting ? "Deleting..." : "Delete"}
                </button>
            </div>

            {error && !isEditing && (
                <p role="alert" className="mt-2 text-xs text-rose-700">
                    {error}
                </p>
            )}

            {isEditing && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !isSubmitting
                        ) {
                            setIsEditing(false);
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={`edit-title-${transaction.id}`}
                        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-7"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2
                                    id={`edit-title-${transaction.id}`}
                                    className="text-xl font-bold tracking-tight text-slate-900"
                                >
                                    Edit transaction
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Update your transaction details.
                                </p>
                            </div>

                            <button
                                type="button"
                                aria-label="Close edit form"
                                disabled={isSubmitting}
                                onClick={() => setIsEditing(false)}
                                className="rounded-lg px-3 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="mt-6 space-y-4">
                            <div>
                                <label
                                    htmlFor={`title-${transaction.id}`}
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Title
                                </label>
                                <input
                                    id={`title-${transaction.id}`}
                                    required
                                    maxLength={120}
                                    value={form.title}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            title: event.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor={`amount-${transaction.id}`}
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Amount (USD)
                                    </label>
                                    <input
                                        id={`amount-${transaction.id}`}
                                        required
                                        type="number"
                                        min="0.01"
                                        max="9999999999.99"
                                        step="0.01"
                                        value={form.amount}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                amount: event.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor={`type-${transaction.id}`}
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Type
                                    </label>
                                    <select
                                        id={`type-${transaction.id}`}
                                        value={form.type}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                type: event.target.value as
                                                    | "income"
                                                    | "expense",
                                            })
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
                                    <label
                                        htmlFor={`category-${transaction.id}`}
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Category
                                    </label>
                                    <input
                                        id={`category-${transaction.id}`}
                                        required
                                        maxLength={80}
                                        value={form.category}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                category: event.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor={`date-${transaction.id}`}
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Date
                                    </label>
                                    <input
                                        id={`date-${transaction.id}`}
                                        required
                                        type="date"
                                        value={form.date}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                date: event.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor={`description-${transaction.id}`}
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Description{" "}
                                    <span className="font-normal text-slate-400">
                                        (optional)
                                    </span>
                                </label>
                                <textarea
                                    id={`description-${transaction.id}`}
                                    maxLength={500}
                                    rows={3}
                                    value={form.description}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            description: event.target.value,
                                        })
                                    }
                                    className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                                />
                            </div>

                            {error && (
                                <p
                                    role="alert"
                                    className="rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
                                >
                                    {error}
                                </p>
                            )}

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setIsEditing(false)}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting ? "Saving..." : "Save changes"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </>
    );
}
