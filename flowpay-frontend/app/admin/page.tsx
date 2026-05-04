"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch("http://localhost:5000/admin", {
      headers: {
        Authorization: token,
      },
    })
      .then(res => res.json())
      .then(setData);
  }, []);

  const approve = async (id: string) => {
    const token = localStorage.getItem("token");

    await fetch("http://localhost:5000/approve-withdraw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ id }),
    });

    alert("Approved ✅");
    window.location.reload();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin</h1>

      {data.map((w) => (
        <div key={w._id}>
          <p>User: {w.userId}</p>
          <p>Amount: {w.amount}</p>
          <p>Email: {w.paypalEmail}</p>
          <p>Status: {w.status}</p>

          {w.status === "pending" && (
            <button onClick={() => approve(w._id)}>
              Approve
            </button>
          )}

          <hr />
        </div>
      ))}
    </div>
  );
}