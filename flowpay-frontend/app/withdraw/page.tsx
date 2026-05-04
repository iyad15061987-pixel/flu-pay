"use client";

import { useState, useEffect } from "react";

export default function Withdraw() {
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  const requestWithdraw = async () => {
    const token = localStorage.getItem("token");

    await fetch("http://localhost:5000/withdraw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ amount }),
    });

    alert("Withdrawal requested ✅");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Withdraw</h1>

      <input
        type="number"
        placeholder="Enter amount"
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      <br /><br />

      <button onClick={requestWithdraw}>
        Request Withdraw
      </button>
    </div>
  );
}