import {connection} from "next/server";
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";
import Link from "next/link";

export default function LoginPage() {
    return (
        <Suspense fallback={<main className="p-6">Loading login...</main>}>
            <LoginPageContent />
        </Suspense>
    );
}

async function LoginPageContent() {
    await connection();

    const session = await auth();

    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <section className="w-full max-w-md space-y-6 rounded-xl border p-6 shadow-sm">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-sm text-gray-500">
                        Sign in to your Personal Finance Dashboard.
                    </p>
                </div>

                <LoginForm />

                <p className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-medium underline">
                        Create an account
                    </Link>
                </p>
            </section>
        </main>
    );
}
