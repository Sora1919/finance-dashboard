export const formStyles = {
    label:
        "mb-1.5 block text-sm font-medium text-slate-700",

    input:
        "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",

    select:
        "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/15 disabled:cursor-not-allowed disabled:bg-slate-50",

    textarea:
        "w-full min-w-0 resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/15 disabled:cursor-not-allowed disabled:bg-slate-50",

    error:
        "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/15",

    errorMessage:
        "mt-1.5 text-xs text-rose-600",

    helperText:
        "mt-1.5 text-xs text-slate-500",
} as const;