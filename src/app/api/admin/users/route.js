export const dynamic = "force-dynamic";
const API_BASE = process.env.API_URL;

export async function GET(req) {
  const adminToken = req.headers.get("x-admin-token") || "";
  const upstream = await fetch(`${API_BASE}/admin/users`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      authorization: `admin ${adminToken}`,
    },
    cache: "no-store",
  });
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") || "application/json",
    },
  });
}
