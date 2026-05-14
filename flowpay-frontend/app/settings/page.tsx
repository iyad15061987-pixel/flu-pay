"use client";

import { useState } from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

export default function SettingsPage() {
  const [currency, setCurrency] =
    useState("USD");

  const updateCurrency =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const userId =
          localStorage.getItem(
            "userId"
          );

        const res =
          await fetch(
            `${API_URL}/update-currency`,
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
                currency,
              }),
            }
          );

        const data =
          await res.json();

        alert(data.message);

      } catch (err) {
        alert("Server error");
      }
    };

  const logout = () => {
    localStorage.clear();

    window.location.href =
      "/login";
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
          padding: 40,
          width: "100%",
          color: "white",
        }}
      >
        <h1>
          ⚙ Settings
        </h1>

        <br />

        <div
          style={{
            background:
              "#111827",
            padding: 30,
            borderRadius: 20,
            maxWidth: 500,
          }}
        >
          <h2>
            💱 Currency
          </h2>

          <br />

          <select
            value={currency}
            onChange={(e) =>
              setCurrency(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: 15,
              borderRadius: 10,
              marginBottom: 15,
            }}
          >
            <option>
              USD
            </option>

            <option>
              EUR
            </option>

            <option>
              GBP
            </option>
          </select>

          <button
            onClick={
              updateCurrency
            }
            style={{
              width: "100%",
              padding: 15,
              background:
                "#2563eb",
              border: "none",
              borderRadius: 10,
              color: "white",
              cursor: "pointer",
              marginBottom: 20,
            }}
          >
            Save Currency
          </button>

          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: 15,
              border: "none",
              borderRadius: 10,
              background:
                "#dc2626",
              color: "white",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}