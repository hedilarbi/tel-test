// pages/api/bl-account.js
const API_BASE = process.env.API_URL;

// small helpers to keep secrets out of logs
function redactHeaders(h = {}) {
  const out = {};
  for (const [k, v] of Object.entries(h)) {
    out[k] = k.toLowerCase() === "authorization" ? "[redacted]" : v;
  }
  return out;
}
function safePreview(text = "", max = 300) {
  if (typeof text !== "string") return "";
  return text.length > max ? text.slice(0, max) + "…(truncated)" : text;
}

export default async function handler(req, res) {
  const method = req.method || "GET";
  const auth = req.headers.authorization || ""; // 'tma <initData>'
  const url = `${API_BASE}/webapp/bl-account`;

  // Log inbound request
  console.log(
    "[api/bl-account] inbound",
    JSON.stringify({
      method,
      query: req.query || {},
      headers: redactHeaders(req.headers || {}),
    })
  );

  try {
    if (method === "GET") {
      const tma = typeof req.query.tma === "string" ? req.query.tma : "";
      const fwdUrl = url + (tma ? `?tma=${encodeURIComponent(tma)}` : "");

      console.log("[api/bl-account] → GET upstream", fwdUrl);

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

      res.status(upstream.status);
      res.setHeader(
        "content-type",
        upstream.headers.get("content-type") || "application/json"
      );
      res.end(text);
      return;
    }

    if (method === "POST") {
      // Allow both header auth and ?tma= (matches backend’s _require_user_from_any)
      const tma = typeof req.query.tma === "string" ? req.query.tma : "";
      const fwdUrl = url + (tma ? `?tma=${encodeURIComponent(tma)}` : "");

      const bodyText =
        typeof req.body === "string"
          ? req.body
          : JSON.stringify(req.body || {});

      // Log POST body (with very light redaction)
      let logBody;
      try {
        const parsed = JSON.parse(bodyText || "{}");
        if (parsed.password) parsed.password = "[redacted]";
        logBody = parsed;
      } catch {
        logBody = safePreview(bodyText);
      }

      console.log(
        "[api/bl-account] → POST upstream",
        JSON.stringify({
          fwdUrl,
          headers: redactHeaders({
            "content-type": "application/json",
            Authorization: auth,
          }),
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

      res.status(upstream.status);
      res.setHeader(
        "content-type",
        upstream.headers.get("content-type") || "application/json"
      );
      res.end(text);
      return;
    }

    console.warn("[api/bl-account] 405 for method", method);
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "method_not_allowed", method });
  } catch (e) {
    console.error("[api/bl-account] upstream error", e);
    res
      .status(502)
      .json({ error: "upstream_error", detail: String(e?.message || e) });
  }
}
