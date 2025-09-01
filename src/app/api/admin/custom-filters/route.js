import { NextResponse } from "next/server";
const API_BASE = process.env.API_URL;
const ADMIN = "supersecret_admin_token";
export const dynamic = "force-dynamic";

export async function GET() {
  const r = await fetch(`${API_BASE}/admin/custom-filters`, {
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

export async function POST(req) {
  const body = await req.text();
  const r = await fetch(`${API_BASE}/admin/custom-filters`, {
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
