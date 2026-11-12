export default function DashboardSkeleton() {
    return (
        <div
            role="status"
            aria-label="Loading dashboard"
            className="animate-pulse motion-reduce:animate-none px-4 py-8 sm:px-6 lg:px-8"
        >
            <span className="sr-only">Loading dashboard...</span>

            <div className="mx-auto max-w-7xl space-y-7">
                {/* Header */}
                <div className="flex items-center justify-between rounded-xl bg-white p-5">
                    <div className="space-y-2">
                        <div className="h-3 w-32 rounded bg-slate-200" />
                        <div className="h-5 w-40 rounded bg-slate-200" />
                    </div>

                    <div className="size-9 rounded-full bg-slate-200" />
                </div>

                {/* Welcome */}
                <div className="space-y-3">
                    <div className="h-3 w-40 rounded bg-slate-200" />
                    <div className="h-8 w-64 max-w-full rounded bg-slate-200" />
                    <div className="h-4 w-56 max-w-full rounded bg-slate-200" />
                </div>

                {/* Summary cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-44 rounded-2xl border border-slate-200 bg-white p-6"
                        >
                            <div className="h-4 w-28 rounded bg-slate-200" />
                            <div className="mt-8 h-8 w-36 rounded bg-slate-200" />
                            <div className="mt-3 h-3 w-32 rounded bg-slate-100" />
                        </div>
                    ))}
                </div>

                {/* Chart and quick overview */}
                <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                    <div className="h-80 rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="h-5 w-28 rounded bg-slate-200" />
                        <div className="mt-4 h-3 w-44 rounded bg-slate-100" />
                        <div className="mt-8 h-44 rounded-xl bg-slate-100" />
                    </div>

                    <div className="h-80 rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="h-5 w-32 rounded bg-slate-200" />
                        <div className="mt-8 space-y-6">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="h-5 rounded bg-slate-100"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Transactions table */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="h-5 w-44 rounded bg-slate-200" />

                    <div className="mt-6 space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-12 rounded-lg bg-slate-100"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}