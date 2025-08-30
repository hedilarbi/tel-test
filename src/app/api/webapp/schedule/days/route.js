export async function GET(req) {
  const tma = req.headers.get("x-telegram-init-data") || "";
  if (!tma)
    return new Response(JSON.stringify({ error: "missing init data" }), {
      status: 401,
    });
  console.log("TMA:", tma);
  const upstream = process.env.API_URL;
  const r = await fetch(`${upstream}/webapp/days`, {
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
