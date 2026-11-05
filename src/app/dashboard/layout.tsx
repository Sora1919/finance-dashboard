
import type { ReactNode } from "react";
import DashboardNavigation from "./dashboard-navigation";
import { signOut } from "@/auth";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white px-5 py-6 lg:flex">
                <a
                    href="/dashboard"
                    className="mb-10 flex items-center gap-3"
                >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-700 text-lg font-bold text-white">
                        M
                    </span>
                    <span className="text-xl font-bold tracking-tight">
                        Mintly
                    </span>
                </a>

                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Workspace
                </p>

                <DashboardNavigation />

                <div className="mt-auto rounded-2xl bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-900">
                        Small steps add up
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-800">
                        Keep tracking your finances to understand your habits.
                    </p>
                </div>
            </aside>

            <div className="min-w-0 lg:pl-64">
                <div className="fixed right-4 top-4 z-50">
                    <form
                        action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/login" });
                        }}
                    >
                        <button
                            type="submit"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                        >
                            Sign out
                        </button>
                    </form>
                </div>

                {children}
            </div>
        </div>
    );
}
