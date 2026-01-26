export async function GET(req) {
  const tma = req.headers.get("x-telegram-init-data") || "";
  const url = new URL(req.url);
  const botId = url.searchParams.get("bot_id") || "";
  const asUser = url.searchParams.get("as_user") || "";
  if (!tma)
    return new Response(JSON.stringify({ error: "missing init data" }), {
      status: 401,
    });
  console.log("TMA:", tma);
  const upstream = process.env.API_URL;
  const qsParams = new URLSearchParams();
  if (botId) qsParams.set("bot_id", botId);
  if (asUser) qsParams.set("as_user", asUser);
  const qs = qsParams.toString() ? `?${qsParams.toString()}` : "";
  const r = await fetch(`${upstream}/webapp/days${qs}`, {
    headers: {
      Authorization: `tma ${tma}`,
      "ngrok-skip-browser-warning": "true",
    },
    cache: "no-store",
  });

  const body = await r.text();
  return new Response(body, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}
