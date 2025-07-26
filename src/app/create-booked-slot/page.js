import { useEffect, useState } from "react";

export default function BookedSlotsPage() {
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (!telegramId) {
      alert("Impossible de récupérer ton ID Telegram.");
      return;
    }

    const payload = {
      telegram_id: telegramId,
      from: fromTime,
      to: toTime,
      name: name,
    };
    console.log("New booked slot:", payload);
    try {
      //   const res = await fetch("/api/add-slot", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(payload),
      //   });

      if (res.ok) {
        alert("✅ Slot ajouté !");
        window.Telegram?.WebApp?.close();
      } else {
        const txt = await res.text();
        alert("❌ Erreur: " + txt);
      }
    } catch (err) {
      alert("❌ Erreur réseau: " + err.message);
    }
  };

  return (
    <div className="font-sans p-6 max-w-md mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6">Booked slots</h1>
      <h2 className="text-lg mb-6">Add new booked slot</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-2 text-sm font-medium">FROM:</label>
          <input
            type="datetime-local"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">TO:</label>
          <input
            type="datetime-local"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Name (optional):
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Morning slot"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
        >
          Add slot
        </button>
      </form>
    </div>
  );
}
