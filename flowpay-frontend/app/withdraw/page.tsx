"use client";

import { useState, useEffect } from "react";

import API_URL from "@/lib/api";

export default function Withdraw() {
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  const requestWithdraw = async () => {
    const token =
      localStorage.getItem("token");

    await fetch(
      `${API_URL}/withdraw`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            token ?? undefined,
        },

        body: JSON.stringify({
          amount,
        }),
      }
    );

    alert("Withdrawal requested ✅");
  };

  return (
    <div
      style={{
        padding: 20,
        color: "white",
        minHeight: "100vh",
        background: "#0f172a",
      }}
    >
      <h1>Withdraw</h1>

      <br />

      <input
        type="number"
        placeholder="Enter amount"
        onChange={(e) =>
          setAmount(
            Number(e.target.value)
          )
        }
        style={{
          padding: 12,
          borderRadius: 10,
          border: "none",
          width: 250,
        }}
      />

      <br />
      <br />

      <button
        onClick={requestWithdraw}
        style={{
          padding: 12,
          borderRadius: 10,
          border: "none",
          background: "#2563eb",
          color: "white",
          cursor: "pointer",
        }}
      >
        Request Withdraw
      </button>
    </div>
  );
}