"use client";

import { useState } from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

export default function SettingsPage() {
  const [currency, setCurrency] =
    useState("USD");

  const [theme, setTheme] =
    useState(
      localStorage.getItem(
        "theme"
      ) || "dark"
    );

  const [
    oldPassword,
    setOldPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

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

  const saveTheme = () => {
    localStorage.setItem(
      "theme",
      theme
    );

    alert(
      "Theme updated"
    );

    window.location.reload();
  };

  const changePassword =
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
            `${API_URL}/change-password`,
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
                oldPassword,
                newPassword,
              }),
            }
          );

        const data =
          await res.json();

        alert(data.message);

        setOldPassword("");

        setNewPassword("");

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

        background:
          localStorage.getItem(
            "theme"
          ) === "light"
            ? "#f3f4f6"
            : "#0f172a",

        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <div
        style={{
          marginLeft: 250,

          padding: 40,

          width: "100%",

          color:
            localStorage.getItem(
              "theme"
            ) === "light"
              ? "#111827"
              : "white",
        }}
      >
        <h1>
          ⚙ Settings
        </h1>

        <br />

        <div
          style={{
            background:
              localStorage.getItem(
                "theme"
              ) === "light"
                ? "white"
                : "#111827",

            padding: 30,

            borderRadius: 20,

            maxWidth: 500,

            boxShadow:
              "0 0 10px rgba(0,0,0,0.1)",
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

          <br />
          <br />

          <h2>
            🌙 Theme
          </h2>

          <br />

          <select
            value={theme}
            onChange={(e) =>
              setTheme(
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
            <option value="dark">
              Dark
            </option>

            <option value="light">
              Light
            </option>
          </select>

          <button
            onClick={saveTheme}
            style={{
              width: "100%",
              padding: 15,
              background:
                "#7c3aed",
              border: "none",
              borderRadius: 10,
              color: "white",
              cursor: "pointer",
              marginBottom: 20,
            }}
          >
            Save Theme
          </button>

          <br />
          <br />

          <h2>
            🔐 Change Password
          </h2>

          <br />

          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) =>
              setOldPassword(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: 15,
              borderRadius: 10,
              border: "none",
              marginBottom: 15,
            }}
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: 15,
              borderRadius: 10,
              border: "none",
              marginBottom: 15,
            }}
          />

          <button
            onClick={
              changePassword
            }
            style={{
              width: "100%",
              padding: 15,
              background:
                "#16a34a",
              border: "none",
              borderRadius: 10,
              color: "white",
              cursor: "pointer",
              marginBottom: 20,
            }}
          >
            Change Password
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