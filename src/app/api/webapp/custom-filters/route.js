import { NextResponse } from "next/server";
const API_BASE = process.env.API_URL;
export const dynamic = "force-dynamic";

export async function GET(req) {
  const tma = req.nextUrl.searchParams.get("tma") || "";
  const botId = req.nextUrl.searchParams.get("bot_id") || "";
  const asUser = req.nextUrl.searchParams.get("as_user") || "";
  const qs = new URLSearchParams();
  if (tma) qs.set("tma", tma);
  if (botId) qs.set("bot_id", botId);
  if (asUser) qs.set("as_user", asUser);
  const upstream = await fetch(
    `${API_BASE}/webapp/custom-filters${qs.toString() ? `?${qs.toString()}` : ""}`,
    {
      cache: "no-store",
    }
  );
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") || "application/json",
    },
  });
}
