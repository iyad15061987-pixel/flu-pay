"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    // 🔍 نتحقق هل المستخدم Admin
    fetch("http://localhost:5000/admin", {
      headers: { Authorization: token },
    })
      .then(res => {
        if (res.status === 403) {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      });

    // 💰 جلب الرصيد
    fetch("http://localhost:5000/balance", {
      headers: { Authorization: token },
    })
      .then(res => res.json())
      .then(data => setBalance(data.balance));
  }, []);

  const addMoney = async () => {
    const token = localStorage.getItem("token");

    await fetch("http://localhost:5000/add-money", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ amount }),
    });

    alert("Added ✅");
    window.location.reload();
  };

  const saveEmail = async () => {
    const token = localStorage.getItem("token");

    await fetch("http://localhost:5000/save-paypal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ email: paypalEmail }),
    });

    alert("Saved ✅");
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>

      <button onClick={logout}>Logout</button>

      <h2>Balance: ${balance}</h2>

      {/* 👑 يظهر فقط للأدمن */}
      {isAdmin && (
        <button onClick={() => (window.location.href = "/admin")}>
          Go to Admin Panel 👑
        </button>
      )}

      <hr />

      <h3>Set PayPal Email</h3>
      <input
        placeholder="email"
        onChange={(e) => setPaypalEmail(e.target.value)}
      />
      <button onClick={saveEmail}>Save</button>

      <hr />

      <h3>Add Money</h3>
      <input
        type="number"
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button onClick={addMoney}>Add</button>
    </div>
  );
}