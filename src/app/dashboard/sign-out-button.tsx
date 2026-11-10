import { signOut } from "@/auth";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
    return (
        <form
            action={async () => {
                "use server";

                await signOut({
                    redirectTo: "/login",
                });
            }}
        >
            <button
                type="submit"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:h-10 sm:px-4 sm:text-sm"
            >
                <LogOut className="size-4" aria-hidden="true" />

                <span className="hidden sm:inline">
                    Sign out
                </span>
                <span className="sr-only sm:hidden">
                    Sign out
                </span>
            </button>
        </form>
    );
}