"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const token =
      localStorage.getItem("token");

    const headers: HeadersInit = {
      "Content-Type":
        "application/json",
    };

    if (token) {
      headers["Authorization"] =
        `Bearer ${token}`;
    }

    const res = await fetch(
      `${API_URL}/admin/users`,
      {
        headers,
      }
    );

    const data = await res.json();

    setUsers(data || []);
  };

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        padding: 30,
        color: "white",
      }}
    >
      <h1>🛠 Admin Dashboard</h1>

      <br />

      {users.map((user, index) => (
        <div
          key={index}
          style={{
            background: "#111827",
            padding: 20,
            borderRadius: 15,
            marginBottom: 15,
          }}
        >
          <p>
            <strong>Email:</strong>{" "}
            {user.email}
          </p>

          <p>
            <strong>Balance:</strong> $
            {user.balance}
          </p>
        </div>
      ))}
    </div>
  );
}