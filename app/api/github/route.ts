import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubContributions } from "@/lib/github-api";

/**
 * GET /api/github?username=om2309
 * Returns contribution data for a GitHub user.
 * Falls back to null if GITHUB_TOKEN is not set.
 */
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.trim();

  if (!username || !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username)) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  const data = await fetchGitHubContributions(username);
  if (!data) {
    return NextResponse.json({ error: "Not found or token missing" }, { status: 404 });
  }

  return NextResponse.json({ data });
}
