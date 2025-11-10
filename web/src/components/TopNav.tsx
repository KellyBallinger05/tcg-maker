import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function TopNav() {
    const supa = await createClient();
    const { data: { user } } = await supa.auth.getUser();

    return (
        <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Link href="/" className="font-semibold tracking-tight">TCG Maker</Link>
                    <div className="hidden sm:flex items-center gap-3 text-sm text-gray-700">
                        <Link href="/portal" className="hover:underline">Portal</Link>
                        <span className="text-gray-300">|</span>
                        <Link href="/playtest" className="hover:underline">Playtest</Link>
                        <span className="text-gray-300">|</span>
                        <Link href="/studio/games" className="hover:underline">My Games</Link>
                        <Link href="/studio/games/new" className="hover:underline">New Game</Link>
                        <Link href="/studio/cards" className="hover:underline">My Cards</Link>
                        <Link href="/studio/cards/new" className="hover:underline">New Card</Link>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                    {user ? (
                        <>
                            <span className="hidden sm:inline text-gray-600">{user.email}</span>
                            <Link href="/auth/signout" className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300">
                                Sign out
                            </Link>
                        </>
                    ) : (
                        <Link
                            href="/auth/signin"
                            className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                        >
                            Sign in
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}
