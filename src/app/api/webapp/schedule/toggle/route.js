export async function POST(req) {
  const tma = req.headers.get("x-telegram-init-data") || "";
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
  const r = await fetch(`${upstream}/webapp/days/toggle`, {
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
