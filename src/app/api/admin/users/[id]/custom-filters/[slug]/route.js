import { NextResponse } from "next/server";
const API_BASE = process.env.API_URL;
const ADMIN = "supersecret_admin_token";
export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  // assign
  const botId = req.nextUrl.searchParams.get("bot_id") || "";
  const qs = botId ? `?bot_id=${encodeURIComponent(botId)}` : "";
  const r = await fetch(
    `${API_BASE}/admin/users/${params.id}/custom-filters/${params.slug}${qs}`,
    {
      method: "POST",
      headers: { authorization: `admin ${ADMIN}` },
    }
  );
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}

export async function DELETE(req, { params }) {
  // unassign
  const botId = req.nextUrl.searchParams.get("bot_id") || "";
  const qs = botId ? `?bot_id=${encodeURIComponent(botId)}` : "";
  const r = await fetch(
    `${API_BASE}/admin/users/${params.id}/custom-filters/${params.slug}${qs}`,
    {
      method: "DELETE",
      headers: { authorization: `admin ${ADMIN}` },
    }
  );
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}

export async function PATCH(req, { params }) {
  // toggle enabled
  const body = await req.text();
  const botId = req.nextUrl.searchParams.get("bot_id") || "";
  const qs = botId ? `?bot_id=${encodeURIComponent(botId)}` : "";
  const r = await fetch(
    `${API_BASE}/admin/users/${params.id}/custom-filters/${params.slug}${qs}`,
    {
      method: "PATCH",
      headers: {
        authorization: `admin ${ADMIN}`,
        "content-type": "application/json",
      },
      body,
    }
  );
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}
