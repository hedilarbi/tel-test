// app/bl-account/page.tsx
"use client";

import { useEffect, useState } from "react";

function getInitData() {
  if (typeof window === "undefined") return "";
  // Telegram Mini App initData (signed)
  // @ts-ignore
  const tg = window.Telegram?.WebApp;
  const initData = tg?.initData || "";
  return initData;
}

export default function BLAccountPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    // @ts-ignore
    window.Telegram?.WebApp?.ready?.();
    // @ts-ignore
    window.Telegram?.WebApp?.expand?.();

    const auth = "tma " + getInitData();
    fetch("/api/bl-account", { headers: { Authorization: auth } })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "load_failed");
        return r.json();
      })
      .then((d) => setEmail(d.email || ""))
      .catch((e) => setErr(String(e?.message || e)))
      .finally(() => setLoaded(true));
  }, []);

  async function onSave(e) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const auth = "tma " + getInitData();
      const r = await fetch("/api/bl-account", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: auth },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.detail?.error || j?.error || "save_failed");

      // Optional UX: close popup or show toast
      // @ts-ignore
      window.Telegram?.WebApp?.showPopup?.({
        title: "Saved",
        message: "BL account saved.",
        buttons: [{ type: "close" }],
      });
      setPassword("");
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-8">
      <h1 className="text-4xl font-extrabold tracking-tight">BL account</h1>
      <p className="mt-2 text-lg">Setup new BL account</p>

      <form onSubmit={onSave} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Email:</label>
          <input
            type="email"
            placeholder="Please enter email"
            className="w-full rounded-xl border p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Password:</label>
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}
        {!loaded && <p className="text-sm opacity-70">Loading…</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl px-5 py-3 shadow font-semibold border w-full"
        >
          {saving ? "Saving…" : "Save account"}
        </button>
      </form>
    </div>
  );
}
