"use client";

import { useEffect, useState } from "react";
import API_URL from "@/lib/api";

export default function ProfilePage() {
  const [user, setUser] =
    useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const token =
      localStorage.getItem("token");

    const res = await fetch(
      `${API_URL}/me`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    const data =
      await res.json();

    setUser(data);
  };

  if (!user) {
    return (
      <div
        style={{
          padding: 40,
          color: "white",
          background:
            "#0f172a",
          minHeight:
            "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 40,
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1>
        👤 Profile
      </h1>

      <br />

      <div
        style={{
          background:
            "#111827",
          padding: 30,
          borderRadius: 20,
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

        <p>
          <strong>Total Revenue:</strong>{" "}
          ${user.revenue || 0}
        </p>
      </div>
    </div>
  );
}