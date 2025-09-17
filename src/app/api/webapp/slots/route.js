import { NextResponse } from "next/server";
const API_BASE = process.env.API_URL;

export const dynamic = "force-dynamic";

export async function GET(req) {
  console.log(API_BASE);
  console.log("GET request");
  const tma = req.nextUrl.searchParams.get("tma") || "";
  console.log("tma=", tma);
  const upstream = await fetch(
    `${API_BASE}/webapp/slots?tma=${encodeURIComponent(tma)}`,
    { cache: "no-store" }
  );
  console.log("upstream response:", upstream);
  const text = await upstream.text();
  console.log(text);
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
