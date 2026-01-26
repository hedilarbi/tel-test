export async function POST(req) {
  const tma = req.headers.get("x-telegram-init-data") || "";
  const url = new URL(req.url);
  const botId = url.searchParams.get("bot_id") || "";
  const asUser = url.searchParams.get("as_user") || "";
  const { day } = await req.json();
  if (!tma)
    return new Response(JSON.stringify({ error: "missing init data" }), {
      status: 401,
    });
  if (!day)
    return new Response(JSON.stringify({ error: "missing day" }), {
      status: 400,
    });

  const upstream = process.env.API_URL;
  const qsParams = new URLSearchParams();
  if (botId) qsParams.set("bot_id", botId);
  if (asUser) qsParams.set("as_user", asUser);
  const qs = qsParams.toString() ? `?${qsParams.toString()}` : "";
  const r = await fetch(`${upstream}/webapp/days/toggle${qs}`, {
    method: "POST",
    headers: {
      Authorization: `tma ${tma}`,
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ day }),
  });

  const body = await r.text();
  return new Response(body, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}
