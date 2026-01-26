import { NextResponse } from "next/server";
const API_BASE = process.env.API_URL;
export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const body = await req.text();
  const tma = req.headers.get("authorization")?.replace(/^tma\s*/i, "") || "";
  const botId = req.nextUrl.searchParams.get("bot_id") || "";
  const asUser = req.nextUrl.searchParams.get("as_user") || "";
  const qsParams = new URLSearchParams();
  if (botId) qsParams.set("bot_id", botId);
  if (asUser) qsParams.set("as_user", asUser);
  const qs = qsParams.toString() ? `?${qsParams.toString()}` : "";
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
