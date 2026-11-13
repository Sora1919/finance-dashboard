
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/lib/button-styles";
import { formStyles } from "@/lib/form-styles";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {X} from "lucide-react";

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

    useEffect(() => {
        if (!success) return;

        const timeoutId = window.setTimeout(() => {
            setSuccess("");
        }, 4000);

        return () => window.clearTimeout(timeoutId);
    }, [success]);

    function handleOpenChange(open: boolean) {
        if (isSubmitting) return;

        setIsOpen(open);

        if (open) {
            setError("");
            setFieldErrors({});
        }
    }

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

            const firstInvalidField = Object.keys(nextFieldErrors)[0];

            const fieldIds: Record<string, string> = {
                title: "transaction-title",
                amount: "transaction-amount",
                type: "transaction-type",
                category: "transaction-category",
                date: "transaction-date",
                description: "transaction-description",
            };

            const fieldId = fieldIds[firstInvalidField];

            if (fieldId) {
                document.getElementById(fieldId)?.focus();
            }

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

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <button
                        type="button"
                        disabled={isSubmitting}
                        className={buttonStyles.primary}
                    >
                    <span aria-hidden="true" className="text-lg leading-none">
                        +
                    </span>
                        Add transaction
                    </button>
                </DialogTrigger>

                <DialogContent
                    showCloseButton={false}
                    className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 sm:p-7"
                    onEscapeKeyDown={(event) => {
                        if (isSubmitting) event.preventDefault();
                    }}
                    onInteractOutside={(event) => {
                        if (isSubmitting) event.preventDefault();
                    }}
                    onOpenAutoFocus={(event) => {
                        event.preventDefault();

                        document
                            .getElementById("transaction-title")
                            ?.focus();
                    }}
                >
                    <DialogHeader className="flex flex-row items-start justify-between gap-4 space-y-0 text-left">
                        <div className="min-w-0">
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                Add transaction
                            </DialogTitle>

                            <DialogDescription className="mt-1 text-sm text-slate-500">
                                Record income or an expense.
                            </DialogDescription>
                        </div>

                        <button
                            type="button"
                            aria-label="Close form"
                            disabled={isSubmitting}
                            onClick={() => handleOpenChange(false)}
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50"
                        >
                            <X className="size-5" aria-hidden="true" />
                        </button>
                    </DialogHeader>

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
                                className={`${formStyles.input} ${
                                    fieldErrors.title ? formStyles.error : ""
                                }`}
                            />
                            {fieldErrors.title && (
                                <p
                                    id="transaction-title-error"
                                    className={formStyles.errorMessage}
                                >
                                    {fieldErrors.title}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="transaction-amount" className={formStyles.label}>
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
                                    className={`${formStyles.input} ${
                                        fieldErrors.amount ? formStyles.error : ""
                                    }`}
                                />
                                {fieldErrors.amount && (
                                    <p
                                        id="transaction-amount-error"
                                        className={formStyles.errorMessage}
                                    >
                                        {fieldErrors.amount}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="transaction-type" className={formStyles.label}>
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
                                    className={`${formStyles.select} ${
                                        fieldErrors.type ? formStyles.error : ""
                                    }`}
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                                {fieldErrors.type && (
                                    <p
                                        id="transaction-type-error"
                                        className={formStyles.errorMessage}
                                    >
                                        {fieldErrors.type}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="transaction-category" className={formStyles.label}>
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
                                    className={`${formStyles.input} ${
                                        fieldErrors.category ? formStyles.error : ""
                                    }`}
                                />
                                {fieldErrors.category && (
                                    <p
                                        id="transaction-category-error"
                                        className={formStyles.errorMessage}
                                    >
                                        {fieldErrors.category}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="transaction-date" className={formStyles.label}>
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
                                    className={`${formStyles.input} ${
                                        fieldErrors.date ? formStyles.error : ""
                                    }`}
                                />
                                {fieldErrors.date && (
                                    <p
                                        id="transaction-date-error"
                                        className={formStyles.errorMessage}
                                    >
                                        {fieldErrors.date}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="transaction-description" className={formStyles.label}>
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
                                className={`${formStyles.textarea} ${
                                    fieldErrors.description ? formStyles.error : ""
                                }`}
                            />
                            {fieldErrors.description && (
                                <p
                                    id="transaction-description-error"
                                    className={formStyles.errorMessage}
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
                                onClick={() => handleOpenChange(false)}
                                className={buttonStyles.secondary}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={buttonStyles.primary}
                            >
                                {isSubmitting ? "Saving..." : "Save transaction"}
                            </button>
                        </div>
                    </form>

                </DialogContent>
            </Dialog>
        </>
    );
}
