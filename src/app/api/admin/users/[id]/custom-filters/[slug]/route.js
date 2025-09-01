import { NextResponse } from "next/server";
const API_BASE = process.env.API_URL;
const ADMIN = process.env.ADMIN_TOKEN;
export const dynamic = "force-dynamic";

export async function POST(_req, { params }) {
  // assign
  const r = await fetch(
    `${API_BASE}/admin/users/${params.id}/custom-filters/${params.slug}`,
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

export async function DELETE(_req, { params }) {
  // unassign
  const r = await fetch(
    `${API_BASE}/admin/users/${params.id}/custom-filters/${params.slug}`,
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
  const r = await fetch(
    `${API_BASE}/admin/users/${params.id}/custom-filters/${params.slug}`,
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
