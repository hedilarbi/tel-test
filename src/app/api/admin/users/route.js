import { NextResponse } from "next/server";
const API_BASE = process.env.API_URL;
const ADMIN = "supersecret_admin_token";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const botId = req.nextUrl.searchParams.get("bot_id") || "";
  const qs = botId ? `?bot_id=${encodeURIComponent(botId)}` : "";
  const r = await fetch(`${API_BASE}/admin/users${qs}`, {
    headers: { authorization: `admin ${ADMIN}` },
    cache: "no-store",
  });
  const text = await r.text();
  console.log(text);
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}
