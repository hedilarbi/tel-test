import { NextResponse } from "next/server";

const API_BASE = process.env.API_URL;
export const dynamic = "force-dynamic";

export async function DELETE(req, { params }) {
  const url = new URL(req.url);
  const tma = url.searchParams.get("tma") || "";
  const botId = url.searchParams.get("bot_id") || "";
  const asUser = url.searchParams.get("as_user") || "";

  // prefer incoming Authorization header; fallback to query ?tma=
  const incomingAuth = req.headers.get("authorization") || "";
  const authHeader = incomingAuth || (tma ? `tma ${tma}` : "");

  const qsParams = new URLSearchParams();
  if (botId) qsParams.set("bot_id", botId);
  if (asUser) qsParams.set("as_user", asUser);
  const qs = qsParams.toString() ? `?${qsParams.toString()}` : "";
  const upstream = await fetch(`${API_BASE}/webapp/slots/${params.id}${qs}`, {
    method: "DELETE",
    headers: {
      ...(authHeader ? { authorization: authHeader } : {}),
      // no need to set content-type for DELETE with no body
    },
    cache: "no-store",
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
