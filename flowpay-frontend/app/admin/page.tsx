"use client";

import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);

  const [transactions, setTransactions] =
    useState<any[]>([]);

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    loadUsers(token);

    loadTransactions(token);

  }, []);

  const loadUsers = async (
    token: string
  ) => {
    const res = await fetch(
      "import API_URL from "@/lib/api";/admin/users",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setUsers(data || []);
  };

  const loadTransactions = async (
    token: string
  ) => {
    const res = await fetch(
      "import API_URL from "@/lib/api";/admin/transactions",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setTransactions(data || []);
  };

  return (
    <div
      style={{
        display: "flex",
        background: "#0f172a",
        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <div
        style={{
          marginLeft: 250,
          width: "100%",
        }}
      >
        <Navbar />

        <div
          style={{
            padding: 30,
            color: "white",
          }}
        >
          <h1>🛠 Admin Dashboard</h1>

          <br />
          <br />

          {/* ===== USERS ===== */}

          <div
            style={{
              background: "#111827",
              padding: 25,
              borderRadius: 20,
              marginBottom: 30,
            }}
          >
            <h2>👥 Users</h2>

            <br />

            {users.map((user, index) => (
              <div
                key={index}
                style={{
                  background: "#1f2937",
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

          {/* ===== TRANSACTIONS ===== */}

          <div
            style={{
              background: "#111827",
              padding: 25,
              borderRadius: 20,
            }}
          >
            <h2>📜 All Transactions</h2>

            <br />

            {transactions.map(
              (tx, index) => (
                <div
                  key={index}
                  style={{
                    background: "#1f2937",
                    padding: 20,
                    borderRadius: 15,
                    marginBottom: 15,
                  }}
                >
                  <p>
                    <strong>From:</strong>{" "}
                    {tx.fromEmail}
                  </p>

                  <p>
                    <strong>To:</strong>{" "}
                    {tx.toEmail}
                  </p>

                  <p>
                    <strong>Amount:</strong> $
                    {tx.amount}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(
                      tx.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}