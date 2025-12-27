import { NextResponse } from "next/server";
const API_BASE = process.env.API_URL;
const ADMIN = "supersecret_admin_token";
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { id } = params;
  const botId = req.nextUrl.searchParams.get("bot_id") || "";
  const qs = botId ? `?bot_id=${encodeURIComponent(botId)}` : "";
  const r = await fetch(`${API_BASE}/admin/users/${id}/endtime-formulas${qs}`, {
    headers: { authorization: `admin ${ADMIN}` },
    cache: "no-store",
  });
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}

export async function POST(req, { params }) {
  const { id } = params;
  const body = await req.text();
  const botId = req.nextUrl.searchParams.get("bot_id") || "";
  const qs = botId ? `?bot_id=${encodeURIComponent(botId)}` : "";
  const r = await fetch(`${API_BASE}/admin/users/${id}/endtime-formulas${qs}`, {
    method: "POST",
    headers: {
      authorization: `admin ${ADMIN}`,
      "content-type": "application/json",
    },
    body,
  });
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}

export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.text();
  const botId = req.nextUrl.searchParams.get("bot_id") || "";
  const qs = botId ? `?bot_id=${encodeURIComponent(botId)}` : "";
  const r = await fetch(`${API_BASE}/admin/users/${id}/endtime-formulas${qs}`, {
    method: "PUT",
    headers: {
      authorization: `admin ${ADMIN}`,
      "content-type": "application/json",
    },
    body,
  });
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}
