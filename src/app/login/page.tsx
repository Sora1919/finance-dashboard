
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import LoginForm from "./login-form";

export default async function LoginPage() {
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
