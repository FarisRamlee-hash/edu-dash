import { NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/settings?error=google_denied", req.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await db.settings.upsert({
      where: { id: "singleton" },
      update: { googleTokens: JSON.stringify(tokens) },
      create: { id: "singleton", googleTokens: JSON.stringify(tokens) },
    });
    return NextResponse.redirect(new URL("/settings?connected=1", req.url));
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(new URL("/settings?error=oauth_failed", req.url));
  }
}
