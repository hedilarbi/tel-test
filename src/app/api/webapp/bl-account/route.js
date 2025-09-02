// pages/api/bl-account.ts

const API_BASE = process.env.API_URL;

export default async function handler(req, res) {
  const auth = req.headers.authorization || ""; // expect 'tma <initData>'
  const url = `${API_BASE}/webapp/bl-account`;

  try {
    if (req.method === "GET") {
      const r = await fetch(
        url +
          (req.query.tma
            ? `?tma=${encodeURIComponent(String(req.query.tma))}`
            : ""),
        {
          headers: { Authorization: auth },
          cache: "no-store",
        }
      );
      const data = await r.json();
      res.status(r.status).json(data);
      return;
    }

    if (req.method === "POST") {
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
        body: JSON.stringify(req.body),
      });
      const data = await r.json().catch(() => ({}));
      res.status(r.status).json(data);
      return;
    }

    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "method_not_allowed" });
  } catch (e) {
    res
      .status(502)
      .json({ error: "upstream_error", detail: String(e?.message || e) });
  }
}
