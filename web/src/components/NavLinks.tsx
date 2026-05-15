"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { href: "/portal",        label: "Portal" },
    { href: "/playtest",      label: "Playtest" },
    { href: "/studio/games",  label: "Games" },
    { href: "/studio/decks",  label: "Decks" },
    { href: "/studio/cards",  label: "Cards" },
];

export default function NavLinks() {
    const pathname = usePathname();

    return (
        <div className="hidden sm:flex items-center gap-1 text-sm">
            {links.map(({ href, label }, i) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                    <div key={href} className="flex items-center">
                        {i === 2 && (
                            <span aria-hidden="true" className="mx-2 text-gray-300 select-none">|</span>
                        )}
                        <Link
                            href={href}
                            className={`px-1 pb-0.5 border-b-2 transition-colors duration-150 ${
                                isActive
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-700 hover:border-blue-600 hover:text-blue-600"
                            }`}
                        >
                            {label}
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}
