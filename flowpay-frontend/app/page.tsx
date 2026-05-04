"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(10);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) {
      setUserId(id);

      fetch(`http://localhost:5000/balance/${id}`)
        .then(res => res.json())
        .then(data => setBalance(data.balance));
    }
  }, []);

  const saveEmail = async () => {
    await fetch("http://localhost:5000/save-paypal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        email: paypalEmail,
      }),
    });

    alert("Saved ✅");
  };

  const addMoney = async () => {
    await fetch("http://localhost:5000/add-money", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, amount }),
    });

    window.location.reload();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <h2>Balance: ${balance}</h2>

      <h3>Set PayPal Email</h3>
      <input
        type="text"
        placeholder="your@email.com"
        onChange={(e) => setPaypalEmail(e.target.value)}
      />
      <button onClick={saveEmail}>Save</button>

      <hr />

      <h3>Add Money (Test)</h3>
      <input
        type="number"
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button onClick={addMoney}>Add</button>
    </div>
  );
}