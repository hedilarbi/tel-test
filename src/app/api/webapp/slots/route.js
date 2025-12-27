import { NextResponse } from "next/server";
const API_BASE = process.env.API_URL;

export const dynamic = "force-dynamic";

export async function GET(req) {
  const tma = req.nextUrl.searchParams.get("tma") || "";
  const botId = req.nextUrl.searchParams.get("bot_id") || "";
  const qs = new URLSearchParams();
  if (tma) qs.set("tma", tma);
  if (botId) qs.set("bot_id", botId);

  const upstream = await fetch(
    `${API_BASE}/webapp/slots${qs.toString() ? `?${qs.toString()}` : ""}`,
    { cache: "no-store" }
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

export async function POST(req) {
  const auth = req.headers.get("authorization") || "";
  const body = await req.text();
  const botId = req.nextUrl.searchParams.get("bot_id") || "";
  const qs = botId ? `?bot_id=${encodeURIComponent(botId)}` : "";
  const upstream = await fetch(`${API_BASE}/webapp/slots${qs}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: auth },
    body,
  });
  const text = await upstream.text();

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") || "application/json",
    },
  });
}
