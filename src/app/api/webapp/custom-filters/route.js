import { NextResponse } from "next/server";
const API_URL = process.env.API_URL;
export const dynamic = "force-dynamic";

export async function GET(req) {
  const tma = req.nextUrl.searchParams.get("tma") || "";
  const up = await fetch(
    `${API_URL}/webapp/custom-filters?tma=${encodeURIComponent(tma)}`,
    {
      cache: "no-store",
    }
  );
  const txt = await up.text();
  return new NextResponse(txt, {
    status: up.status,
    headers: {
      "content-type": up.headers.get("content-type") || "application/json",
    },
  });
}
