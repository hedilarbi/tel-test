// app/api/bl-account/route.js
import { NextResponse } from "next/server";

const API_BASE = process.env.API_URL;
export const dynamic = "force-dynamic";

function redactHeaders(h = {}) {
  const out = {};
  for (const [k, v] of Array.from(
    h.entries ? h.entries() : Object.entries(h)
  )) {
    const key = k.toString().toLowerCase();
    out[key] = key === "authorization" ? "[redacted]" : v;
  }
  return out;
}
function safePreview(text = "", max = 300) {
  if (typeof text !== "string") return "";
  return text.length > max ? text.slice(0, max) + "…(truncated)" : text;
}

export async function OPTIONS() {
  console.log("[api/bl-account] OPTIONS 204");
  return new NextResponse(null, {
    status: 204,
    headers: { Allow: "GET, POST, OPTIONS, HEAD" },
  });
}

export async function HEAD() {
  console.log("[api/bl-account] HEAD 204");
  return new NextResponse(null, { status: 204 });
}

export async function GET(req) {
  const auth = req.headers.get("authorization") || "";
  const tma = req.nextUrl.searchParams.get("tma") || "";
  const botId = req.nextUrl.searchParams.get("bot_id") || "";
  const qs = new URLSearchParams();
  if (tma) qs.set("tma", tma);
  if (botId) qs.set("bot_id", botId);
  const fwdUrl = `${API_BASE}/webapp/bl-account${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;

  console.log(
    "[api/bl-account] → GET upstream",
    JSON.stringify({ fwdUrl, headers: redactHeaders(req.headers) })
  );

  const upstream = await fetch(fwdUrl, {
    headers: { Authorization: auth },
    cache: "no-store",
  });
  const text = await upstream.text();

  console.log(
    "[api/bl-account] ← GET upstream",
    JSON.stringify({
      status: upstream.status,
      contentType: upstream.headers.get("content-type"),
      bodyPreview: safePreview(text),
    })
  );

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
  const tma = req.nextUrl.searchParams.get("tma") || "";
  const botId = req.nextUrl.searchParams.get("bot_id") || "";
  const qs = new URLSearchParams();
  if (tma) qs.set("tma", tma);
  if (botId) qs.set("bot_id", botId);
  const fwdUrl = `${API_BASE}/webapp/bl-account${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;
  const bodyText = await req.text();

  // light redaction for logs
  let logBody = safePreview(bodyText);
  try {
    const p = JSON.parse(bodyText || "{}");
    if (p.password) p.password = "[redacted]";
    logBody = p;
  } catch {}

  console.log(
    "[api/bl-account] → POST upstream",
    JSON.stringify({
      fwdUrl,
      headers: {
        authorization: "[redacted]",
        "content-type": "application/json",
      },
      body: logBody,
    })
  );

  const upstream = await fetch(fwdUrl, {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: auth },
    body: bodyText,
  });
  const text = await upstream.text();

  console.log(
    "[api/bl-account] ← POST upstream",
    JSON.stringify({
      status: upstream.status,
      contentType: upstream.headers.get("content-type"),
      bodyPreview: safePreview(text),
    })
  );

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") || "application/json",
    },
  });
}
