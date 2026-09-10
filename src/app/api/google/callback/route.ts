import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/permissions";
import { handleGoogleCallback } from "@/lib/google/calendar";

export async function GET(request: NextRequest) {
  const user = await requireUser();

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get("google_oauth_state")?.value;
  const error = request.nextUrl.searchParams.get("error");

  const redirectBase = new URL("/agenda", request.nextUrl.origin);

  if (error) {
    redirectBase.searchParams.set("google", "cancelado");
    return NextResponse.redirect(redirectBase);
  }

  if (!code || !state || !cookieState || state !== cookieState) {
    redirectBase.searchParams.set("google", "erro");
    return NextResponse.redirect(redirectBase);
  }

  try {
    await handleGoogleCallback(code, user.id);
    redirectBase.searchParams.set("google", "conectado");
  } catch {
    redirectBase.searchParams.set("google", "erro");
  }

  const response = NextResponse.redirect(redirectBase);
  response.cookies.delete("google_oauth_state");
  return response;
}
