
"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {
    error: null,
};

export default function LoginForm() {
    const [state, formAction, isPending] = useActionState(
        loginAction,
        initialState
    );

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    className="w-full rounded-md border px-3 py-2"
                    placeholder="you@example.com"
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="mb-1 block text-sm font-medium"
                >
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-md border px-3 py-2"
                    placeholder="Enter your password"
                />
            </div>

            {state.error && (
                <p role="alert" className="text-sm text-red-600">
                    {state.error}
                </p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
            >
                {isPending ? "Signing in..." : "Sign in"}
            </button>
        </form>
    );
}
