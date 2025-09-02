// pages/api/bl-account.ts

const API_BASE = process.env.API_URL;

export default async function handler(req, res) {
  const auth = req.headers.authorization || "";
  const url = `${API_BASE}/webapp/bl-account`;

  try {
    if (req.method === "GET") {
      const tma = typeof req.query.tma === "string" ? req.query.tma : "";
      const upstream = await fetch(
        url + (tma ? `?tma=${encodeURIComponent(tma)}` : ""),
        {
          headers: { Authorization: auth },
          cache: "no-store",
        }
      );
      const text = await upstream.text();
      res.status(upstream.status);
      res.setHeader(
        "content-type",
        upstream.headers.get("content-type") || "application/json"
      );
      res.end(text);
      return;
    }

    if (req.method === "POST") {
      const bodyText =
        typeof req.body === "string"
          ? req.body
          : JSON.stringify(req.body || {});
      const upstream = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: auth,
        },
        body: bodyText,
      });
      const text = await upstream.text();
      res.status(upstream.status);
      res.setHeader(
        "content-type",
        upstream.headers.get("content-type") || "application/json"
      );
      res.end(text);
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
