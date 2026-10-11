
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import RegisterForm from "./register-form";

export default async function RegisterPage() {
    const session = await auth();

    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <section className="w-full max-w-md space-y-6 rounded-xl border p-6 shadow-sm">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold">Create your account</h1>
                    <p className="text-sm text-gray-500">
                        Start managing your personal finances in one place.
                    </p>
                </div>

                <RegisterForm />

                <p className="text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium underline">
                        Sign in
                    </Link>
                </p>
            </section>
        </main>
    );
}
