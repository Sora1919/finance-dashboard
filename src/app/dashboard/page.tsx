import {connection} from "next/server";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export default async function DashboardPage() {
    return (
        <Suspense fallback={<main className="p-6">Loading dashboard...</main>}>
            <DashboardContent/>
        </Suspense>
    )
}

async function DashboardContent() {
    await connection();

    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    return (
        <main className="mx-auto max-w-4xl space-y-6 p-6">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Finance Dashboard</h1>
                    <p className="text-sm text-gray-500">
                        Welcome, {session.user.name ?? session.user.email}!
                    </p>
                </div>

                <form
                    action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/login" });
                    }}
                >
                    <button
                        type="submit"
                        className="rounded-md border px-4 py-2 text-sm"
                    >
                        Sign out
                    </button>
                </form>
            </header>

            <section className="rounded-xl border p-6">
                <h2 className="text-lg font-semibold">You&#39;re signed in!</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Your private finance dashboard will be built in the next milestone.
                </p>
            </section>
        </main>
    );
}
