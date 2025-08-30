import { NextResponse } from "next/server";
const API_BASE = process.env.API_URL;
export const dynamic = "force-dynamic";

export async function DELETE(_req, { params }) {
  const tma = _req.nextUrl.searchParams.get("tma") || "";
  const upstream = await fetch(`${API_BASE}/webapp/slots/${params.id}`, {
    method: "DELETE",
    headers: {
      "content-type": "application/json",
      authorization: `tma ${tma}`,
    },
  });
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") || "application/json",
    },
  });
}
