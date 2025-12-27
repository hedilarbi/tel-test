import { NextResponse } from "next/server";
const API_BASE = process.env.API_URL;
export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const body = await req.text();
  const tma = req.headers.get("authorization")?.replace(/^tma\s*/i, "") || "";
  const botId = req.nextUrl.searchParams.get("bot_id") || "";
  const qs = botId ? `?bot_id=${encodeURIComponent(botId)}` : "";
  const upstream = await fetch(
    `${API_BASE}/webapp/custom-filters/${params.slug}/toggle${qs}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `tma ${tma}`,
      },
      body,
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
