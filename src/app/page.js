"use client"; // si tu es en app router Next 13+
import { useState, useEffect } from "react";

export default function Home() {
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    // Récupère l'objet Telegram
    if (typeof window !== "undefined") {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready(); // indique que ton app est prête
        tg.MainButton.text = "✅ Add slot";
        tg.MainButton.show();

        tg.MainButton.onClick(() => {
          // Prépare les données
          const data = {
            from: fromTime,
            to: toTime,
            name: name,
          };
          // Envoie au bot
          tg.sendData(JSON.stringify(data));
        });
      }
    }
  }, [fromTime, toTime, name]);

  return (
    <main style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Booked slots</h1>
      <p>Add new booked slot</p>

      <label>From:</label>
      <input
        type="datetime-local"
        value={fromTime}
        onChange={(e) => setFromTime(e.target.value)}
        style={{ display: "block", marginBottom: 10, width: "100%" }}
      />

      <label>To:</label>
      <input
        type="datetime-local"
        value={toTime}
        onChange={(e) => setToTime(e.target.value)}
        style={{ display: "block", marginBottom: 10, width: "100%" }}
      />

      <label>Name (optional):</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ display: "block", marginBottom: 20, width: "100%" }}
      />

      <p style={{ color: "gray" }}>
        When you click the Telegram main button, the slot will be sent.
      </p>
    </main>
  );
}
