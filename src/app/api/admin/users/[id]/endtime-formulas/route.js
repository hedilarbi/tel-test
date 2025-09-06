import { NextResponse } from "next/server";
const API_BASE = process.env.API_URL;
const ADMIN = "supersecret_admin_token";
export const dynamic = "force-dynamic";

export async function GET(_, { params }) {
  const { id } = params;
  const r = await fetch(`${API_BASE}/admin/users/${id}/endtime-formulas`, {
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
  const r = await fetch(`${API_BASE}/admin/users/${id}/endtime-formulas`, {
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
  const r = await fetch(`${API_BASE}/admin/users/${id}/endtime-formulas`, {
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
