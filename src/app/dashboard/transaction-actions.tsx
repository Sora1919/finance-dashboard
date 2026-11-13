
"use client";

import {
    useRef,
    useState,
    type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/lib/button-styles";
import { formStyles } from "@/lib/form-styles";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { AlertTriangle, X } from "lucide-react";

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
    const editTitleRef = useRef<HTMLInputElement>(null);

    function handleEditOpenChange(open: boolean) {
        if (isSubmitting || isDeleting) return;

        if (open) {
            setForm(getFormData(transaction));
        }

        setError("");
        setIsEditing(open);
    }

    async function handleUpdate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting || isDeleting) return;

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
        if (isDeleting || !isDeleteOpen ) return;

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

    function handleDeleteOpenChange(open: boolean) {
        if (isDeleting || isSubmitting) return;

        setIsDeleteOpen(open);
        setDeleteError("");
    }

    return (
        <>
            <div className="flex items-center justify-end gap-2">
                <Dialog
                    open={isEditing}
                    onOpenChange={handleEditOpenChange}
                >
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            disabled={isDeleting || isSubmitting || isDeleteOpen}
                            className={buttonStyles.secondary}
                        >
                            Edit
                        </button>
                    </DialogTrigger>

                    <DialogContent
                        showCloseButton={false}
                        className="max-h-[92dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl bg-white p-5 sm:p-7"
                        onEscapeKeyDown={(event) => {
                            if (isSubmitting) event.preventDefault();
                        }}
                        onInteractOutside={(event) => {
                            if (isSubmitting) event.preventDefault();
                        }}
                        onOpenAutoFocus={(event) => {
                            event.preventDefault();
                            editTitleRef.current?.focus();
                        }}
                    >
                        <DialogHeader className="flex flex-row items-start justify-between gap-4 space-y-0 text-left">
                            <div className="min-w-0">
                                <DialogTitle className="text-xl font-bold tracking-tight">
                                    Edit transaction
                                </DialogTitle>

                                <DialogDescription className="mt-1 text-sm text-slate-500">
                                    Update your transaction details.
                                </DialogDescription>
                            </div>

                            <button
                                type="button"
                                aria-label="Close edit form"
                                disabled={isSubmitting}
                                onClick={() => handleEditOpenChange(false)}
                                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50"
                            >
                                <X className="size-5" aria-hidden="true" />
                            </button>
                        </DialogHeader>

                        {/* Keep your existing Edit form here */}
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
                                    onClick={() => handleEditOpenChange(false)}
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
                    </DialogContent>
                </Dialog>

                <AlertDialog
                    open={isDeleteOpen}
                    onOpenChange={handleDeleteOpenChange}
                >
                    <AlertDialogTrigger asChild>
                        <button
                            type="button"
                            disabled={isDeleting || isSubmitting || isEditing}
                            className={buttonStyles.dangerOutline}
                        >
                            Delete
                        </button>
                    </AlertDialogTrigger>

                    <AlertDialogContent
                        className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-6 sm:p-7"
                        onEscapeKeyDown={(event) => {
                            if (isDeleting) {
                                event.preventDefault();
                            }
                        }}
                    >
                        <AlertDialogHeader>
                            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                                <AlertTriangle
                                    className="size-6"
                                    aria-hidden="true"
                                />
                            </div>

                            <AlertDialogTitle className="text-xl font-bold tracking-tight text-slate-900">
                                Delete transaction?
                            </AlertDialogTitle>

                            <AlertDialogDescription className="text-sm leading-6 text-slate-500">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-slate-800">
                                    {transaction.title}
                                </span>
                                ? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        {deleteError && (
                            <p
                                role="alert"
                                className="rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
                            >
                                {deleteError}
                            </p>
                        )}

                        <AlertDialogFooter className="mt-5 gap-3">
                            <AlertDialogCancel
                                disabled={isDeleting}
                                className={buttonStyles.secondary}
                            >
                                Cancel
                            </AlertDialogCancel>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                aria-busy={isDeleting}
                                className={buttonStyles.danger}
                            >
                                {isDeleting
                                    ? "Deleting..."
                                    : "Delete transaction"}
                            </button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    );
}
