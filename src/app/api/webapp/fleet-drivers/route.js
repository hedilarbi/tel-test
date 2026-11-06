export async function GET(req) {
  const url = new URL(req.url);
  const tma =
    req.headers.get("x-telegram-init-data") ||
    url.searchParams.get("tma") ||
    "";
  if (!tma)
    return new Response(JSON.stringify({ error: "missing init data" }), {
      status: 401,
    });

  const upstream = process.env.API_URL;
  const qs = url.search; // pass through ?bot_id=&as_user=

  const r = await fetch(`${upstream}/webapp/fleet-drivers${qs}`, {
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
