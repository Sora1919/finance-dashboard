
"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
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
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const addButtonRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!success) return;

        const timeoutId = window.setTimeout(() => {
            setSuccess("");
        }, 4000);

        return () => window.clearTimeout(timeoutId);
    }, [success]);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current
                ?.querySelector<HTMLInputElement>("#transaction-title")
                ?.focus();
        } else {
            addButtonRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                if (!isSubmitting) {
                    setIsOpen(false);
                }
                return;
            }

            if (event.key !== "Tab") return;

            const dialog = dialogRef.current;
            if (!dialog) return;

            const focusableElements = dialog.querySelectorAll<HTMLElement>(
                'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
            );

            if (focusableElements.length === 0) return;

            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, isSubmitting]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isSubmitting) return;

        setError("");
        setFieldErrors({});
        setSuccess("");

        const nextFieldErrors: Record<string, string> = {};

        if (!form.title.trim()) {
            nextFieldErrors.title = "Please enter a title.";
        }

        const amount = Number(form.amount);

        if (!form.amount || !Number.isFinite(amount) || amount < 0.01) {
            nextFieldErrors.amount = "Enter an amount greater than zero.";
        } else if (amount > 9999999999.99) {
            nextFieldErrors.amount = "The amount is too large.";
        }

        if (!["income", "expense"].includes(form.type)) {
            nextFieldErrors.type = "Please select a valid transaction type.";
        }

        if (!form.category.trim()) {
            nextFieldErrors.category = "Please enter a category.";
        }

        if (!form.date) {
            nextFieldErrors.date = "Please select a date.";
        }

        if (form.title.length > 120) {
            nextFieldErrors.title = "Title must be 120 characters or fewer.";
        }

        if (form.category.length > 80) {
            nextFieldErrors.category = "Category must be 80 characters or fewer.";
        }

        if (form.description.length > 500) {
            nextFieldErrors.description =
                "Description must be 500 characters or fewer.";
        }

        if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            setError("");
            return;
        }

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
                const details = result.details ?? {};

                const nextFieldErrors = Object.fromEntries(
                    Object.entries(details)
                        .map(([field, messages]) => [
                            field,
                            messages?.find(Boolean),
                        ])
                        .filter((entry): entry is [string, string] =>
                            typeof entry[1] === "string",
                        ),
                );

                setFieldErrors(nextFieldErrors);

                if (Object.keys(nextFieldErrors).length === 0) {
                    setError(
                        result.error ?? "Unable to save this transaction.",
                    );
                }

                return;
            }

            setForm({
                ...initialForm,
                date: new Date().toLocaleDateString("en-CA"),
            });
            setIsOpen(false);
            setSuccess("Transaction saved successfully");
            router.refresh();
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            {success && (
                <p
                    role="status"
                    className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                >
                    {success}
                </p>
            )}

            <button
                ref={addButtonRef}
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
                        ref={dialogRef}
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

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                            <div>
                                <label htmlFor="transaction-title" className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Title
                                </label>
                                <input
                                    id="transaction-title"
                                    required
                                    maxLength={120}
                                    aria-invalid={Boolean(fieldErrors.title)}
                                    aria-describedby={
                                        fieldErrors.title
                                            ? "transaction-title-error"
                                            : undefined
                                    }
                                    value={form.title}
                                    onChange={(event) => {
                                        setForm({ ...form, title: event.target.value });

                                        if (fieldErrors.title) {
                                            setFieldErrors((current) => {
                                                const next = { ...current };
                                                delete next.title;
                                                return next;
                                            });
                                        }
                                    }}
                                    placeholder="e.g. Monthly salary"
                                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-emerald-600/15 ${
                                        fieldErrors.title
                                            ? "border-rose-400 focus:border-rose-500"
                                            : "border-slate-200 focus:border-emerald-600"
                                    }`}
                                />
                                {fieldErrors.title && (
                                    <p
                                        id="transaction-title-error"
                                        className="mt-1.5 text-sm text-rose-600"
                                    >
                                        {fieldErrors.title}
                                    </p>
                                )}
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
                                        aria-invalid={Boolean(fieldErrors.amount)}
                                        aria-describedby={
                                            fieldErrors.amount ? "transaction-amount-error" : undefined
                                        }
                                        value={form.amount}
                                        onChange={(event) => {
                                            setForm({ ...form, amount: event.target.value });
                                            setFieldErrors((current) => {
                                                const next = { ...current };
                                                delete next.amount;
                                                return next;
                                            });
                                        }}
                                        placeholder="0.00"
                                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-emerald-600/15 ${
                                            fieldErrors.amount
                                                ? "border-rose-400 focus:border-rose-500"
                                                : "border-slate-200 focus:border-emerald-600"
                                        }`}
                                    />
                                    {fieldErrors.amount && (
                                        <p
                                            id="transaction-amount-error"
                                            className="mt-1.5 text-sm text-rose-600"
                                        >
                                            {fieldErrors.amount}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="transaction-type" className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Type
                                    </label>

                                    <select
                                        id="transaction-type"
                                        aria-invalid={Boolean(fieldErrors.type)}
                                        aria-describedby={
                                            fieldErrors.type ? "transaction-type-error" : undefined
                                        }
                                        value={form.type}
                                        onChange={(event) => {
                                            setForm({ ...form, type: event.target.value });
                                            setFieldErrors((current) => {
                                                const next = { ...current };
                                                delete next.type;
                                                return next;
                                            });
                                        }}
                                        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-600/15 ${
                                            fieldErrors.type
                                                ? "border-rose-400 focus:border-rose-500"
                                                : "border-slate-200 focus:border-emerald-600"
                                        }`}
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                    {fieldErrors.type && (
                                        <p
                                            id="transaction-type-error"
                                            className="mt-1.5 text-sm text-rose-600"
                                        >
                                            {fieldErrors.type}
                                        </p>
                                    )}
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
                                        aria-invalid={Boolean(fieldErrors.category)}
                                        aria-describedby={
                                            fieldErrors.category ? "transaction-category-error" : undefined
                                        }
                                        value={form.category}
                                        onChange={(event) => {
                                            setForm({ ...form, category: event.target.value });
                                            setFieldErrors((current) => {
                                                const next = { ...current };
                                                delete next.category;
                                                return next;
                                            });
                                        }}
                                        placeholder="e.g. Food, Salary"
                                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-600/15 ${
                                            fieldErrors.category
                                                ? "border-rose-400 focus:border-rose-500"
                                                : "border-slate-200 focus:border-emerald-600"
                                        }`}
                                    />
                                    {fieldErrors.category && (
                                        <p
                                            id="transaction-category-error"
                                            className="mt-1.5 text-sm text-rose-600"
                                        >
                                            {fieldErrors.category}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="transaction-date" className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Date
                                    </label>

                                    <input
                                        id="transaction-date"
                                        required
                                        type="date"
                                        aria-invalid={Boolean(fieldErrors.date)}
                                        aria-describedby={
                                            fieldErrors.date ? "transaction-date-error" : undefined
                                        }
                                        value={form.date}
                                        onChange={(event) => {
                                            setForm({ ...form, date: event.target.value });
                                            setFieldErrors((current) => {
                                                const next = { ...current };
                                                delete next.date;
                                                return next;
                                            });
                                        }}
                                        className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-600/15 ${
                                            fieldErrors.date
                                                ? "border-rose-400 focus:border-rose-500"
                                                : "border-slate-200 focus:border-emerald-600"
                                        }`}
                                    />
                                    {fieldErrors.date && (
                                        <p
                                            id="transaction-date-error"
                                            className="mt-1.5 text-sm text-rose-600"
                                        >
                                            {fieldErrors.date}
                                        </p>
                                    )}
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
                                    aria-invalid={Boolean(fieldErrors.description)}
                                    aria-describedby={
                                        fieldErrors.description
                                            ? "transaction-description-error"
                                            : undefined
                                    }
                                    value={form.description}
                                    onChange={(event) => {
                                        setForm({ ...form, description: event.target.value });
                                        setFieldErrors((current) => {
                                            const next = { ...current };
                                            delete next.description;
                                            return next;
                                        });
                                    }}
                                    placeholder="Add a note..."
                                    className={`w-full resize-y rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-600/15 ${
                                        fieldErrors.description
                                            ? "border-rose-400 focus:border-rose-500"
                                            : "border-slate-200 focus:border-emerald-600"
                                    }`}
                                />
                                {fieldErrors.description && (
                                    <p
                                        id="transaction-description-error"
                                        className="mt-1.5 text-sm text-rose-600"
                                    >
                                        {fieldErrors.description}
                                    </p>
                                )}
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
                                    {isSubmitting ? "Saving..." : "Save transaction"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </>
    );
}
