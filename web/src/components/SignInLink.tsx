"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function SignInLink({ className }: { className: string }) {
    const pathname = usePathname();
    const sp = useSearchParams();
    const search = sp.toString() ? `?${sp.toString()}` : "";
    const next = `${pathname}${search}`;

    return (
        <Link href={`/auth/signin?next=${encodeURIComponent(next)}`} className={className}>
            Sign in
        </Link>
    );
}
