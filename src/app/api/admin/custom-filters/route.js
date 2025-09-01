import { NextResponse } from "next/server";
const API_URL = process.env.API_URL;
const ADMIN = process.env.ADMIN_TOKEN;

export const dynamic = "force-dynamic";

export async function GET() {
  const up = await fetch(`${API_URL}/admin/custom-filters`, {
    headers: { Authorization: `admin ${ADMIN}` },
    cache: "no-store",
  });
  const txt = await up.text();
  return new NextResponse(txt, {
    status: up.status,
    headers: {
      "content-type": up.headers.get("content-type") || "application/json",
    },
  });
}

export async function POST(req) {
  const body = await req.json();
  const up = await fetch(`${API_URL}/admin/custom-filters`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `admin ${ADMIN}`,
    },
    body: JSON.stringify(body),
  });
  const txt = await up.text();
  return new NextResponse(txt, {
    status: up.status,
    headers: {
      "content-type": up.headers.get("content-type") || "application/json",
    },
  });
}
