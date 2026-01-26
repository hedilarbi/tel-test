// app/bl-account/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

function maskEmail(email) {
  if (!email) return "";
  const [local, domain = ""] = String(email).split("@");
  if (local.length <= 4) return `${local}*****@${domain}`;
  const head = local.slice(0, 4);
  const tail = local.length > 8 ? local.slice(-4) : "";
  return `${head}*****${tail}@${domain}`;
}

export default function BLAccountPage() {
  const [email, setEmail] = useState("");
  const [existingEmail, setExistingEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const tg =
    typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  const initDataRaw = useMemo(() => tg?.initData ?? "", [tg]);
  const botId = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("bot_id") || "";
  }, []);
  const asUser = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("as_user") || "";
  }, []);
  const API_BASE = "/api/webapp";
  const withBotId = (url) => {
    const params = new URLSearchParams();
    if (botId) params.set("bot_id", botId);
    if (asUser) params.set("as_user", asUser);
    if (!params.toString()) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}${params.toString()}`;
  };

  useEffect(() => {
    if (!tg) return;
    try {
      tg.ready();
      tg.expand();
      tg.setBackgroundColor?.("#ffffff");
      tg.setHeaderColor?.("#000000");
    } catch {}
  }, [tg]);

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const r = await fetch(
        withBotId(
          `${API_BASE}/bl-account?tma=${encodeURIComponent(initDataRaw)}`
        ),
        { cache: "no-store" }
      );
      // proxy guarantees JSON content-type
      const j = await r.json().catch(() => ({}));
      setExistingEmail(j?.email || "");
    } catch (e) {
      setErr(e?.message || "Failed to load.");
      setExistingEmail("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initDataRaw) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initDataRaw]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide both email and password.");
      return;
    }
    setSubmitting(true);
    setErr("");
    try {
      const r = await fetch(withBotId(`${API_BASE}/bl-account`), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `tma ${initDataRaw}`,
        },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        const msg =
          j?.detail?.error ||
          j?.error ||
          (Array.isArray(j?.detail)
            ? j.detail.map((d) => d.msg).join(", ")
            : "") ||
          `HTTP ${r.status}`;
        throw new Error(msg || "Save failed");
      }
      toast.success("BL account saved");
      setExistingEmail(email);
      setPassword("");
    } catch (e) {
      setErr(e?.message || "Failed to save.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-md px-4 py-6">
        <h1 className="text-3xl font-semibold tracking-tight">BL account</h1>
        <p className="mt-1 text-sm text-slate-500">Setup new BL account</p>

        {/* Current account (if any) */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
          <div className="font-medium text-slate-700">Current account</div>
          <div className="mt-1 text-slate-600">
            {loading
              ? "Loading…"
              : existingEmail
              ? maskEmail(existingEmail)
              : "—"}
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email:
            </label>
            <input
              type="email"
              placeholder="Please enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-slate-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password:
            </label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-slate-400"
              required
            />
          </div>

          {err && (
            <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            Save account
          </button>
        </form>
      </div>
    </div>
  );
}
