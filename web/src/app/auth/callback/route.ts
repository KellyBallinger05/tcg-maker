import { NextResponse } from "next/server";
import { supabaseServerMutable } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (code) {
    const supa = await supabaseServerMutable();
    const { error } = await supa.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/signin?error=callback", req.url));
    }
  }

  // where to land after login:
  return NextResponse.redirect(new URL("/studio/games", req.url));
}