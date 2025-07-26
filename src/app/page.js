"use client";
import { useState } from "react";

export default function BookedSlotsPage() {
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // 👉 Ici tu peux envoyer la requête vers ton backend ou ton bot
    console.log("New booked slot:", { fromTime, toTime, name });

    alert(
      `✅ Booked slot added:\nFrom: ${fromTime}\nTo: ${toTime}\nName: ${name}`
    );
    setFromTime("");
    setToTime("");
    setName("");
  };

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: "20px",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{ fontSize: "26px", fontWeight: "bold", marginBottom: "20px" }}
      >
        Booked slots
      </h1>
      <h2 style={{ fontSize: "18px", marginBottom: "20px" }}>
        Add new booked slot
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>FROM:</label>
          <input
            type="datetime-local"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>TO:</label>
          <input
            type="datetime-local"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>
            Name (optional):
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
            placeholder="e.g. Morning slot"
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "12px 20px",
            backgroundColor: "#0088cc",
            color: "#fff",
            fontSize: "16px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Add slot
        </button>
      </form>
    </div>
  );
}
