// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    // protect everything under /studio 
    const isProtected = pathname.startsWith("/studio");
    if (!isProtected) return NextResponse.next();

    let res = NextResponse.next();

    const supabase = createServerClient(url, anon, {
        cookies: {
            getAll() {
                return req.cookies.getAll().map(({ name, value }) => ({ name, value }));
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    res.cookies.set(name, value, options);
                });
            },
        },
    });

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = "/signin";
        redirectUrl.searchParams.set("next", pathname + search);
        return NextResponse.redirect(redirectUrl);
    }

    return res;
}

export const config = {
    matcher: ["/studio/:path*"],
};
