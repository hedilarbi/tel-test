// pages/create-booked-slot.js
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Script from "next/script";

// --- b64url decode helper to read ?s= param ---
function b64urlDecode(b64url) {
  if (!b64url) return "";
  const pad = "=".repeat((4 - (b64url.length % 4)) % 4);
  const base = (b64url + pad).replace(/-/g, "+").replace(/_/g, "/");
  if (typeof window !== "undefined") {
    return atob(base);
  }
  return Buffer.from(base, "base64").toString("utf-8");
}

// dd/mm/yyyy HH:MM (local)
function formatDDMMYYYY_HHMM(value) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const HH = pad(d.getHours());
  const MM = pad(d.getMinutes());
  return `${dd}/${mm}/${yyyy} ${HH}:${MM}`;
}

export default function CreateBookedSlot() {
  const [slots, setSlots] = useState([]);
  const [fromVal, setFromVal] = useState("");
  const [toVal, setToVal] = useState("");
  const [name, setName] = useState("");
  const [isReady, setIsReady] = useState(false);

  // Parse initial slots from ?s= (set by the bot)
  useEffect(() => {
    try {
      const qs = new URLSearchParams(window.location.search);
      const s = qs.get("s");
      if (!s) return;
      const decoded = JSON.parse(b64urlDecode(s));
      const arr = Array.isArray(decoded?.slots) ? decoded.slots : [];
      setSlots(arr);
    } catch (e) {
      console.warn("Failed to parse slots param:", e);
    }
  }, []);

  const tg = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.Telegram?.WebApp || null;
  }, []);

  // Setup TG UI and main button
  useEffect(() => {
    if (!tg) return;

    tg.ready();
    tg.expand();

    // Show main button for creating slots
    tg.MainButton.setText("Save Booked Slot");
    tg.MainButton.show();

    // Handle main button click
    const handleMainButton = () => {
      if (!fromVal || !toVal) {
        tg.showAlert("Please fill both dates.");
        return;
      }

      const fromTxt = formatDDMMYYYY_HHMM(fromVal);
      const toTxt = formatDDMMYYYY_HHMM(toVal);

      if (new Date(fromVal) >= new Date(toVal)) {
        tg.showAlert("End time must be after start time.");
        return;
      }

      const payload = {
        kind: "create_booked_slot",
        from: fromTxt,
        to: toTxt,
        name: name?.trim() || null,
      };

      try {
        tg.HapticFeedback?.impactOccurred("medium");
      } catch {}

      tg.sendData(JSON.stringify(payload));
    };

    tg.MainButton.onClick(handleMainButton);
    setIsReady(true);

    // Cleanup
    return () => {
      tg.MainButton.offClick(handleMainButton);
      tg.MainButton.hide();
    };
  }, [tg, fromVal, toVal, name]);

  // Update main button state based on form validity
  useEffect(() => {
    if (!tg || !isReady) return;

    const isFormValid = fromVal && toVal && new Date(fromVal) < new Date(toVal);

    if (isFormValid) {
      tg.MainButton.enable();
      tg.MainButton.color = tg.themeParams.button_color || "#3390ec";
    } else {
      tg.MainButton.disable();
      tg.MainButton.color = "#aaaaaa";
    }
  }, [tg, fromVal, toVal, isReady]);

  // --- DELETE ---
  const onDelete = useCallback(
    (id) => {
      if (!tg) {
        alert("Open this page from Telegram.");
        return;
      }

      tg.showConfirm(
        "Are you sure you want to delete this slot?",
        (confirmed) => {
          if (confirmed) {
            const payload = { kind: "delete_booked_slot", id };
            try {
              tg.HapticFeedback?.impactOccurred("light");
            } catch {}
            tg.sendData(JSON.stringify(payload));
          }
        }
      );
    },
    [tg]
  );

  return (
    <>
      {/* Telegram WebApp SDK */}
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <Head>
        <title>Booked Slots</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          body { 
            background-color: var(--tg-theme-bg-color, #ffffff); 
            color: var(--tg-theme-text-color, #000000);
            margin: 0;
            padding: 0;
          }
        `}</style>
      </Head>

      <div
        className="min-h-screen text-slate-900"
        style={{
          backgroundColor: "var(--tg-theme-bg-color, #f8fafc)",
          color: "var(--tg-theme-text-color, #1e293b)",
        }}
      >
        <div className="mx-auto w-full max-w-lg px-4 py-6">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">
            Booked Slots
          </h1>
          <p className="text-sm opacity-70 mb-6">
            Manage your blocked periods: create new or delete existing ones.
          </p>

          {/* Existing slots */}
          <div
            className="rounded-xl border p-4 shadow-sm mb-6"
            style={{
              backgroundColor: "var(--tg-theme-secondary-bg-color, #ffffff)",
              borderColor: "var(--tg-theme-hint-color, #e2e8f0)",
            }}
          >
            <h2 className="text-base font-medium mb-3">Your Slots</h2>
            {slots.length === 0 ? (
              <p className="text-sm opacity-60">No slots yet.</p>
            ) : (
              <div className="space-y-3">
                {slots.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start justify-between rounded-lg border p-3"
                    style={{
                      borderColor: "var(--tg-theme-hint-color, #e2e8f0)",
                      backgroundColor: "var(--tg-theme-bg-color, #ffffff)",
                    }}
                  >
                    <div className="text-sm flex-1">
                      <div className="font-medium">{s.name || "—"}</div>
                      <div className="mt-0.5 opacity-80">
                        {s.from} → {s.to}
                      </div>
                      <div className="mt-0.5 text-xs opacity-50">
                        ID: {s.id}
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(s.id)}
                      className="ml-3 rounded-md border px-3 py-1.5 text-xs font-medium hover:opacity-80 active:opacity-60"
                      style={{
                        borderColor:
                          "var(--tg-theme-destructive-text-color, #dc2626)",
                        color:
                          "var(--tg-theme-destructive-text-color, #dc2626)",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create form */}
          <div
            className="space-y-4 rounded-xl border p-4 shadow-sm"
            style={{
              backgroundColor: "var(--tg-theme-secondary-bg-color, #ffffff)",
              borderColor: "var(--tg-theme-hint-color, #e2e8f0)",
            }}
          >
            <h2 className="text-base font-medium">New Booked Slot</h2>

            <div>
              <label className="mb-1 block text-sm font-medium">From</label>
              <input
                type="datetime-local"
                value={fromVal}
                onChange={(e) => setFromVal(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--tg-theme-bg-color, #ffffff)",
                  borderColor: "var(--tg-theme-hint-color, #d1d5db)",
                  color: "var(--tg-theme-text-color, #000000)",
                }}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">To</label>
              <input
                type="datetime-local"
                value={toVal}
                onChange={(e) => setToVal(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--tg-theme-bg-color, #ffffff)",
                  borderColor: "var(--tg-theme-hint-color, #d1d5db)",
                  color: "var(--tg-theme-text-color, #000000)",
                }}
                required
              />
              {fromVal && toVal && new Date(fromVal) >= new Date(toVal) && (
                <p
                  className="mt-1 text-xs"
                  style={{
                    color: "var(--tg-theme-destructive-text-color, #dc2626)",
                  }}
                >
                  End time must be after start time.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. School run"
                className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--tg-theme-bg-color, #ffffff)",
                  borderColor: "var(--tg-theme-hint-color, #d1d5db)",
                  color: "var(--tg-theme-text-color, #000000)",
                }}
              />
            </div>

            <p className="pt-2 text-center text-xs opacity-50">
              Use the button below to save your booked slot
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
