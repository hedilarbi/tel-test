"use client";
import { useState } from "react";

export default function BookedSlotsPage() {
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New booked slot:", { fromTime, toTime, name });

    alert(
      `✅ Booked slot added:\nFrom: ${fromTime}\nTo: ${toTime}\nName: ${name}`
    );
    setFromTime("");
    setToTime("");
    setName("");
  };

  return (
    <div className="font-sans p-5 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-5">Booked slots</h1>
      <h2 className="text-lg mb-5">Add new booked slot</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">FROM:</label>
          <input
            type="datetime-local"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-gray-300"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">TO:</label>
          <input
            type="datetime-local"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-gray-300"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Name (optional):</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-gray-300"
            placeholder="e.g. Morning slot"
          />
        </div>

        <button
          type="submit"
          className="py-3 px-5 bg-[#0088cc] text-white text-base font-medium border-none rounded-lg cursor-pointer w-full"
        >
          Add slot
        </button>
      </form>
    </div>
  );
}
