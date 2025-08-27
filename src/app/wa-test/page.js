// pages/wa-test.js
"use client";
import Script from "next/script";
import Head from "next/head";
import { useEffect, useMemo } from "react";

export default function WATest() {
  const tg = useMemo(
    () => (typeof window !== "undefined" ? window.Telegram?.WebApp : null),
    []
  );
  useEffect(() => {
    if (!tg) return;
    tg.ready();
    tg.expand();
    tg.MainButton.setText("Send ping");
    tg.MainButton.show();
    const handler = () => {
      tg.sendData(JSON.stringify({ kind: "ping", ts: Date.now() }));
      setTimeout(() => tg.close(), 150);
    };
    tg.MainButton.onClick(handler);
    return () => tg.MainButton.offClick(handler);
  }, [tg]);

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <Head>
        <title>WA Test</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ padding: 16, fontFamily: "ui-sans-serif" }}>
        Press the MainButton to send <b>ping</b> to your bot.
      </div>
    </>
  );
}
