import { NextResponse } from "next/server";
const API_BASE = process.env.API_URL;
const ADMIN = "supersecret_admin_token";
export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  const body = await req.text();
  const r = await fetch(`${API_BASE}/admin/bots/${params.id}`, {
    method: "PATCH",
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
