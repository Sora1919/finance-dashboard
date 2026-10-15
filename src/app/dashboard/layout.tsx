
import type { ReactNode } from "react";
import DashboardNavigation from "./dashboard-navigation";

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
                {children}
            </div>
        </div>
    );
}
