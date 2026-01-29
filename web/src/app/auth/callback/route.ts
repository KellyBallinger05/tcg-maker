import { NextResponse } from "next/server";
import { supabaseServerMutable } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next"); // optional

  // default landing page after login
  const defaultNext = "/studio/games";

  // only allow internal redirects (avoid open-redirect vulnerabilities)
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : defaultNext;

  if (!code) {
    return NextResponse.redirect(
      new URL(`/signin?error=missing_code`, url.origin)
    );
  }

  const supa = await supabaseServerMutable();
  const { error } = await supa.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/signin?error=callback`, url.origin)
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}