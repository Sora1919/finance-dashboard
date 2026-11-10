
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    {
        label: "Overview",
        href: "/dashboard",
        icon: "▦",
    },
    {
        label: "Transactions",
        href: "/dashboard/transactions",
        icon: "▤",
    },
];

type DashboardNavigationProps = {
    variant?: "desktop" | "mobile";
};

export default function DashboardNavigation({
                                                variant = "desktop",
                                            }: DashboardNavigationProps) {
    const pathname = usePathname();

    function isActive(href: string) {
        if (href === "/dashboard") {
            return pathname === "/dashboard";
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    }

    return (
        <nav
            aria-label={
                variant === "mobile"
                    ? "Mobile navigation"
                    : "Main navigation"
            }
            className={
                variant === "mobile"
                    ? "fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-slate-200 bg-white/95 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
                    : "hidden space-y-1 lg:block"
            }
        >
            {links.map((link) => {
                const active = isActive(link.href);

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={
                            variant === "mobile"
                                ? `flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium ${
                                    active
                                        ? "bg-emerald-50 text-emerald-800"
                                        : "text-slate-500 hover:bg-slate-50"
                                }`
                                : `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                                    active
                                        ? "bg-emerald-50 text-emerald-800"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                }`
                        }
                    >
                    <span
                        aria-hidden="true"
                        className={
                            variant === "mobile"
                                ? "text-lg"
                                : "flex size-5 items-center justify-center text-base"
                        }
                    >
                        {link.icon}
                    </span>

                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
