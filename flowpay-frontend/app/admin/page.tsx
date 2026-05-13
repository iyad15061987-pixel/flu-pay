"use client";

import { useEffect, useState } from "react";
import API_URL from "@/lib/api";

interface User {
  _id: string;
  email: string;
  balance: number;
  role: string;
  frozen: boolean;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    checkAdmin();
    loadUsers();
  }, []);

  const checkAdmin = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      window.location.href =
        "/login";

      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await res.json();

      if (
        data.role !== "admin"
      ) {
        alert("Access denied");

        window.location.href =
          "/dashboard";
      }

    } catch (err) {
      alert("Server error");
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(
        `${API_URL}/users`
      );

      const data =
        await res.json();

      setUsers(data);

    } catch (err) {
      console.log(err);
    }
  };

  const addBalance = async (
    userId: string
  ) => {
    const amount = prompt(
      "Enter amount"
    );

    if (!amount) return;

    try {
      const token =
        localStorage.getItem(
          "token"
        );

      await fetch(
        `${API_URL}/add-balance`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            userId,
            amount,
          }),
        }
      );

      alert(
        "Balance added successfully"
      );

      loadUsers();

    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div
      style={{
        padding: 30,
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1>
        🛡 Admin Dashboard
      </h1>

      <br />

      {users.map((user) => (
        <div
          key={user._id}
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
            <strong>Balance:</strong>{" "}
            ${user.balance}
          </p>

          <p>
            <strong>Role:</strong>{" "}
            {user.role}
          </p>

          <p>
            <strong>Frozen:</strong>{" "}
            {user.frozen
              ? "Yes"
              : "No"}
          </p>

          <button
            onClick={() =>
              addBalance(
                user._id
              )
            }
            style={{
              marginTop: 15,
              padding: 12,
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Add Balance
          </button>
        </div>
      ))}
    </div>
  );
}