export default function TransactionsSkeleton() {
    return (
        <main
            role="status"
            aria-label="Loading transactions"
            className="animate-pulse motion-reduce:animate-none px-4 py-8 sm:px-6 lg:px-8"
        >
            <span className="sr-only">Loading transactions...</span>

            <div className="mx-auto max-w-7xl space-y-6">
                {/* Heading */}
                <div className="space-y-3">
                    <div className="h-3 w-28 rounded bg-slate-200" />
                    <div className="h-8 w-48 rounded bg-slate-200" />
                    <div className="h-4 w-64 max-w-full rounded bg-slate-200" />
                </div>

                {/* Filters */}
                <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="space-y-2">
                            <div className="h-3 w-20 rounded bg-slate-200" />
                            <div className="h-10 rounded-xl bg-slate-100" />
                        </div>
                    ))}
                </div>

                {/* Transactions table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="h-12 border-b border-slate-200 bg-slate-50" />

                    <div className="space-y-4 p-5">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-12 rounded-lg bg-slate-100"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}