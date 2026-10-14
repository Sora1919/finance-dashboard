
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

export default function DashboardNavigation() {
    const pathname = usePathname();

    function isActive(href: string) {
        if (href === "/dashboard") {
            return pathname === "/dashboard";
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    }

    return (
        <>
            <nav aria-label="Main navigation" className="space-y-1">
                {links.map((link) => {
                    const active = isActive(link.href);

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            aria-current={active ? "page" : undefined}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                                active
                                    ? "bg-emerald-50 text-emerald-800"
                                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                        >
                            <span
                                aria-hidden="true"
                                className="flex size-5 items-center justify-center text-base"
                            >
                                {link.icon}
                            </span>
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <nav
                aria-label="Mobile navigation"
                className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-slate-200 bg-white/95 p-2 backdrop-blur lg:hidden"
            >
                {links.map((link) => {
                    const active = isActive(link.href);

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            aria-current={active ? "page" : undefined}
                            className={`flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium ${
                                active
                                    ? "text-emerald-800"
                                    : "text-slate-500"
                            }`}
                        >
                            <span aria-hidden="true" className="text-lg">
                                {link.icon}
                            </span>
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
