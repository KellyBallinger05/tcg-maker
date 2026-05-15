import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignInLink from "./SignInLink";
import NavLinks from "./NavLinks";

export default async function TopNav() {
    const supa = await createClient();
    const {
        data: { user },
    } = await supa.auth.getUser();

    return (
        <header className="border-b border-gray-300 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
            <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-4">
                    <Link href="/" className="font-semibold tracking-tight pb-0.5 border-b-2 border-transparent">
                        TCG Maker
                    </Link>
                    <NavLinks />
                </div>

                <div className="flex items-center gap-3 text-sm">
                    {user ? (
                        <>
                            <span className="hidden sm:inline text-gray-600">{user.email}</span>
                            <Link
                                href="/auth/signout"
                                className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
                            >
                                Sign out
                            </Link>
                        </>
                    ) : (
                        <SignInLink className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700" />
                    )}
                </div>
            </nav>
        </header>
    );
}
