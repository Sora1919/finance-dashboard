
"use client";

import { useState, type FormEvent } from "react";

export default function RegisterForm() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError(null);
        setSuccess(false);
        setIsPending(true);

        const form = event.currentTarget;
        const formData = new FormData(form);

        const payload = {
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
        };

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result: { message?: string; errors?: Record<string, string[]> } =
                await response.json();

            if (!response.ok) {
                const firstFieldError = result.errors
                    ? Object.values(result.errors).flat()[0]
                    : undefined;

                setError(
                    firstFieldError ??
                    result.message ??
                    "Unable to create your account. Please try again."
                );
                return;
            }

            setSuccess(true);
            form.reset();
        } catch {
            setError("Unable to connect. Please check your connection and try again.");
        } finally {
            setIsPending(false);
        }
    }

    if (success) {
        return (
            <div className="space-y-4 text-center">
                <div
                    role="status"
                    className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                >
                    <p className="font-semibold">Account created successfully!</p>
                    <p className="mt-1">
                        Your account is ready. You can now sign in with your email and
                        password.
                    </p>
                </div>

                <a
                    href="/login"
                    className="inline-flex w-full justify-center rounded-md bg-black px-4 py-2 text-white"
                >
                    Go to sign in
                </a>

                <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="text-sm underline"
                >
                    Register another account
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium">
                    Full name
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    minLength={2}
                    maxLength={80}
                    required
                    className="w-full rounded-md border px-3 py-2"
                    placeholder="Your name"
                />
            </div>

            <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                    className="w-full rounded-md border px-3 py-2"
                    placeholder="you@example.com"
                />
            </div>

            <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium">
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    required
                    className="w-full rounded-md border px-3 py-2"
                    placeholder="At least 8 characters"
                />
                <p className="mt-1 text-xs text-gray-500">
                    Use at least 8 characters.
                </p>
            </div>

            {error && (
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isPending ? "Creating account..." : "Create account"}
            </button>
        </form>
    );
}
