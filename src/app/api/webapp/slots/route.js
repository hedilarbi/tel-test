import { NextResponse } from "next/server";
const API_BASE = "https://dfcecd72e396.ngrok-free.app";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const tma = req.nextUrl.searchParams.get("tma") || "";
  const upstream = await fetch(
    `${API_BASE}/webapp/slots?tma=${encodeURIComponent(tma)}`,
    { cache: "no-store" }
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

export async function POST(req) {
  const auth = req.headers.get("authorization") || "";
  const body = await req.text();
  const upstream = await fetch(`${API_BASE}/webapp/slots`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: auth },
    body,
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
