
"use client";

import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
    type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/lib/button-styles";
import { formStyles } from "@/lib/form-styles";

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

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const deleteButtonRef = useRef<HTMLButtonElement>(null);
    const cancelDeleteRef = useRef<HTMLButtonElement>(null);

    const editButtonRef = useRef<HTMLButtonElement>(null);
    const editTitleRef = useRef<HTMLInputElement>(null);

    function openEditor() {
        setForm(getFormData(transaction));
        setError("");
        setIsEditing(true);
    }

    function closeEditor() {
        if (isSubmitting) return;

        setIsEditing(false);
        setError("");

        editButtonRef.current?.focus();
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
            editButtonRef.current?.focus();
            router.refresh();
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete() {
        if (isDeleting) return;

        setDeleteError("");
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

                setDeleteError(
                    result.error ?? "Unable to delete this transaction.",
                );
                return;
            }

            setIsDeleteOpen(false);
            router.refresh();
        } catch {
            setDeleteError("Network error. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    }

    useEffect(() => {
        if (isDeleteOpen) {
            cancelDeleteRef.current?.focus();
        }
    }, [isDeleteOpen]);

    function openDeleteDialog() {
        if (isDeleting || isSubmitting) return;

        setDeleteError("");
        setIsDeleteOpen(true);
    }

    function closeDeleteDialog() {
        if (isDeleting) return;

        setIsDeleteOpen(false);
        setDeleteError("");
        deleteButtonRef.current?.focus();
    }

    useEffect(() => {
        if (isEditing) {
            editTitleRef.current?.focus();
        }
    }, [isEditing]);

    function handleDeleteDialogKeyDown(
        event: KeyboardEvent<HTMLElement>,
    ) {
        if (event.key === "Escape") {
            event.preventDefault();
            closeDeleteDialog();
            return;
        }

        if (event.key !== "Tab") return;

        const buttons = Array.from(
            event.currentTarget.querySelectorAll<HTMLButtonElement>(
                "button:not(:disabled)",
            ),
        );

        if (buttons.length === 0) {
            event.preventDefault();
            return;
        }

        const first = buttons[0];
        const last = buttons[buttons.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function handleEditDialogKeyDown(
        event: KeyboardEvent<HTMLElement>,
    ) {
        if (event.key === "Escape") {
            event.preventDefault();
            closeEditor();
            return;
        }

        if (event.key !== "Tab") return;

        const focusableElements = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
                'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)',
            ),
        );

        if (focusableElements.length === 0) {
            event.preventDefault();
            return;
        }

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (
            event.shiftKey &&
            document.activeElement === first
        ) {
            event.preventDefault();
            last.focus();
        } else if (
            !event.shiftKey &&
            document.activeElement === last
        ) {
            event.preventDefault();
            first.focus();
        }
    }

    return (
        <>
            <div className="flex items-center justify-end gap-2">
                <button
                    ref={editButtonRef}
                    type="button"
                    onClick={openEditor}
                    disabled={isDeleting || isSubmitting || isDeleteOpen}
                    className={buttonStyles.secondary}
                >
                    Edit
                </button>

                <button
                    ref={deleteButtonRef}
                    type="button"
                    onClick={openDeleteDialog}
                    disabled={isDeleting || isSubmitting}
                    className={buttonStyles.dangerOutline}
                >
                    Delete
                </button>
            </div>

            {isEditing && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget) {
                            closeEditor();
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={`edit-title-${transaction.id}`}
                        onKeyDown={handleEditDialogKeyDown}
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
                                onClick={closeEditor}
                                className={buttonStyles.secondary}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="mt-6 space-y-4">
                            <div>
                                <label
                                    htmlFor={`title-${transaction.id}`}
                                    className={formStyles.label}
                                >
                                    Title
                                </label>
                                <input
                                    ref={editTitleRef}
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
                                    className={formStyles.input}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor={`amount-${transaction.id}`}
                                        className={formStyles.label}
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
                                        className={formStyles.input}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor={`type-${transaction.id}`}
                                        className={formStyles.label}
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
                                        className={formStyles.select}
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
                                        className={formStyles.label}
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
                                        className={formStyles.input}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor={`date-${transaction.id}`}
                                        className={formStyles.label}
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
                                        className={formStyles.input}
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor={`description-${transaction.id}`}
                                    className={formStyles.label}
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
                                    className={formStyles.textarea}
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
                                    onClick={closeEditor}
                                    className={buttonStyles.secondary}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={buttonStyles.primary}
                                >
                                    {isSubmitting ? "Saving..." : "Save changes"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {isDeleteOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeDeleteDialog();
                        }
                    }}
                >
                    <section
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby={`delete-title-${transaction.id}`}
                        aria-describedby={`delete-description-${transaction.id}`}
                        onKeyDown={handleDeleteDialogKeyDown}
                        className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl sm:p-7"
                    >
                        {/* Warning icon */}
                        <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 8v4" />
                                <path d="M12 16h.01" />
                            </svg>
                        </div>

                        <h2
                            id={`delete-title-${transaction.id}`}
                            className="text-xl font-bold tracking-tight text-slate-900"
                        >
                            Delete transaction?
                        </h2>

                        <p
                            id={`delete-description-${transaction.id}`}
                            className="mt-2 text-sm leading-6 text-slate-500"
                        >
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-slate-800">
                                {transaction.title}
                            </span>
                            ? This action cannot be undone.
                        </p>

                        {/* Error feedback */}
                        {deleteError && (
                            <p
                                role="alert"
                                className="mt-4 rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
                            >
                                {deleteError}
                            </p>
                        )}

                        {/* Actions */}
                        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                ref={cancelDeleteRef}
                                type="button"
                                onClick={closeDeleteDialog}
                                disabled={isDeleting}
                                className={buttonStyles.secondary}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className={buttonStyles.danger}
                            >
                                {isDeleting ? "Deleting..." : "Delete transaction"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
